const express = require('express');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get lessons by course
router.get('/course/:courseId', async (req, res) => {
    try {
        const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ order: 1 });
        res.json({ success: true, data: lessons });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single lesson
router.get('/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ success: false, error: 'Lesson not found' });
        }
        res.json({ success: true, data: lesson });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create lesson
router.post('/', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { courseId } = req.body;

        // Get current lesson count for order
        const lessonCount = await Lesson.countDocuments({ courseId });

        const lesson = new Lesson({
            ...req.body,
            order: lessonCount + 1
        });
        await lesson.save();

        // Update course total duration
        await updateCourseDuration(courseId);

        res.status(201).json({ success: true, data: lesson });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update lesson
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!lesson) {
            return res.status(404).json({ success: false, error: 'Lesson not found' });
        }

        // Update course duration if needed
        if (req.body.duration !== undefined) {
            await updateCourseDuration(lesson.courseId);
        }

        res.json({ success: true, data: lesson });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete lesson
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({ success: false, error: 'Lesson not found' });
        }

        // Reorder remaining lessons
        const remainingLessons = await Lesson.find({ courseId: lesson.courseId }).sort({ order: 1 });
        for (let i = 0; i < remainingLessons.length; i++) {
            remainingLessons[i].order = i + 1;
            await remainingLessons[i].save();
        }

        // Update course duration
        await updateCourseDuration(lesson.courseId);

        res.json({ success: true, message: 'Lesson deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reorder lessons
router.post('/reorder', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { lessonIds } = req.body;

        for (let i = 0; i < lessonIds.length; i++) {
            await Lesson.findByIdAndUpdate(lessonIds[i], { order: i + 1 });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper to update course duration
async function updateCourseDuration(courseId) {
    const lessons = await Lesson.find({ courseId });
    const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    await Course.findByIdAndUpdate(courseId, { totalDuration });
}

module.exports = router;
