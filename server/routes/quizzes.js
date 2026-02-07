const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const UserPoints = require('../models/UserPoints');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get quizzes by course
router.get('/course/:courseId', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ courseId: req.params.courseId });
        res.json({ success: true, data: quizzes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single quiz
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }
        res.json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create quiz
router.post('/', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update quiz
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete quiz
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Delete related attempts
        await QuizAttempt.deleteMany({ quizId: req.params.id });

        res.json({ success: true, message: 'Quiz deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add question to quiz
router.post('/:id/questions', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const questionId = require('mongoose').Types.ObjectId().toString();
        const newQuestion = {
            id: questionId,
            text: req.body.text,
            type: req.body.type || 'single',
            options: (req.body.options || []).map((opt, idx) => ({
                id: opt.id || `${questionId}-opt-${idx}`,
                text: opt.text,
                isCorrect: opt.isCorrect || false
            })),
            order: quiz.questions.length + 1
        };

        quiz.questions.push(newQuestion);
        await quiz.save();

        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update question in quiz
router.put('/:id/questions/:questionId', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const questionIndex = quiz.questions.findIndex(q => q.id === req.params.questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        // Update the question
        quiz.questions[questionIndex] = {
            ...quiz.questions[questionIndex].toObject(),
            text: req.body.text || quiz.questions[questionIndex].text,
            type: req.body.type || quiz.questions[questionIndex].type,
            options: req.body.options || quiz.questions[questionIndex].options
        };

        await quiz.save();
        res.json({ success: true, data: quiz.questions[questionIndex] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete question from quiz
router.delete('/:id/questions/:questionId', auth, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const questionIndex = quiz.questions.findIndex(q => q.id === req.params.questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        quiz.questions.splice(questionIndex, 1);

        // Reorder remaining questions
        quiz.questions.forEach((q, idx) => {
            q.order = idx + 1;
        });

        await quiz.save();
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit quiz attempt
router.post('/:id/attempt', auth, async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user._id.toString();
        const { answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Check max attempts
        const attemptCount = await QuizAttempt.countDocuments({ userId, quizId });
        if (attemptCount >= quiz.maxAttempts) {
            return res.status(400).json({ success: false, error: 'Maximum attempts reached' });
        }

        // Calculate score
        let correctCount = 0;
        quiz.questions.forEach(q => {
            const userAnswers = answers[q.id] || [];
            const correctAnswers = q.options.filter(o => o.isCorrect).map(o => o.id);

            if (q.type === 'single') {
                if (userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])) {
                    correctCount++;
                }
            } else {
                const allCorrect = correctAnswers.every(ca => userAnswers.includes(ca)) &&
                    userAnswers.every(ua => correctAnswers.includes(ua));
                if (allCorrect) correctCount++;
            }
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const passed = score >= quiz.passingScore;
        const pointsEarned = passed ? quiz.pointsPerAttempt : 0;

        const attempt = new QuizAttempt({
            userId,
            quizId,
            answers,
            score,
            pointsEarned,
            passed,
            attemptNumber: attemptCount + 1,
            startedAt: new Date(),
            completedAt: new Date()
        });
        await attempt.save();

        // Update user points if passed
        if (pointsEarned > 0) {
            await UserPoints.findOneAndUpdate(
                { userId },
                {
                    $inc: { totalPoints: pointsEarned, quizzesPassed: 1 }
                },
                { upsert: true }
            );
        }

        res.json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quiz attempts
router.get('/:id/attempts', auth, async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = { quizId: req.params.id };
        if (userId) filter.userId = userId;

        const attempts = await QuizAttempt.find(filter).sort({ completedAt: -1 });
        res.json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
