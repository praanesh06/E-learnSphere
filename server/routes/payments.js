const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Initiate payment for a course
router.post('/initiate', auth, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.userId;

        // Get course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Check if course requires payment
        if (course.visibility !== 'payment' || course.price <= 0) {
            return res.status(400).json({ success: false, error: 'This course does not require payment' });
        }

        // Check if user already paid
        const existingPayment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (existingPayment) {
            return res.status(400).json({ success: false, error: 'You have already purchased this course' });
        }

        // Create pending payment
        const payment = new Payment({
            userId,
            courseId,
            amount: course.price,
            status: 'pending',
            paymentMethod: 'mock'
        });

        await payment.save();

        res.json({
            success: true,
            data: {
                paymentId: payment._id,
                amount: course.price,
                courseTitle: course.title,
                // In a real implementation, this would include payment gateway details
                mockPaymentUrl: `/api/payments/complete/${payment._id}`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Complete payment (mock implementation)
router.post('/complete/:paymentId', auth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.userId;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        if (payment.userId.toString() !== userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        if (payment.status === 'completed') {
            return res.status(400).json({ success: false, error: 'Payment already completed' });
        }

        // Update payment status
        payment.status = 'completed';
        payment.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await payment.save();

        // Add user to paidUsers in course
        await Course.findByIdAndUpdate(payment.courseId, {
            $addToSet: {
                paidUsers: {
                    userId: userId,
                    paidAt: new Date(),
                    amount: payment.amount
                }
            }
        });

        // Create enrollment
        let enrollment = await Enrollment.findOne({
            userId,
            courseId: payment.courseId
        });

        if (!enrollment) {
            enrollment = new Enrollment({
                userId,
                courseId: payment.courseId,
                status: 'not_started',
                progress: 0,
                completedLessons: []
            });
            await enrollment.save();
        }

        res.json({
            success: true,
            data: {
                payment,
                enrollment,
                message: 'Payment successful! You are now enrolled in the course.'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .populate('courseId', 'title image price');

        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check if user has paid for a course
router.get('/check/:courseId', auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        const payment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        res.json({
            success: true,
            data: {
                hasPaid: !!payment,
                payment: payment || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
