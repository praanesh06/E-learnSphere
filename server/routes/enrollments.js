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
                // Get all lessons to verify existence and count. Use robust query matching.
                let lessons = await Lesson.find({ courseId: course._id }).select('_id');
                if (lessons.length === 0) {
                    lessons = await Lesson.find({ courseId: course._id.toString() }).select('_id');
                }
                const lessonIds = new Set(lessons.map(l => l._id.toString()));
                const lessonsCount = lessons.length;

                // Filter out completed lessons that no longer exist (cleanup ghost data)
                const validCompletedLessons = (enrollment.completedLessons || [])
                    .filter(id => lessonIds.has(id.toString()));

                // Self-repair: Check if progress matches VALID completed lessons
                const completedCount = validCompletedLessons.length;
                const calculatedProgress = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0;

                // Check if we need to repair either the progress OR the completedLessons list
                const progressMismatch = Math.abs((enrollment.progress || 0) - calculatedProgress) > 1;
                const completedListMismatch = validCompletedLessons.length !== (enrollment.completedLessons || []).length;

                if (progressMismatch || completedListMismatch) {
                    // Update in DB (async, don't wait)
                    Enrollment.findByIdAndUpdate(enrollment._id, {
                        progress: calculatedProgress,
                        completedLessons: validCompletedLessons, // Save the cleaned list
                        status: calculatedProgress >= 100 ? 'completed' : (calculatedProgress > 0 ? 'in_progress' : 'not_started')
                    }).catch(err => console.error('Error auto-repairing progress:', err));

                    // Update local object for response
                    enrollment.progress = calculatedProgress;
                    enrollment.completedLessons = validCompletedLessons;
                }

                enrollment.course = { ...course, lessonsCount };
            }
        }

        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all enrollments for multiple courses (for instructor reporting)
router.post('/courses', auth, async (req, res) => {
    try {
        const { courseIds } = req.body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ success: false, error: 'courseIds array required' });
        }

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();

        // Populate user info for each enrollment
        const User = require('../models/User');
        const Course = require('../models/Course');

        const userIds = [...new Set(enrollments.map(e => e.userId))];
        const users = await User.find({ _id: { $in: userIds } }).select('_id name email').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        // Also get course titles
        const courses = await Course.find({ _id: { $in: courseIds } }).select('_id title').lean();
        const courseMap = new Map(courses.map(c => [c._id.toString(), c]));

        // Attach user and course info to enrollments
        const enrichedEnrollments = enrollments.map(e => {
            const user = userMap.get(e.userId);
            const course = courseMap.get(e.courseId);
            return {
                ...e,
                user: user ? { _id: user._id, name: user.name, email: user.email } : null,
                course: course ? { _id: course._id, title: course.title } : null
            };
        });

        res.json({ success: true, data: enrichedEnrollments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get enrollments by course (with user info for reporting)
router.get('/course/:courseId', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ courseId: req.params.courseId }).lean();

        // Populate user info for each enrollment
        const User = require('../models/User');
        const userIds = [...new Set(enrollments.map(e => e.userId))];
        const users = await User.find({ _id: { $in: userIds } }).select('_id name email').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        // Attach user info to enrollments
        const enrichedEnrollments = enrollments.map(e => {
            const user = userMap.get(e.userId);
            return {
                ...e,
                user: user ? { _id: user._id, name: user.name, email: user.email } : null
            };
        });

        res.json({ success: true, data: enrichedEnrollments });
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

        console.log('Lesson complete request:', { courseId, lessonId, completedLessonIds, userId });

        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            console.log('Enrollment not found for user', userId, 'course', courseId);
            return res.status(404).json({ success: false, error: 'Enrollment not found' });
        }

        // Update completed lessons array
        enrollment.completedLessons = completedLessonIds || [];

        // Get total lessons for course - try multiple courseId formats
        let totalLessons = await Lesson.countDocuments({ courseId });
        if (totalLessons === 0) {
            // Try with courseId as ObjectId string format
            totalLessons = await Lesson.countDocuments({ courseId: courseId.toString() });
        }
        const completedCount = enrollment.completedLessons.length;

        console.log('Progress calculation:', { courseId, totalLessons, completedCount, completedLessons: enrollment.completedLessons });

        enrollment.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        console.log('New progress:', enrollment.progress);

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
        console.log('Saved enrollment:', enrollment);
        res.json({ success: true, data: enrollment });
    } catch (error) {
        console.error('Lesson complete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Invite users to course (Enroll by email)
router.post('/invite', auth, async (req, res) => {
    try {
        const { courseId, emails } = req.body;

        if (!courseId || !emails || !Array.isArray(emails)) {
            return res.status(400).json({ success: false, error: 'Invalid request' });
        }

        const successEmails = [];
        const failedEmails = [];
        const User = require('../models/User');

        for (const email of emails) {
            try {
                // Find user by email
                const user = await User.findOne({ email });

                if (!user) {
                    failedEmails.push(`${email} (User not found)`);
                    continue;
                }

                // Check if already enrolled
                const existing = await Enrollment.findOne({ userId: user._id, courseId });
                if (existing) {
                    failedEmails.push(`${email} (Already enrolled)`);
                    continue;
                }

                // Create enrollment
                await Enrollment.create({
                    userId: user._id,
                    courseId,
                    status: 'not_started',
                    progress: 0,
                    enrolledAt: new Date(),
                    completedLessons: [],
                    totalPoints: 0
                });

                successEmails.push(email);
            } catch (err) {
                console.error(`Error enrolling ${email}:`, err);
                failedEmails.push(`${email} (Error)`);
            }
        }

        res.json({
            success: true,
            data: { success: successEmails, failed: failedEmails }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
