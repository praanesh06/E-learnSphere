// LearnSphere Type Definitions

export type UserRole = 'admin' | 'instructor' | 'learner' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type CourseVisibility = 'everyone' | 'signed_in' | 'invitation' | 'payment';
export type CourseStatus = 'draft' | 'published';
export type LessonType = 'video' | 'document' | 'image' | 'quiz';
export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  website?: string;
  responsiblePerson?: string;
  visibility: CourseVisibility;
  price?: number;
  status: CourseStatus;
  views: number;
  totalDuration: number;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: LessonType;
  description: string;
  content: string;
  duration: number;
  attachments: Attachment[];
  order: number;
  allowDownload: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  maxAttempts: number;
  pointsPerAttempt: number;
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'single' | 'multiple';
  options: Option[];
  order: number;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  completedLessons?: string[];
  totalPoints: number;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  color: string;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  badges: string[];
  streakDays: number;
  coursesCompleted: number;
  quizzesPassed: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string[]>;
  score: number;
  pointsEarned: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: string;
  completedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dashboard Types
export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalViews: number;
  averageRating: number;
}

export interface CourseStats {
  courseId: string;
  totalParticipants: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
  averageProgress: number;
  averageRating: number;
}

export interface LearnerDashboard {
  enrolledCourses: CourseWithProgress[];
  points: UserPoints;
  recentActivity: Activity[];
}

export interface CourseWithProgress extends Course {
  enrollment?: Enrollment;
  progress?: number;
  instructor?: User;
  lessonCount?: number;
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'completion' | 'quiz' | 'review';
  title: string;
  description: string;
  timestamp: string;
}
