const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get reviews by course
router.get('/course/:courseId', async (req, res) => {
    try {
        const reviews = await Review.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });

        // Populate user info
        const reviewsWithUser = await Promise.all(reviews.map(async (review) => {
            const user = await User.findById(review.userId);
            return {
                ...review.toObject(),
                user: user ? { id: user._id, name: user.name, avatar: user.avatar } : null
            };
        }));

        res.json({ success: true, data: reviewsWithUser });
    } catch (error) {
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

        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
