import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public Pages
import HomePage from '@/pages/HomePage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import LessonPlayerPage from '@/pages/LessonPlayerPage';
import QuizPage from '@/pages/QuizPage';

// Auth Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Learner Pages
import MyCoursesPage from '@/pages/MyCoursesPage';
import ProfilePage from '@/pages/ProfilePage';

// Admin/Instructor Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminCourses from '@/pages/admin/Courses';
import AdminCourseForm from '@/pages/admin/CourseForm';
import AdminLessons from '@/pages/admin/Lessons';
import AdminQuizBuilder from '@/pages/admin/QuizBuilder';
import AdminReporting from '@/pages/admin/Reporting';

// Types
import type { UserRole } from '@/types';

// Protected Route Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected Learner Routes */}
        <Route path="my-courses" element={
          <ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']}>
            <MyCoursesPage />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="learn/:courseId" element={
          <ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']}>
            <LessonPlayerPage />
          </ProtectedRoute>
        } />
        <Route path="quiz/:quizId" element={
          <ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']}>
            <QuizPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin/Instructor Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'instructor']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/new" element={<AdminCourseForm />} />
        <Route path="courses/:id/edit" element={<AdminCourseForm />} />
        <Route path="courses/:id/lessons" element={<AdminLessons />} />
        <Route path="courses/:id/quiz" element={<AdminQuizBuilder />} />
        <Route path="reporting" element={<AdminReporting />} />
      </Route>

      {/* Fallback - 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </Router>
    </AuthProvider>
  );
}

export default App;
