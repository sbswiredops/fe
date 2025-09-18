export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/',
  API_VERSION: 'v1',
  ENDPOINTS: {

    //Auth
    AUTH_REGISTER: '/auth/register',
    AUTH_VERIFY_OTP: '/auth/verify-otp',
    AUTH_PASSOTP_VERIFY: '/auth/passotp-verify',
    AUTH_LOGIN: '/auth/login',
    AUTH_REFRESH_TOKEN: '/auth/refresh-token',
    AUTH_TOKEN_INFO: '/auth/token-info',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
    AUTH_RESET_PASSWORD: '/auth/reset-password',
    AUTH_CHANGE_PASSWORD: '/auth/change-password',
    AUTH_RESEND_OTP: '/auth/resend-otp',
    AUTH_ME: '/auth/me',

    // Users
    USERS: '/users', // POST: Create user, GET: Get all users (pagination/filter/sort)
    USERS_CREATE_ADMIN_INSTRUCTOR: '/users/create-admin-instructor', // POST: Create admin/instructor
    USER_BY_ID: (id: string) => `/users/${id}`, // GET: Get user by ID, PATCH: Update user, DELETE: Delete user
    USER_ASSIGN_ROLE: (id: string) => `/users/${id}/assign-role`, // POST: Assign role
    USER_PERMISSIONS: (id: string) => `/users/${id}/permissions`, // POST: Assign permissions, GET: Get permissions
    USER_ENROLLED_COURSES: (id: string) => `/users/${id}/enrolled-courses`, // GET: User's enrolled courses
    USER_COURSE_STATS: (id: string) => `/users/${id}/course-stats`, // GET: User's course stats
    USER_COMPLETED_CERTIFICATES: (id: string) => `/users/${id}/completed-certificates`, // GET: User's completed certificates
    USER_CONTINUE_LEARNING: (id: string) => `/users/${id}/continue-learning`, // GET: User's continue learning courses


    // Courses
    COURSES: '/courses',
    COURSES_FEATURED: '/courses/featured',
    COURSE_BY_ID: (id: string) => `/courses/${id}`,
    COURSE_ENROLL: (id: string) => `/courses/${id}/enroll`,
    COURSE_PROGRESS: (id: string) => `/courses/${id}/progress`,
    COURSE_UPLOAD_THUMBNAIL: (id: string) => `/courses/${id}/upload-thumbnail`,
    COURSE_LESSONS: (id: string) => `/courses/${id}/lessons`,
    COURSE_SECTIONS: (id: string) => `/courses/${id}/sections`,
    COURSE_SECTIONS_LESSONS: (id: string) => `/courses/${id}/sections-lessons`,
    COURSE_ENROLL_INFO: (id: string) => `/courses/${id}/enroll-info`,
    COURSE_QUIZZES: (id: string) => `/courses/${id}/quizzes`,
    COURSES_BY_TYPE: (type: string) => `/courses/type/${type}`,


    // Lessons
    ALL_LESSIONS: '/courses/lessons',
    LESSON_BY_ID: (lessonId: string) => `/courses/lessons/${lessonId}`,
    LESSON_PROGRESS: (lessonId: string) => `/courses/lessons/${lessonId}/progress`,
    LESSONS_BY_SECTION: (sectionId: string) => `/courses/sections/${sectionId}/lessons`,
    LESSONS_PROGRESS: '/courses/lessons/progress',
    USER_LESSONS_PROGRESS: (userId: string) => `/courses/users/${userId}/lessons/progress`,

    // Sections
    SECTIONS: '/courses/sections',
    SECTION_BY_ID: (sectionId: string) => `/courses/sections/${sectionId}`,
    SECTION_QUIZZES: (sectionId: string) => `/courses/sections/${sectionId}/quizzes`,

    // Quizzes
    QUIZZES: '/courses/quizzes',
    QUIZ_BY_ID: (quizId: string) => `/courses/quizzes/${quizId}`,

    // Certificates
    CERTIFICATES: '/courses/certificates',

    // Categories
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id: string) => `/categories/${id}`,

    // Roles
    // POST /roles - create role (Super Admin only)
    ROLES_CREATE: '/roles',
    // GET /roles - list roles
    ROLES_LIST: '/roles',
    // GET /roles/permissions - list all available permissions
    ROLES_PERMISSIONS_LIST: '/roles/permissions',
    // GET /roles/{id} - get role by ID
    ROLE_GET: (id: string) => `/roles/${id}`,
    // PATCH /roles/{id} - update role
    ROLE_UPDATE: (id: string) => `/roles/${id}`,
    // DELETE /roles/{id} - delete role
    ROLE_DELETE: (id: string) => `/roles/${id}`,
    // POST /roles/{id}/permissions - assign permissions to role
    ROLE_ASSIGN_PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  },
};

export const DATABASE_CONFIG = {
  // Add your database configuration here
  // This could be MongoDB, PostgreSQL, etc.
  CONNECTION_STRING: process.env.DATABASE_URL || '',
  DATABASE_NAME: process.env.DATABASE_NAME || 'shekhabo',
};

export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: 12,
};

export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};