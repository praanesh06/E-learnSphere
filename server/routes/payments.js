const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Create Order (Mock implementation for Payment Link)
router.post('/create-order', auth, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.userId || req.user._id;

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
            currency: 'INR',
            status: 'pending',
            paymentMethod: 'payment_link',
            metadata: { type: 'manual_verification' }
        });

        await payment.save();

        res.json({
            success: true,
            data: {
                paymentId: payment._id,
                amount: course.price,
                currency: 'INR',
                orderId: `order_${payment._id}`, // Mock Order ID
                keyId: 'mock_key',
                courseTitle: course.title
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify Payment and Enroll (Mock implementation)
router.post('/verify', auth, async (req, res) => {
    try {
        const { paymentId } = req.body;
        const userId = req.user.userId || req.user._id;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment record not found' });
        }

        // In a real app, we would verify with Razorpay API here.
        // For this Demo Link integration, we trust the user's manual confirmation.

        // Update payment status
        payment.status = 'completed';
        payment.transactionId = `TXN_${Date.now()}`;
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
                enrollment,
                message: 'Payment verified and enrolled successfully!'
            }
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;

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
