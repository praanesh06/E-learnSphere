const express = require('express');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get enrollments for current user with course details
router.get('/my', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user._id.toString() }).lean();

        // Fetch course details manually since schema uses String for IDs
        const courseIds = enrollments.map(e => e.courseId);
        const courses = await require('../models/Course').find({ _id: { $in: courseIds } }).lean();
        const courseMap = new Map(courses.map(c => [c._id.toString(), c]));

        // Attach course details and lesson count
        for (const enrollment of enrollments) {
            const course = courseMap.get(enrollment.courseId);
            if (course) {
                // Get lesson count for progress calculation
                const lessonsCount = await Lesson.countDocuments({ courseId: course._id });
                enrollment.course = { ...course, lessonsCount };
            }
        }

        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get enrollments by course
router.get('/course/:courseId', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ courseId: req.params.courseId });
        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enroll in a course
router.post('/', auth, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id.toString();

        // Check if already enrolled
        const existing = await Enrollment.findOne({ userId, courseId });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Already enrolled' });
        }

        const enrollment = new Enrollment({
            userId,
            courseId,
            status: 'not_started',
            progress: 0,
            enrolledAt: new Date(),
            totalPoints: 0
        });
        await enrollment.save();

        res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update enrollment progress
router.put('/:id/progress', auth, async (req, res) => {
    try {
        const { progress } = req.body;

        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return res.status(404).json({ success: false, error: 'Enrollment not found' });
        }

        enrollment.progress = Math.min(100, Math.max(0, progress));

        // Update status based on progress
        if (enrollment.progress === 0) {
            enrollment.status = 'not_started';
        } else if (enrollment.progress < 100) {
            enrollment.status = 'in_progress';
            if (!enrollment.startedAt) enrollment.startedAt = new Date();
        } else {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();
        }

        await enrollment.save();
        res.json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mark lesson as complete and recalculate progress
router.post('/lesson-complete', auth, async (req, res) => {
    try {
        const { courseId, lessonId, completedLessonIds } = req.body;
        const userId = req.user._id.toString();

        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(404).json({ success: false, error: 'Enrollment not found' });
        }

        // Get total lessons for course
        const totalLessons = await Lesson.countDocuments({ courseId });
        const completedCount = completedLessonIds ? completedLessonIds.length : 0;

        enrollment.progress = Math.round((completedCount / totalLessons) * 100);

        if (enrollment.progress === 0) {
            enrollment.status = 'not_started';
        } else if (enrollment.progress < 100) {
            enrollment.status = 'in_progress';
            if (!enrollment.startedAt) enrollment.startedAt = new Date();
        } else {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();
        }

        await enrollment.save();
        res.json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
