const express = require('express');
const mongoose = require('mongoose');
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

        // Populate enrollment count for each course
        const coursesWithStats = await Promise.all(courses.map(async (course) => {
            const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });
            const courseData = course.toObject ? course.toObject() : course;
            return { ...courseData, enrollmentCount };
        }));

        res.json({ success: true, data: coursesWithStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
    try {
        let course;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            course = await Course.findById(req.params.id);
        } else {
            course = await Course.collection.findOne({ _id: req.params.id });
        }

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const enrollmentCount = await Enrollment.countDocuments({ courseId: req.params.id });
        const courseData = course.toObject ? course.toObject() : course;

        res.json({ success: true, data: { ...courseData, enrollmentCount } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Increment course views
router.post('/:id/view', async (req, res) => {
    try {
        let course;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            course = await Course.findByIdAndUpdate(
                req.params.id,
                { $inc: { views: 1 } },
                { new: true }
            );
        }

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        res.json({ success: true, data: { views: course.views } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get course rating summary
router.get('/:id/rating', async (req, res) => {
    try {
        const reviews = await Review.find({ courseId: req.params.id });

        if (reviews.length === 0) {
            return res.json({
                success: true,
                data: {
                    averageRating: 0,
                    totalReviews: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                }
            });
        }

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

        // Calculate distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                averageRating,
                totalReviews: reviews.length,
                distribution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create course (instructor/admin only)
router.post('/', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        console.log('Create course request received:', req.body);
        console.log('User creating course:', req.user?.email, 'Role:', req.user?.role);

        const courseData = {
            ...req.body,
            instructorId: req.user._id.toString()
        };

        const course = new Course(courseData);
        await course.save();

        console.log('Course created successfully:', course._id);
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        console.error('Course creation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update course
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        let course;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            course = await Course.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } else {
            await Course.collection.updateOne(
                { _id: req.params.id },
                { $set: { ...req.body, updatedAt: new Date() } }
            );
            course = await Course.collection.findOne({ _id: req.params.id });
        }

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
        let course;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            course = await Course.findByIdAndDelete(req.params.id);
        } else {
            // Check existence first for proper 404
            course = await Course.collection.findOne({ _id: req.params.id });
            if (course) {
                await Course.collection.deleteOne({ _id: req.params.id });
            }
        }

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
        let course;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            course = await Course.findByIdAndUpdate(
                req.params.id,
                { $inc: { views: 1 } },
                { new: true }
            );
        } else {
            await Course.collection.updateOne(
                { _id: req.params.id },
                { $inc: { views: 1 } }
            );
            course = await Course.collection.findOne({ _id: req.params.id });
        }

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
