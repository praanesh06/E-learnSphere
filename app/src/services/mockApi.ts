// LearnSphere Mock API Service
// Simulates backend with localStorage persistence

import type {
  User, UserRole, Course, Lesson, Quiz, Question, Enrollment, Progress,
  Review, Badge, UserPoints, QuizAttempt, LoginCredentials, RegisterData,
  CourseVisibility, CourseStatus,
  ApiResponse, InstructorStats, CourseStats, CourseWithProgress, Activity
} from '@/types';

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'ls_users',
  COURSES: 'ls_courses',
  LESSONS: 'ls_lessons',
  QUIZZES: 'ls_quizzes',
  QUESTIONS: 'ls_questions',
  ENROLLMENTS: 'ls_enrollments',
  PROGRESS: 'ls_progress',
  REVIEWS: 'ls_reviews',
  BADGES: 'ls_badges',
  USER_POINTS: 'ls_user_points',
  QUIZ_ATTEMPTS: 'ls_quiz_attempts',
  CURRENT_USER: 'ls_current_user',
  TOKEN: 'ls_token',
  DATA_VERSION: 'ls_data_version'
};

const CURRENT_DATA_VERSION = '2'; // Increment to force re-seed

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);
const getNow = () => new Date().toISOString();

const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize default badges
const defaultBadges: Badge[] = [
  { id: 'badge_1', name: 'Beginner', description: 'Complete your first course', icon: '🌱', pointsRequired: 100, color: '#22c55e' },
  { id: 'badge_2', name: 'Learner', description: 'Complete 5 courses', icon: '📚', pointsRequired: 500, color: '#3b82f6' },
  { id: 'badge_3', name: 'Scholar', description: 'Complete 10 courses', icon: '🎓', pointsRequired: 1000, color: '#8b5cf6' },
  { id: 'badge_4', name: 'Quiz Master', description: 'Pass 20 quizzes', icon: '🏆', pointsRequired: 800, color: '#f59e0b' },
  { id: 'badge_5', name: 'Streak Keeper', description: 'Maintain a 7-day learning streak', icon: '🔥', pointsRequired: 300, color: '#ef4444' }
];

// Initialize seed data
export const initializeSeedData = () => {
  // Check if data version matches
  const storedVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
  if (storedVersion === CURRENT_DATA_VERSION && localStorage.getItem(STORAGE_KEYS.USERS)) {
    return;
  }

  // Clear old data and re-seed
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.CURRENT_USER && key !== STORAGE_KEYS.TOKEN) {
      localStorage.removeItem(key);
    }
  });

  // Set new version
  localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);

  // Seed Users
  const users: User[] = [
    { id: 'user_1', email: 'admin@learnsphere.com', name: 'Admin User', role: 'admin', createdAt: getNow(), updatedAt: getNow() },
    { id: 'user_2', email: 'instructor@learnsphere.com', name: 'John Instructor', role: 'instructor', createdAt: getNow(), updatedAt: getNow() },
    { id: 'user_3', email: 'learner@learnsphere.com', name: 'Sarah Learner', role: 'learner', createdAt: getNow(), updatedAt: getNow() },
    { id: 'user_4', email: 'learner2@learnsphere.com', name: 'Mike Student', role: 'learner', createdAt: getNow(), updatedAt: getNow() }
  ];
  setStorage(STORAGE_KEYS.USERS, users);

  // Seed Courses
  const courses: Course[] = [
    {
      id: 'course_1',
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
      tags: ['Web Development', 'HTML', 'CSS', 'JavaScript'],
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      website: 'https://webdev-course.com',
      responsiblePerson: 'user_2',
      visibility: 'everyone',
      status: 'published',
      views: 1250,
      totalDuration: 480,
      instructorId: 'user_2',
      createdAt: getNow(),
      updatedAt: getNow()
    },
    {
      id: 'course_2',
      title: 'React Mastery: From Beginner to Pro',
      description: 'Master React.js with hooks, context, and modern best practices.',
      tags: ['React', 'JavaScript', 'Frontend'],
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      visibility: 'signed_in',
      status: 'published',
      views: 890,
      totalDuration: 720,
      instructorId: 'user_2',
      createdAt: getNow(),
      updatedAt: getNow()
    },
    {
      id: 'course_3',
      title: 'UI/UX Design Fundamentals',
      description: 'Learn design principles, user research, and prototyping with Figma.',
      tags: ['Design', 'UI/UX', 'Figma'],
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      visibility: 'payment',
      price: 49.99,
      status: 'published',
      views: 650,
      totalDuration: 360,
      instructorId: 'user_2',
      createdAt: getNow(),
      updatedAt: getNow()
    },
    {
      id: 'course_4',
      title: 'Python for Data Science',
      description: 'Analyze data and build machine learning models with Python.',
      tags: ['Python', 'Data Science', 'Machine Learning'],
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      visibility: 'everyone',
      status: 'draft',
      views: 0,
      totalDuration: 600,
      instructorId: 'user_2',
      createdAt: getNow(),
      updatedAt: getNow()
    }
  ];
  setStorage(STORAGE_KEYS.COURSES, courses);

  // Seed Lessons
  const lessons: Lesson[] = [
    // Course 1 Lessons
    { id: 'lesson_1_1', courseId: 'course_1', title: 'HTML Basics', type: 'video', description: 'Learn the structure of web pages', content: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', duration: 45, attachments: [], order: 1, allowDownload: true, createdAt: getNow(), updatedAt: getNow() },
    { id: 'lesson_1_2', courseId: 'course_1', title: 'CSS Styling', type: 'video', description: 'Style your web pages', content: 'https://www.youtube.com/watch?v=1PnVor36_40', duration: 60, attachments: [], order: 2, allowDownload: true, createdAt: getNow(), updatedAt: getNow() },
    { id: 'lesson_1_3', courseId: 'course_1', title: 'JavaScript Fundamentals', type: 'video', description: 'Add interactivity', content: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', duration: 90, attachments: [], order: 3, allowDownload: false, createdAt: getNow(), updatedAt: getNow() },
    { id: 'lesson_1_4', courseId: 'course_1', title: 'HTML/CSS Quiz', type: 'quiz', description: 'Test your knowledge', content: '', duration: 15, attachments: [], order: 4, allowDownload: false, createdAt: getNow(), updatedAt: getNow() },

    // Course 2 Lessons
    { id: 'lesson_2_1', courseId: 'course_2', title: 'React Introduction', type: 'video', description: 'What is React?', content: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', duration: 30, attachments: [], order: 1, allowDownload: true, createdAt: getNow(), updatedAt: getNow() },
    { id: 'lesson_2_2', courseId: 'course_2', title: 'Hooks Deep Dive', type: 'video', description: 'Master useState and useEffect', content: 'https://www.youtube.com/watch?v=O6P86uwfdR0', duration: 75, attachments: [], order: 2, allowDownload: true, createdAt: getNow(), updatedAt: getNow() },

    // Course 3 Lessons
    { id: 'lesson_3_1', courseId: 'course_3', title: 'Design Principles', type: 'video', description: 'Color, typography, and layout', content: 'https://www.youtube.com/watch?v=QrNi9F42lxY', duration: 45, attachments: [], order: 1, allowDownload: true, createdAt: getNow(), updatedAt: getNow() },
    { id: 'lesson_3_2', courseId: 'course_3', title: 'Figma Basics', type: 'document', description: 'Learn Figma tools', content: 'Figma is a collaborative design tool...', duration: 30, attachments: [{ id: 'att_1', name: 'Figma Guide.pdf', url: '#', type: 'pdf', size: 2500000 }], order: 2, allowDownload: true, createdAt: getNow(), updatedAt: getNow() }
  ];
  setStorage(STORAGE_KEYS.LESSONS, lessons);

  // Seed Quizzes
  const quizzes: Quiz[] = [
    {
      id: 'quiz_1',
      courseId: 'course_1',
      lessonId: 'lesson_1_4',
      title: 'HTML & CSS Assessment',
      description: 'Test your HTML and CSS knowledge',
      questions: [],
      passingScore: 70,
      maxAttempts: 3,
      pointsPerAttempt: 50,
      createdAt: getNow(),
      updatedAt: getNow()
    }
  ];
  setStorage(STORAGE_KEYS.QUIZZES, quizzes);

  // Seed Questions
  const questions: Question[] = [
    {
      id: 'q_1',
      quizId: 'quiz_1',
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
      quizId: 'quiz_1',
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
      quizId: 'quiz_1',
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
  ];
  setStorage(STORAGE_KEYS.QUESTIONS, questions);

  // Update quiz with question IDs
  quizzes[0].questions = questions.filter(q => q.quizId === 'quiz_1');
  setStorage(STORAGE_KEYS.QUIZZES, quizzes);

  // Seed Enrollments
  const enrollments: Enrollment[] = [
    { id: 'enroll_1', userId: 'user_3', courseId: 'course_1', status: 'in_progress', progress: 45, enrolledAt: getNow(), startedAt: getNow(), totalPoints: 150 },
    { id: 'enroll_2', userId: 'user_3', courseId: 'course_2', status: 'not_started', progress: 0, enrolledAt: getNow(), totalPoints: 0 },
    { id: 'enroll_3', userId: 'user_4', courseId: 'course_1', status: 'completed', progress: 100, enrolledAt: getNow(), startedAt: getNow(), completedAt: getNow(), totalPoints: 300 }
  ];
  setStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);

  // Seed Progress
  const progress: Progress[] = [
    { id: 'prog_1', userId: 'user_3', lessonId: 'lesson_1_1', courseId: 'course_1', completed: true, completedAt: getNow(), timeSpent: 45 },
    { id: 'prog_2', userId: 'user_3', lessonId: 'lesson_1_2', courseId: 'course_1', completed: true, completedAt: getNow(), timeSpent: 60 },
    { id: 'prog_3', userId: 'user_3', lessonId: 'lesson_1_3', courseId: 'course_1', completed: false, timeSpent: 20 },
    { id: 'prog_4', userId: 'user_4', lessonId: 'lesson_1_1', courseId: 'course_1', completed: true, completedAt: getNow(), timeSpent: 45 },
    { id: 'prog_5', userId: 'user_4', lessonId: 'lesson_1_2', courseId: 'course_1', completed: true, completedAt: getNow(), timeSpent: 60 },
    { id: 'prog_6', userId: 'user_4', lessonId: 'lesson_1_3', courseId: 'course_1', completed: true, completedAt: getNow(), timeSpent: 90 },
    { id: 'prog_7', userId: 'user_4', lessonId: 'lesson_1_4', courseId: 'course_1', completed: true, completedAt: getNow(), timeSpent: 15 }
  ];
  setStorage(STORAGE_KEYS.PROGRESS, progress);

  // Seed Reviews
  const reviews: Review[] = [
    { id: 'review_1', userId: 'user_4', courseId: 'course_1', rating: 5, comment: 'Excellent course! Very well structured.', createdAt: getNow(), updatedAt: getNow() },
    { id: 'review_2', userId: 'user_3', courseId: 'course_1', rating: 4, comment: 'Great content, but could use more examples.', createdAt: getNow(), updatedAt: getNow() }
  ];
  setStorage(STORAGE_KEYS.REVIEWS, reviews);

  // Seed Badges
  setStorage(STORAGE_KEYS.BADGES, defaultBadges);

  // Seed User Points
  const userPoints: UserPoints[] = [
    { userId: 'user_3', totalPoints: 150, badges: ['badge_1'], streakDays: 3, coursesCompleted: 0, quizzesPassed: 2 },
    { userId: 'user_4', totalPoints: 500, badges: ['badge_1', 'badge_2'], streakDays: 7, coursesCompleted: 1, quizzesPassed: 5 }
  ];
  setStorage(STORAGE_KEYS.USER_POINTS, userPoints);

  // Seed Quiz Attempts
  const quizAttempts: QuizAttempt[] = [
    { id: 'attempt_1', userId: 'user_4', quizId: 'quiz_1', answers: { q_1: ['opt_1'], q_2: ['opt_7'], q_3: ['opt_10'] }, score: 100, pointsEarned: 50, passed: true, attemptNumber: 1, startedAt: getNow(), completedAt: getNow() }
  ];
  setStorage(STORAGE_KEYS.QUIZ_ATTEMPTS, quizAttempts);
};

// Auth Service
export const authService = {
  login: (credentials: LoginCredentials): ApiResponse<{ user: User; token: string }> => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // In real app, verify password hash
    const token = generateId();
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    setStorage(STORAGE_KEYS.TOKEN, token);

    return { success: true, data: { user, token } };
  },

  register: (data: RegisterData): ApiResponse<{ user: User; token: string }> => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);

    if (users.some(u => u.email === data.email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser: User = {
      id: generateId(),
      email: data.email,
      name: data.name,
      role: data.role || 'learner',
      createdAt: getNow(),
      updatedAt: getNow()
    };

    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);

    // Initialize user points
    const userPoints = getStorage<UserPoints[]>(STORAGE_KEYS.USER_POINTS, []);
    userPoints.push({
      userId: newUser.id,
      totalPoints: 0,
      badges: [],
      streakDays: 0,
      coursesCompleted: 0,
      quizzesPassed: 0
    });
    setStorage(STORAGE_KEYS.USER_POINTS, userPoints);

    const token = generateId();
    setStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    setStorage(STORAGE_KEYS.TOKEN, token);

    return { success: true, data: { user: newUser, token } };
  },

  logout: (): ApiResponse<void> => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    return { success: true, message: 'Logged out successfully' };
  },

  getCurrentUser: (): User | null => {
    return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  isAuthenticated: (): boolean => {
    return !!getStorage<string | null>(STORAGE_KEYS.TOKEN, null);
  },

  hasRole: (roles: UserRole[]): boolean => {
    const user = authService.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
};

// Course Service
export const courseService = {
  getAll: (filters?: { status?: CourseStatus; visibility?: CourseVisibility; instructorId?: string }): Course[] => {
    let courses = getStorage<Course[]>(STORAGE_KEYS.COURSES, []);

    if (filters?.status) {
      courses = courses.filter(c => c.status === filters.status);
    }
    if (filters?.visibility) {
      courses = courses.filter(c => c.visibility === filters.visibility);
    }
    if (filters?.instructorId) {
      courses = courses.filter(c => c.instructorId === filters.instructorId);
    }

    return courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id: string): Course | null => {
    const courses = getStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    return courses.find(c => c.id === id) || null;
  },

  create: (data: Partial<Course>): ApiResponse<Course> => {
    const courses = getStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    const user = authService.getCurrentUser();

    const newCourse: Course = {
      id: generateId(),
      title: data.title || 'Untitled Course',
      description: data.description || '',
      tags: data.tags || [],
      image: data.image,
      website: data.website,
      responsiblePerson: data.responsiblePerson,
      visibility: data.visibility || 'everyone',
      price: data.price,
      status: data.status || 'draft',
      views: 0,
      totalDuration: 0,
      instructorId: user?.id || '',
      createdAt: getNow(),
      updatedAt: getNow()
    };

    courses.push(newCourse);
    setStorage(STORAGE_KEYS.COURSES, courses);

    return { success: true, data: newCourse };
  },

  update: (id: string, data: Partial<Course>): ApiResponse<Course> => {
    const courses = getStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    const index = courses.findIndex(c => c.id === id);

    if (index === -1) {
      return { success: false, error: 'Course not found' };
    }

    courses[index] = { ...courses[index], ...data, updatedAt: getNow() };
    setStorage(STORAGE_KEYS.COURSES, courses);

    return { success: true, data: courses[index] };
  },

  delete: (id: string): ApiResponse<void> => {
    let courses = getStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    courses = courses.filter(c => c.id !== id);
    setStorage(STORAGE_KEYS.COURSES, courses);

    // Clean up related data
    const lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []).filter(l => l.courseId !== id);
    setStorage(STORAGE_KEYS.LESSONS, lessons);

    return { success: true, message: 'Course deleted' };
  },

  incrementViews: (id: string): void => {
    const courses = getStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index].views++;
      setStorage(STORAGE_KEYS.COURSES, courses);
    }
  },

  getStats: (courseId: string): CourseStats => {
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, [])
      .filter(e => e.courseId === courseId);
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, [])
      .filter(r => r.courseId === courseId);

    return {
      courseId,
      totalParticipants: enrollments.length,
      yetToStart: enrollments.filter(e => e.status === 'not_started').length,
      inProgress: enrollments.filter(e => e.status === 'in_progress').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      averageProgress: enrollments.length ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length : 0,
      averageRating: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
    };
  }
};

// Lesson Service
export const lessonService = {
  getByCourse: (courseId: string): Lesson[] => {
    const lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    return lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  },

  getById: (id: string): Lesson | null => {
    const lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    return lessons.find(l => l.id === id) || null;
  },

  create: (data: Partial<Lesson>): ApiResponse<Lesson> => {
    const lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    const courseLessons = lessons.filter(l => l.courseId === data.courseId);

    const newLesson: Lesson = {
      id: generateId(),
      courseId: data.courseId || '',
      title: data.title || 'Untitled Lesson',
      type: data.type || 'video',
      description: data.description || '',
      content: data.content || '',
      duration: data.duration || 0,
      attachments: data.attachments || [],
      order: courseLessons.length + 1,
      allowDownload: data.allowDownload || false,
      createdAt: getNow(),
      updatedAt: getNow()
    };

    lessons.push(newLesson);
    setStorage(STORAGE_KEYS.LESSONS, lessons);

    // Update course duration
    courseService.update(newLesson.courseId, {
      totalDuration: courseLessons.reduce((sum, l) => sum + l.duration, 0) + newLesson.duration
    });

    return { success: true, data: newLesson };
  },

  update: (id: string, data: Partial<Lesson>): ApiResponse<Lesson> => {
    const lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    const index = lessons.findIndex(l => l.id === id);

    if (index === -1) {
      return { success: false, error: 'Lesson not found' };
    }

    const oldDuration = lessons[index].duration;
    lessons[index] = { ...lessons[index], ...data, updatedAt: getNow() };
    setStorage(STORAGE_KEYS.LESSONS, lessons);

    // Update course duration if changed
    if (data.duration && data.duration !== oldDuration) {
      const courseLessons = lessons.filter(l => l.courseId === lessons[index].courseId);
      courseService.update(lessons[index].courseId, {
        totalDuration: courseLessons.reduce((sum, l) => sum + l.duration, 0)
      });
    }

    return { success: true, data: lessons[index] };
  },

  delete: (id: string): ApiResponse<void> => {
    let lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find(l => l.id === id);

    if (!lesson) {
      return { success: false, error: 'Lesson not found' };
    }

    lessons = lessons.filter(l => l.id !== id);

    // Reorder remaining lessons
    const courseLessons = lessons.filter(l => l.courseId === lesson.courseId).sort((a, b) => a.order - b.order);
    courseLessons.forEach((l, i) => {
      l.order = i + 1;
    });

    setStorage(STORAGE_KEYS.LESSONS, lessons);

    // Update course duration
    courseService.update(lesson.courseId, {
      totalDuration: courseLessons.reduce((sum, l) => sum + l.duration, 0)
    });

    return { success: true, message: 'Lesson deleted' };
  },

  reorder: (_courseId: string, lessonIds: string[]): ApiResponse<void> => {
    const lessons = getStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);

    lessonIds.forEach((id, index) => {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        lesson.order = index + 1;
      }
    });

    setStorage(STORAGE_KEYS.LESSONS, lessons);
    return { success: true };
  }
};

// Quiz Service
export const quizService = {
  getByCourse: (courseId: string): Quiz[] => {
    const quizzes = getStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
    return quizzes.filter(q => q.courseId === courseId);
  },

  getById: (id: string): Quiz | null => {
    const quizzes = getStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
    return quizzes.find(q => q.id === id) || null;
  },

  create: (data: Partial<Quiz>): ApiResponse<Quiz> => {
    const quizzes = getStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);

    const newQuiz: Quiz = {
      id: generateId(),
      courseId: data.courseId || '',
      lessonId: data.lessonId,
      title: data.title || 'Untitled Quiz',
      description: data.description || '',
      questions: [],
      passingScore: data.passingScore || 70,
      maxAttempts: data.maxAttempts || 3,
      pointsPerAttempt: data.pointsPerAttempt || 50,
      timeLimit: data.timeLimit,
      createdAt: getNow(),
      updatedAt: getNow()
    };

    quizzes.push(newQuiz);
    setStorage(STORAGE_KEYS.QUIZZES, quizzes);

    return { success: true, data: newQuiz };
  },

  update: (id: string, data: Partial<Quiz>): ApiResponse<Quiz> => {
    const quizzes = getStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
    const index = quizzes.findIndex(q => q.id === id);

    if (index === -1) {
      return { success: false, error: 'Quiz not found' };
    }

    quizzes[index] = { ...quizzes[index], ...data, updatedAt: getNow() };
    setStorage(STORAGE_KEYS.QUIZZES, quizzes);

    return { success: true, data: quizzes[index] };
  },

  delete: (id: string): ApiResponse<void> => {
    let quizzes = getStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
    quizzes = quizzes.filter(q => q.id !== id);
    setStorage(STORAGE_KEYS.QUIZZES, quizzes);

    // Clean up questions
    let questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    questions = questions.filter(q => q.quizId !== id);
    setStorage(STORAGE_KEYS.QUESTIONS, questions);

    return { success: true, message: 'Quiz deleted' };
  },

  addQuestion: (quizId: string, data: Partial<Question>): ApiResponse<Question> => {
    const questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const quizQuestions = questions.filter(q => q.quizId === quizId);

    const newQuestion: Question = {
      id: generateId(),
      quizId,
      text: data.text || '',
      type: data.type || 'single',
      options: data.options || [],
      order: quizQuestions.length + 1
    };

    questions.push(newQuestion);
    setStorage(STORAGE_KEYS.QUESTIONS, questions);

    // Update quiz
    const quizzes = getStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      quiz.questions.push(newQuestion);
      setStorage(STORAGE_KEYS.QUIZZES, quizzes);
    }

    return { success: true, data: newQuestion };
  },

  updateQuestion: (questionId: string, data: Partial<Question>): ApiResponse<Question> => {
    const questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const index = questions.findIndex(q => q.id === questionId);

    if (index === -1) {
      return { success: false, error: 'Question not found' };
    }

    questions[index] = { ...questions[index], ...data };
    setStorage(STORAGE_KEYS.QUESTIONS, questions);

    return { success: true, data: questions[index] };
  },

  deleteQuestion: (questionId: string): ApiResponse<void> => {
    let questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    questions = questions.filter(q => q.id !== questionId);

    // Reorder
    const quizQuestions = questions.filter(q => q.quizId === question.quizId).sort((a, b) => a.order - b.order);
    quizQuestions.forEach((q, i) => q.order = i + 1);

    setStorage(STORAGE_KEYS.QUESTIONS, questions);

    return { success: true, message: 'Question deleted' };
  },

  submitAttempt: (quizId: string, answers: Record<string, string[]>): ApiResponse<QuizAttempt> => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const quiz = quizService.getById(quizId);
    if (!quiz) {
      return { success: false, error: 'Quiz not found' };
    }

    const attempts = getStorage<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, [])
      .filter(a => a.userId === user.id && a.quizId === quizId);

    if (attempts.length >= quiz.maxAttempts) {
      return { success: false, error: 'Maximum attempts reached' };
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

    const newAttempt: QuizAttempt = {
      id: generateId(),
      userId: user.id,
      quizId,
      answers,
      score,
      pointsEarned,
      passed,
      attemptNumber: attempts.length + 1,
      startedAt: getNow(),
      completedAt: getNow()
    };

    const allAttempts = getStorage<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    allAttempts.push(newAttempt);
    setStorage(STORAGE_KEYS.QUIZ_ATTEMPTS, allAttempts);

    // Update user points
    if (pointsEarned > 0) {
      userPointsService.addPoints(user.id, pointsEarned);
    }

    return { success: true, data: newAttempt };
  },

  getAttempts: (quizId: string, userId?: string): QuizAttempt[] => {
    const attempts = getStorage<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    return attempts.filter(a => a.quizId === quizId && (!userId || a.userId === userId));
  }
};

// Enrollment Service
export const enrollmentService = {
  getByUser: (userId: string): Enrollment[] => {
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);
    return enrollments.filter(e => e.userId === userId);
  },

  getByCourse: (courseId: string): Enrollment[] => {
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);
    return enrollments.filter(e => e.courseId === courseId);
  },

  getById: (id: string): Enrollment | null => {
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);
    return enrollments.find(e => e.id === id) || null;
  },

  enroll: (userId: string, courseId: string): ApiResponse<Enrollment> => {
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);

    if (enrollments.some(e => e.userId === userId && e.courseId === courseId)) {
      return { success: false, error: 'Already enrolled' };
    }

    const newEnrollment: Enrollment = {
      id: generateId(),
      userId,
      courseId,
      status: 'not_started',
      progress: 0,
      enrolledAt: getNow(),
      totalPoints: 0
    };

    enrollments.push(newEnrollment);
    setStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);

    return { success: true, data: newEnrollment };
  },

  updateProgress: (enrollmentId: string, progress: number): ApiResponse<Enrollment> => {
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);
    const index = enrollments.findIndex(e => e.id === enrollmentId);

    if (index === -1) {
      return { success: false, error: 'Enrollment not found' };
    }

    const enrollment = enrollments[index];
    enrollment.progress = Math.min(100, Math.max(0, progress));

    if (enrollment.progress > 0 && enrollment.status === 'not_started') {
      enrollment.status = 'in_progress';
      enrollment.startedAt = getNow();
    }

    if (enrollment.progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = getNow();

      // Award completion points
      userPointsService.incrementCoursesCompleted(enrollment.userId);
    }

    setStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);
    return { success: true, data: enrollment };
  },

  unenroll: (enrollmentId: string): ApiResponse<void> => {
    let enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);
    enrollments = enrollments.filter(e => e.id !== enrollmentId);
    setStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);
    return { success: true, message: 'Unenrolled successfully' };
  }
};

// Progress Service
export const progressService = {
  getByUserAndCourse: (userId: string, courseId: string): Progress[] => {
    const progress = getStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []);
    return progress.filter(p => p.userId === userId && p.courseId === courseId);
  },

  markComplete: (userId: string, lessonId: string, courseId: string): ApiResponse<Progress> => {
    const progress = getStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []);
    let item = progress.find(p => p.userId === userId && p.lessonId === lessonId);

    if (!item) {
      item = {
        id: generateId(),
        userId,
        lessonId,
        courseId,
        completed: true,
        completedAt: getNow(),
        timeSpent: 0
      };
      progress.push(item);
    } else {
      item.completed = true;
      item.completedAt = getNow();
    }

    setStorage(STORAGE_KEYS.PROGRESS, progress);

    // Update enrollment progress
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []);
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);

    if (enrollment) {
      const lessons = lessonService.getByCourse(courseId);
      const completedLessons = progress.filter(p => p.userId === userId && p.courseId === courseId && p.completed).length;
      const progressPercent = Math.round((completedLessons / lessons.length) * 100);
      enrollmentService.updateProgress(enrollment.id, progressPercent);
    }

    return { success: true, data: item };
  }
};

// Review Service
export const reviewService = {
  getByCourse: (courseId: string): Review[] => {
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, []);
    return reviews.filter(r => r.courseId === courseId);
  },

  getByUser: (userId: string): Review[] => {
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, []);
    return reviews.filter(r => r.userId === userId);
  },

  create: (data: Partial<Review>): ApiResponse<Review> => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, []);

    // Check if user already reviewed
    const existingIndex = reviews.findIndex(r => r.userId === user.id && r.courseId === data.courseId);

    const newReview: Review = {
      id: existingIndex >= 0 ? reviews[existingIndex].id : generateId(),
      userId: user.id,
      courseId: data.courseId || '',
      rating: data.rating || 5,
      comment: data.comment || '',
      createdAt: existingIndex >= 0 ? reviews[existingIndex].createdAt : getNow(),
      updatedAt: getNow()
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = newReview;
    } else {
      reviews.push(newReview);
    }

    setStorage(STORAGE_KEYS.REVIEWS, reviews);
    return { success: true, data: newReview };
  },

  delete: (reviewId: string): ApiResponse<void> => {
    let reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, []);
    reviews = reviews.filter(r => r.id !== reviewId);
    setStorage(STORAGE_KEYS.REVIEWS, reviews);
    return { success: true, message: 'Review deleted' };
  }
};

// User Points Service
export const userPointsService = {
  getByUser: (userId: string): UserPoints | null => {
    const userPoints = getStorage<UserPoints[]>(STORAGE_KEYS.USER_POINTS, []);
    return userPoints.find(up => up.userId === userId) || null;
  },

  addPoints: (userId: string, points: number): void => {
    const userPoints = getStorage<UserPoints[]>(STORAGE_KEYS.USER_POINTS, []);
    const index = userPoints.findIndex(up => up.userId === userId);

    if (index !== -1) {
      userPoints[index].totalPoints += points;

      // Check for new badges
      const badges = getStorage<Badge[]>(STORAGE_KEYS.BADGES, []);
      const currentBadges = userPoints[index].badges;

      badges.forEach(badge => {
        if (!currentBadges.includes(badge.id) && userPoints[index].totalPoints >= badge.pointsRequired) {
          currentBadges.push(badge.id);
        }
      });

      setStorage(STORAGE_KEYS.USER_POINTS, userPoints);
    }
  },

  incrementCoursesCompleted: (userId: string): void => {
    const userPoints = getStorage<UserPoints[]>(STORAGE_KEYS.USER_POINTS, []);
    const index = userPoints.findIndex(up => up.userId === userId);

    if (index !== -1) {
      userPoints[index].coursesCompleted++;
      // Award 100 points for course completion
      userPoints[index].totalPoints += 100;
      setStorage(STORAGE_KEYS.USER_POINTS, userPoints);
    }
  },

  incrementQuizzesPassed: (userId: string): void => {
    const userPoints = getStorage<UserPoints[]>(STORAGE_KEYS.USER_POINTS, []);
    const index = userPoints.findIndex(up => up.userId === userId);

    if (index !== -1) {
      userPoints[index].quizzesPassed++;
      setStorage(STORAGE_KEYS.USER_POINTS, userPoints);
    }
  },

  updateStreak: (userId: string): void => {
    const userPoints = getStorage<UserPoints[]>(STORAGE_KEYS.USER_POINTS, []);
    const index = userPoints.findIndex(up => up.userId === userId);

    if (index !== -1) {
      userPoints[index].streakDays++;
      setStorage(STORAGE_KEYS.USER_POINTS, userPoints);
    }
  }
};

// Badge Service
export const badgeService = {
  getAll: (): Badge[] => {
    return getStorage<Badge[]>(STORAGE_KEYS.BADGES, defaultBadges);
  },

  getById: (id: string): Badge | null => {
    const badges = getStorage<Badge[]>(STORAGE_KEYS.BADGES, defaultBadges);
    return badges.find(b => b.id === id) || null;
  },

  getUserBadges: (userId: string): Badge[] => {
    const userPoints = userPointsService.getByUser(userId);
    if (!userPoints) return [];

    const allBadges = badgeService.getAll();
    return allBadges.filter(b => userPoints.badges.includes(b.id));
  }
};

// Dashboard Service
export const dashboardService = {
  getInstructorStats: (instructorId: string): InstructorStats => {
    const courses = courseService.getAll({ instructorId });
    const courseIds = courses.map(c => c.id);
    const enrollments = getStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, [])
      .filter(e => courseIds.includes(e.courseId));
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, [])
      .filter(r => courseIds.includes(r.courseId));

    return {
      totalCourses: courses.length,
      totalStudents: new Set(enrollments.map(e => e.userId)).size,
      totalViews: courses.reduce((sum, c) => sum + c.views, 0),
      averageRating: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
    };
  },

  getLearnerDashboard: (userId: string): { courses: CourseWithProgress[]; points: UserPoints | null; activities: Activity[] } => {
    const enrollments = enrollmentService.getByUser(userId);
    const courses: CourseWithProgress[] = [];

    enrollments.forEach(enrollment => {
      const course = courseService.getById(enrollment.courseId);
      if (course) {
        const instructor = getStorage<User[]>(STORAGE_KEYS.USERS, []).find(u => u.id === course.instructorId);
        const lessons = lessonService.getByCourse(course.id);

        courses.push({
          ...course,
          enrollment,
          progress: enrollment.progress,
          instructor,
          lessonCount: lessons.length
        });
      }
    });

    const points = userPointsService.getByUser(userId);

    // Generate recent activities
    const activities: Activity[] = enrollments.slice(0, 5).map(e => {
      const course = courseService.getById(e.courseId);
      return {
        id: generateId(),
        type: e.status === 'completed' ? 'completion' : 'enrollment',
        title: e.status === 'completed' ? 'Completed a course' : 'Enrolled in a course',
        description: course?.title || 'Unknown course',
        timestamp: e.completedAt || e.enrolledAt
      };
    });

    return { courses, points, activities };
  }
};

// Initialize data on import
initializeSeedData();
