// Real API Service - Connects to the Express backend
// This replaces mockApi calls with actual HTTP requests to the backend

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth token
const getToken = (): string | null => {
    return localStorage.getItem('ls_token');
};

// Helper to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });
};

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        // Don't use fetchWithAuth - login doesn't need auth token
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success && data.data) {
            localStorage.setItem('ls_token', data.data.token);
            localStorage.setItem('ls_current_user', JSON.stringify(data.data.user));
        }
        return data;
    },

    register: async (email: string, password: string, name: string, role?: string) => {
        // Don't use fetchWithAuth - register doesn't need auth token
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role }),
        });
        const data = await res.json();
        if (data.success && data.data) {
            localStorage.setItem('ls_token', data.data.token);
            localStorage.setItem('ls_current_user', JSON.stringify(data.data.user));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('ls_token');
        localStorage.removeItem('ls_current_user');
        return { success: true };
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('ls_current_user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!getToken();
    },

    updateProfile: async (data: any) => {
        const res = await fetchWithAuth('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success && result.data) {
            // Update stored user
            const currentUser = JSON.parse(localStorage.getItem('ls_current_user') || '{}');
            localStorage.setItem('ls_current_user', JSON.stringify({ ...currentUser, ...result.data.user }));
        }
        return result;
    },
};

// Courses API
export const coursesApi = {
    getAll: async (filters?: { status?: string; visibility?: string; instructorId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.visibility) params.append('visibility', filters.visibility);
        if (filters?.instructorId) params.append('instructorId', filters.instructorId);

        const res = await fetchWithAuth(`/courses?${params.toString()}`);
        return res.json();
    },

    getById: async (id: string) => {
        const res = await fetchWithAuth(`/courses/${id}`);
        return res.json();
    },

    create: async (data: any) => {
        const res = await fetchWithAuth('/courses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    update: async (id: string, data: any) => {
        const res = await fetchWithAuth(`/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    delete: async (id: string) => {
        const res = await fetchWithAuth(`/courses/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    getStats: async (courseId: string) => {
        const res = await fetchWithAuth(`/courses/${courseId}/stats`);
        return res.json();
    },

    incrementView: async (courseId: string) => {
        const res = await fetchWithAuth(`/courses/${courseId}/view`, {
            method: 'POST',
        });
        return res.json();
    },

    getRating: async (courseId: string) => {
        const res = await fetchWithAuth(`/courses/${courseId}/rating`);
        return res.json();
    },
};

// Lessons API
export const lessonsApi = {
    getByCourse: async (courseId: string) => {
        const res = await fetchWithAuth(`/lessons/course/${courseId}`);
        return res.json();
    },

    getById: async (id: string) => {
        const res = await fetchWithAuth(`/lessons/${id}`);
        return res.json();
    },

    create: async (data: any) => {
        const res = await fetchWithAuth('/lessons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    update: async (id: string, data: any) => {
        const res = await fetchWithAuth(`/lessons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    delete: async (id: string) => {
        const res = await fetchWithAuth(`/lessons/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    reorder: async (lessonIds: string[]) => {
        const res = await fetchWithAuth('/lessons/reorder', {
            method: 'POST',
            body: JSON.stringify({ lessonIds }),
        });
        return res.json();
    },
};

// Quizzes API
export const quizzesApi = {
    getByCourse: async (courseId: string) => {
        const res = await fetchWithAuth(`/quizzes/course/${courseId}`);
        return res.json();
    },

    getById: async (id: string) => {
        const res = await fetchWithAuth(`/quizzes/${id}`);
        return res.json();
    },

    create: async (data: any) => {
        const res = await fetchWithAuth('/quizzes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    update: async (id: string, data: any) => {
        const res = await fetchWithAuth(`/quizzes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    delete: async (id: string) => {
        const res = await fetchWithAuth(`/quizzes/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    // Question management
    addQuestion: async (quizId: string, data: any) => {
        const res = await fetchWithAuth(`/quizzes/${quizId}/questions`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateQuestion: async (quizId: string, questionId: string, data: any) => {
        const res = await fetchWithAuth(`/quizzes/${quizId}/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteQuestion: async (quizId: string, questionId: string) => {
        const res = await fetchWithAuth(`/quizzes/${quizId}/questions/${questionId}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    submitAttempt: async (quizId: string, answers: Record<string, string[]>) => {
        const res = await fetchWithAuth(`/quizzes/${quizId}/attempt`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
        });
        return res.json();
    },

    getAttempts: async (quizId: string, userId?: string) => {
        const params = userId ? `?userId=${userId}` : '';
        const res = await fetchWithAuth(`/quizzes/${quizId}/attempts${params}`);
        return res.json();
    },
};

// Enrollments API
export const enrollmentsApi = {
    getByUser: async () => {
        const res = await fetchWithAuth('/enrollments/my');
        return res.json();
    },

    getByCourse: async (courseId: string) => {
        const res = await fetchWithAuth(`/enrollments/course/${courseId}`);
        return res.json();
    },

    enroll: async (courseId: string) => {
        const res = await fetchWithAuth('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ courseId }),
        });
        return res.json();
    },

    updateProgress: async (enrollmentId: string, progress: number) => {
        const res = await fetchWithAuth(`/enrollments/${enrollmentId}/progress`, {
            method: 'PUT',
            body: JSON.stringify({ progress }),
        });
        return res.json();
    },

    getByMultipleCourses: async (courseIds: string[]) => {
        const res = await fetchWithAuth('/enrollments/courses', {
            method: 'POST',
            body: JSON.stringify({ courseIds }),
        });
        return res.json();
    },

    invite: async (courseId: string, emails: string[]) => {
        const res = await fetchWithAuth('/enrollments/invite', {
            method: 'POST',
            body: JSON.stringify({ courseId, emails }),
        });
        return res.json();
    },

    markLessonComplete: async (courseId: string, lessonId: string, completedLessonIds: string[]) => {
        const res = await fetchWithAuth('/enrollments/lesson-complete', {
            method: 'POST',
            body: JSON.stringify({ courseId, lessonId, completedLessonIds }),
        });
        return res.json();
    },
};

// Reviews API
export const reviewsApi = {
    getByCourse: async (courseId: string) => {
        const res = await fetchWithAuth(`/reviews/course/${courseId}`);
        return res.json();
    },

    create: async (courseId: string, rating: number, comment: string) => {
        const res = await fetchWithAuth('/reviews', {
            method: 'POST',
            body: JSON.stringify({ courseId, rating, comment }),
        });
        return res.json();
    },

    update: async (id: string, rating: number, comment: string) => {
        const res = await fetchWithAuth(`/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ rating, comment }),
        });
        return res.json();
    },

    delete: async (id: string) => {
        const res = await fetchWithAuth(`/reviews/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },
};

// Activities API
export const activitiesApi = {
    getMyActivities: async () => {
        const res = await fetchWithAuth('/activities/my');
        return res.json();
    },
};

// Uploads API
export const uploadsApi = {
    uploadSingle: async (file: File, type: 'images' | 'documents' | 'videos' | 'general' = 'general') => {
        const token = getToken();
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/uploads/single?type=${type}`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        return res.json();
    },

    uploadMultiple: async (files: File[], type: 'images' | 'documents' | 'videos' | 'general' = 'general') => {
        const token = getToken();
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const res = await fetch(`${API_BASE_URL}/uploads/multiple?type=${type}`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        return res.json();
    },

    delete: async (type: string, filename: string) => {
        const res = await fetchWithAuth(`/uploads/${type}/${filename}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    getFullUrl: (relativePath: string) => {
        if (relativePath.startsWith('http')) return relativePath;
        return `http://localhost:5000${relativePath}`;
    },
};

// Payments API
export const paymentsApi = {
    initiate: async (courseId: string) => {
        // This is now createOrder
        const res = await fetchWithAuth('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({ courseId }),
        });
        return res.json();
    },

    verifyPayment: async (payload: any) => {
        const res = await fetchWithAuth('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return res.json();
    },

    check: async (courseId: string) => {
        const res = await fetchWithAuth(`/payments/check/${courseId}`);
        return res.json();
    },

    getHistory: async () => {
        const res = await fetchWithAuth('/payments/history');
        return res.json();
    },
};
