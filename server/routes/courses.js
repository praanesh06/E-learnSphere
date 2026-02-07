const express = require('express');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all courses (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { status, visibility, instructorId } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (visibility) filter.visibility = visibility;
        if (instructorId) filter.instructorId = instructorId;

        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create course (instructor/admin only)
router.post('/', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            instructorId: req.user._id.toString()
        };

        const course = new Course(courseData);
        await course.save();

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update course
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete course
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Delete related lessons
        await Lesson.deleteMany({ courseId: req.params.id });

        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Increment course views
router.post('/:id/view', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get course statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const courseId = req.params.id;

        const enrollments = await Enrollment.find({ courseId });
        const reviews = await Review.find({ courseId });

        const stats = {
            courseId,
            totalParticipants: enrollments.length,
            yetToStart: enrollments.filter(e => e.status === 'not_started').length,
            inProgress: enrollments.filter(e => e.status === 'in_progress').length,
            completed: enrollments.filter(e => e.status === 'completed').length,
            averageProgress: enrollments.length
                ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
                : 0,
            averageRating: reviews.length
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
