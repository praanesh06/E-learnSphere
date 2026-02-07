const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper function to update cached course rating
async function updateCourseRating(courseId) {
    try {
        const reviews = await Review.find({ courseId });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
            : 0;

        await Course.findByIdAndUpdate(courseId, { averageRating, totalReviews });
    } catch (error) {
        console.error('Failed to update course rating:', error);
    }
}

// Get reviews by course
router.get('/course/:courseId', async (req, res) => {
    try {
        const reviews = await Review.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });

        // Populate user info
        const reviewsWithUser = await Promise.all(reviews.map(async (review) => {
            let user = null;
            try {
                if (review.userId && review.userId.match(/^[0-9a-fA-F]{24}$/)) {
                    user = await User.findById(review.userId);
                }
            } catch (err) {
                console.error('Error fetching user for review:', err);
            }

            return {
                ...review.toObject(),
                user: user ? { id: user._id, name: user.name, avatar: user.avatar } : { name: 'Unknown User', avatar: '' }
            };
        }));

        res.json({ success: true, data: reviewsWithUser });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create review
router.post('/', auth, async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;
        const userId = req.user._id.toString();

        // Check if user already reviewed this course
        const existing = await Review.findOne({ userId, courseId });
        if (existing) {
            return res.status(400).json({ success: false, error: 'You have already reviewed this course' });
        }

        const review = new Review({
            userId,
            courseId,
            rating,
            comment
        });
        await review.save();

        // Update cached course rating
        await updateCourseRating(courseId);

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update review
router.put('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.userId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;
        await review.save();

        // Update cached course rating
        await updateCourseRating(review.courseId);

        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const courseId = review.courseId;
        await review.deleteOne();

        // Update cached course rating
        await updateCourseRating(courseId);

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
