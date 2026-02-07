# LearnSphere - eLearning Platform MVP

A comprehensive, production-ready eLearning platform built with React, TypeScript, and Tailwind CSS. LearnSphere supports both learners and instructors with role-based access control, course management, quizzes, progress tracking, and gamification.

## Features

### For Learners
- **Course Discovery**: Browse and search courses by tags, skill level
- **Enrollment**: Easy course enrollment with visibility controls
- **Learning Experience**: Full-screen lesson player with video, document, and image support
- **Progress Tracking**: Visual progress bars and completion status
- **Quizzes**: Interactive quizzes with instant feedback
- **Gamification**: Points, badges, and streak tracking
- **Reviews**: Rate and review courses

### For Instructors/Admins
- **Course Management**: Create, edit, and publish courses
- **Lesson Builder**: Add video, document, image, and quiz lessons
- **Quiz Builder**: Create quizzes with multiple question types
- **Student Reporting**: Track enrollment, progress, and completion rates
- **Kanban View**: Visual course status management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context + localStorage
- **Authentication**: JWT simulation with role-based access
- **Database**: localStorage (mock API for demo)

## Project Structure

```
src/
├── components/ui/        # shadcn/ui components
├── hooks/               # Custom React hooks
│   └── useAuth.tsx     # Authentication context
├── layouts/             # Page layouts
│   ├── MainLayout.tsx   # Public layout
│   └── AdminLayout.tsx  # Admin/Instructor layout
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── CoursesPage.tsx
│   ├── CourseDetailPage.tsx
│   ├── LessonPlayerPage.tsx
│   ├── QuizPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── MyCoursesPage.tsx
│   ├── ProfilePage.tsx
│   └── admin/           # Admin pages
│       ├── Dashboard.tsx
│       ├── Courses.tsx
│       ├── CourseForm.tsx
│       ├── Lessons.tsx
│       ├── QuizBuilder.tsx
│       └── Reporting.tsx
├── services/            # API services
│   └── mockApi.ts      # Mock API with localStorage
├── types/               # TypeScript types
│   └── index.ts
└── App.tsx             # Main app component
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd learnsphere
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Accounts

Use these accounts to test different roles:

- **Admin**: `admin@learnsphere.com` / `admin`
- **Instructor**: `instructor@learnsphere.com` / `instructor`
- **Learner**: `learner@learnsphere.com` / `learner`

## User Roles & Permissions

### Admin
- Full access to all features
- Manage all courses
- View all reports

### Instructor
- Create and manage own courses
- View course analytics
- Manage lessons and quizzes

### Learner
- Browse and enroll in courses
- Take lessons and quizzes
- Track progress and earn points
- Review courses

### Guest
- Browse public courses
- Must sign in to enroll

## Data Models

### User
- id, email, name, role, createdAt, updatedAt

### Course
- id, title, description, tags, image, website, responsiblePerson
- visibility (everyone/signed_in/invitation/payment)
- status (draft/published), views, totalDuration, instructorId

### Lesson
- id, courseId, title, type (video/document/image/quiz)
- description, content, duration, attachments, order

### Quiz
- id, courseId, lessonId, title, description
- questions, passingScore, maxAttempts, pointsPerAttempt, timeLimit

### Enrollment
- id, userId, courseId, status, progress, enrolledAt, etc.

### Review
- id, userId, courseId, rating, comment, createdAt

## API Structure

The mock API provides the following services:

- `authService`: Login, register, logout, get current user
- `courseService`: CRUD operations for courses
- `lessonService`: Manage lessons within courses
- `quizService`: Create quizzes and questions
- `enrollmentService`: Handle course enrollments
- `progressService`: Track lesson completion
- `reviewService`: Course reviews and ratings
- `userPointsService`: Gamification points and badges
- `dashboardService`: Analytics and statistics

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deployment

The application can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3

## Future Enhancements

- Real backend API integration
- Video streaming support
- Real-time notifications
- Mobile app (React Native)
- AI-powered course recommendations
- Advanced analytics dashboard
- Payment gateway integration
- Certificate generation

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons by [Lucide](https://lucide.dev/)
- UI inspired by modern EdTech platforms
