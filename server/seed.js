/**
 * Seed Script for LearnSphere Database
 * Run this script to populate the database with initial data
 * Usage: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');
const UserPoints = require('./models/UserPoints');
const QuizAttempt = require('./models/QuizAttempt');

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Course.deleteMany({});
        await Lesson.deleteMany({});
        await Quiz.deleteMany({});
        await Enrollment.deleteMany({});
        await Review.deleteMany({});
        await UserPoints.deleteMany({});
        await QuizAttempt.deleteMany({});

        console.log('Seeding users...');
        // Seed Users (password will be hashed by pre-save hook)
        const users = await User.create([
            { email: 'admin@learnsphere.com', password: 'password123', name: 'Admin User', role: 'admin' },
            { email: 'instructor@learnsphere.com', password: 'password123', name: 'John Instructor', role: 'instructor' },
            { email: 'learner@learnsphere.com', password: 'password123', name: 'Sarah Learner', role: 'learner' },
            { email: 'learner2@learnsphere.com', password: 'password123', name: 'Mike Student', role: 'learner' }
        ]);

        const [admin, instructor, learner1, learner2] = users;
        console.log(`Created ${users.length} users`);

        console.log('Seeding courses...');
        const courses = await Course.create([
            {
                title: 'Introduction to Web Development',
                description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
                tags: ['Web Development', 'HTML', 'CSS', 'JavaScript'],
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
                website: 'https://webdev-course.com',
                responsiblePerson: instructor._id.toString(),
                visibility: 'everyone',
                status: 'published',
                views: 1250,
                totalDuration: 480,
                instructorId: instructor._id.toString()
            },
            {
                title: 'React Mastery: From Beginner to Pro',
                description: 'Master React.js with hooks, context, and modern best practices.',
                tags: ['React', 'JavaScript', 'Frontend'],
                image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
                visibility: 'signed_in',
                status: 'published',
                views: 890,
                totalDuration: 720,
                instructorId: instructor._id.toString()
            },
            {
                title: 'UI/UX Design Fundamentals',
                description: 'Learn design principles, user research, and prototyping with Figma.',
                tags: ['Design', 'UI/UX', 'Figma'],
                image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
                visibility: 'payment',
                price: 49.99,
                status: 'published',
                views: 650,
                totalDuration: 360,
                instructorId: instructor._id.toString()
            },
            {
                title: 'Python for Data Science',
                description: 'Analyze data and build machine learning models with Python.',
                tags: ['Python', 'Data Science', 'Machine Learning'],
                image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
                visibility: 'everyone',
                status: 'draft',
                views: 0,
                totalDuration: 600,
                instructorId: instructor._id.toString()
            }
        ]);
        console.log(`Created ${courses.length} courses`);

        console.log('Seeding lessons...');
        const lessons = await Lesson.create([
            // Course 1 Lessons
            { courseId: courses[0]._id.toString(), title: 'HTML Basics', type: 'video', description: 'Learn the structure of web pages', content: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', duration: 45, attachments: [], order: 1, allowDownload: true },
            { courseId: courses[0]._id.toString(), title: 'CSS Styling', type: 'video', description: 'Style your web pages', content: 'https://www.youtube.com/watch?v=1PnVor36_40', duration: 60, attachments: [], order: 2, allowDownload: true },
            { courseId: courses[0]._id.toString(), title: 'JavaScript Fundamentals', type: 'video', description: 'Add interactivity', content: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', duration: 90, attachments: [], order: 3, allowDownload: false },
            { courseId: courses[0]._id.toString(), title: 'HTML/CSS Quiz', type: 'quiz', description: 'Test your knowledge', content: '', duration: 15, attachments: [], order: 4, allowDownload: false },

            // Course 2 Lessons
            { courseId: courses[1]._id.toString(), title: 'React Introduction', type: 'video', description: 'What is React?', content: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', duration: 30, attachments: [], order: 1, allowDownload: true },
            { courseId: courses[1]._id.toString(), title: 'Hooks Deep Dive', type: 'video', description: 'Master useState and useEffect', content: 'https://www.youtube.com/watch?v=O6P86uwfdR0', duration: 75, attachments: [], order: 2, allowDownload: true },

            // Course 3 Lessons
            { courseId: courses[2]._id.toString(), title: 'Design Principles', type: 'video', description: 'Color, typography, and layout', content: 'https://www.youtube.com/watch?v=QrNi9F42lxY', duration: 45, attachments: [], order: 1, allowDownload: true },
            { courseId: courses[2]._id.toString(), title: 'Figma Basics', type: 'document', description: 'Learn Figma tools', content: 'Figma is a collaborative design tool...', duration: 30, attachments: [{ id: 'att_1', name: 'Figma Guide.pdf', url: '#', type: 'pdf', size: 2500000 }], order: 2, allowDownload: true }
        ]);
        console.log(`Created ${lessons.length} lessons`);

        console.log('Seeding quizzes...');
        const quizzes = await Quiz.create([
            {
                courseId: courses[0]._id.toString(),
                lessonId: lessons[3]._id.toString(),
                title: 'HTML & CSS Assessment',
                description: 'Test your HTML and CSS knowledge',
                questions: [
                    {
                        id: 'q_1',
                        text: 'What does HTML stand for?',
                        type: 'single',
                        options: [
                            { id: 'opt_1', text: 'Hyper Text Markup Language', isCorrect: true },
                            { id: 'opt_2', text: 'High Tech Modern Language', isCorrect: false },
                            { id: 'opt_3', text: 'Hyper Transfer Markup Language', isCorrect: false },
                            { id: 'opt_4', text: 'Home Tool Markup Language', isCorrect: false }
                        ],
                        order: 1
                    },
                    {
                        id: 'q_2',
                        text: 'Which CSS property changes text color?',
                        type: 'single',
                        options: [
                            { id: 'opt_5', text: 'text-color', isCorrect: false },
                            { id: 'opt_6', text: 'font-color', isCorrect: false },
                            { id: 'opt_7', text: 'color', isCorrect: true },
                            { id: 'opt_8', text: 'text-style', isCorrect: false }
                        ],
                        order: 2
                    },
                    {
                        id: 'q_3',
                        text: 'Which HTML tag is used for creating a hyperlink?',
                        type: 'single',
                        options: [
                            { id: 'opt_9', text: 'link', isCorrect: false },
                            { id: 'opt_10', text: 'a', isCorrect: true },
                            { id: 'opt_11', text: 'href', isCorrect: false },
                            { id: 'opt_12', text: 'url', isCorrect: false }
                        ],
                        order: 3
                    }
                ],
                passingScore: 70,
                maxAttempts: 3,
                pointsPerAttempt: 50
            }
        ]);
        console.log(`Created ${quizzes.length} quizzes`);

        console.log('Seeding enrollments...');
        const enrollments = await Enrollment.create([
            { userId: learner1._id.toString(), courseId: courses[0]._id.toString(), status: 'in_progress', progress: 45, enrolledAt: new Date(), startedAt: new Date(), totalPoints: 150 },
            { userId: learner1._id.toString(), courseId: courses[1]._id.toString(), status: 'not_started', progress: 0, enrolledAt: new Date(), totalPoints: 0 },
            { userId: learner2._id.toString(), courseId: courses[0]._id.toString(), status: 'completed', progress: 100, enrolledAt: new Date(), startedAt: new Date(), completedAt: new Date(), totalPoints: 300 }
        ]);
        console.log(`Created ${enrollments.length} enrollments`);

        console.log('Seeding reviews...');
        const reviews = await Review.create([
            { userId: learner2._id.toString(), courseId: courses[0]._id.toString(), rating: 5, comment: 'Excellent course! Very well structured.' },
            { userId: learner1._id.toString(), courseId: courses[0]._id.toString(), rating: 4, comment: 'Great content, but could use more examples.' }
        ]);
        console.log(`Created ${reviews.length} reviews`);

        console.log('Seeding user points...');
        const userPoints = await UserPoints.create([
            { userId: learner1._id.toString(), totalPoints: 150, badges: ['badge_1'], streakDays: 3, coursesCompleted: 0, quizzesPassed: 2 },
            { userId: learner2._id.toString(), totalPoints: 500, badges: ['badge_1', 'badge_2'], streakDays: 7, coursesCompleted: 1, quizzesPassed: 5 }
        ]);
        console.log(`Created ${userPoints.length} user points`);

        console.log('Seeding quiz attempts...');
        const quizAttempts = await QuizAttempt.create([
            {
                userId: learner2._id.toString(),
                quizId: quizzes[0]._id.toString(),
                answers: new Map([['q_1', ['opt_1']], ['q_2', ['opt_7']], ['q_3', ['opt_10']]]),
                score: 100,
                pointsEarned: 50,
                passed: true,
                attemptNumber: 1,
                startedAt: new Date(),
                completedAt: new Date()
            }
        ]);
        console.log(`Created ${quizAttempts.length} quiz attempts`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('   Admin:      admin@learnsphere.com / password123');
        console.log('   Instructor: instructor@learnsphere.com / password123');
        console.log('   Learner:    learner@learnsphere.com / password123');

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
