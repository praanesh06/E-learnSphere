const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const UserPoints = require('../models/UserPoints');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const { auth } = require('../middleware/auth');

// Get user dashboard data (points, recent activities)
router.get('/my', auth, async (req, res) => {
    try {
        const userId = req.user._id.toString();

        // 1. Get User Points
        let points = await UserPoints.findOne({ userId });
        if (!points) {
            points = {
                totalPoints: 0,
                streakDays: 0,
                coursesCompleted: 0,
                quizzesPassed: 0,
                badges: []
            };
        }

        // 2. Get Recent Activities
        // Fetch recent enrollments (started or completed)
        const recentEnrollments = await Enrollment.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean();

        // Fetch recent quiz attempts
        const recentQuizAttempts = await QuizAttempt.find({ userId })
            .sort({ completedAt: -1 })
            .limit(5)
            .lean();

        // Combine and transform to activity format
        let activities = [];

        // Process enrollments
        for (const enrollment of recentEnrollments) {
            const course = await Course.findById(enrollment.courseId);
            if (!course) continue;

            // Course started activity
            if (enrollment.startedAt) {
                activities.push({
                    id: `start-${enrollment._id}`,
                    type: 'enrollment',
                    title: `Started: ${course.title}`,
                    description: 'You started a new course',
                    timestamp: enrollment.startedAt
                });
            }

            // Course completed activity
            if (enrollment.status === 'completed' && enrollment.completedAt) {
                activities.push({
                    id: `comp-${enrollment._id}`,
                    type: 'completion',
                    title: `Completed: ${course.title}`,
                    description: 'You completed a course!',
                    timestamp: enrollment.completedAt
                });
            }
        }

        // Process quiz attempts
        for (const attempt of recentQuizAttempts) {
            const quiz = await Quiz.findById(attempt.quizId);
            if (!quiz) continue;

            activities.push({
                id: `quiz-${attempt._id}`,
                type: 'quiz',
                title: `Quiz Attempt: ${quiz.title}`,
                description: attempt.passed ? `Passed with ${attempt.score}%` : `Scored ${attempt.score}%`,
                timestamp: attempt.completedAt
            });
        }

        // Sort by timestamp descending
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit to 10 most recent
        activities = activities.slice(0, 10);

        res.json({
            success: true,
            data: {
                points,
                activities
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
