// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string | 'asc' | 'desc' | 'ASC' | 'DESC';
}

export interface LessonsQuery extends PaginationQuery {
  search?: string;
  courseId?: string;
  sectionId?: string;
}
// User Types
export interface User {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  role?:  string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
    profileImage?: string;

  permissions?: Permission[];
  profile?: UserProfile;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}
export interface UserProfile {
  bio?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;

  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  role: 'admin' | 'teacher' | 'student';
  status?: 'active' | 'inactive';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  experience?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'teacher' | 'student';
  status?: 'active' | 'inactive';
  profile?: Partial<UserProfile>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface AssignRoleRequest {
  role: 'admin' | 'teacher' | 'student';
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  categoryId?: string;
  category?: Category;
  instructorId?: string;
  instructor?: User;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration: number | string; // minutes or formatted string
  level: 'beginner' | 'intermediate' | 'advanced' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  status?: 'draft' | 'published' | 'archived';
  isPublished?: boolean;
  featured: boolean;
  isFeatured?: boolean;
  courseType?: string;
  tags: string[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  totalLessons: number;
  totalDuration: string;
  requirements?: string[];
  learningOutcomes?: string[];
  whatYouWillLearn?: string[];
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
  quizzes?: Quiz[];
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  shortDescription?: string;
  categoryId?: string;
  instructorId?: string;
  thumbnail?: string | File;
  price: number;
  originalPrice?: number;
  duration: number | string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  status?: 'draft' | 'published';
  isPublished?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  courseType?: string;
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
  whatYouWillLearn?: string[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  instructorId?: string;
  thumbnail?: string | File;
  price?: number;
  originalPrice?: number;
  duration?: number | string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  status?: 'draft' | 'published' | 'archived';
  isPublished?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  courseType?: string;
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
  whatYouWillLearn?: string[];
}

export interface CourseFilters extends PaginationQuery {
  categoryId?: string;
  instructorId?: string;
  level?: string;
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
  status?: string;
  search?: string;
}

// Section Types
export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration?: string;
  lessons?: Lesson[];
  quizzes?: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  order: number;
}

export interface UpdateSectionRequest {
  title?: string;
  description?: string;
  order?: number;
}

// Lesson Types
export interface Lesson {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  resourceUrl?: string;
  duration: number; // in minutes
  orderIndex: number;
  isPublished: boolean;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonRequest {
  sectionId: string;
  title: string;
  content: string;
  videoUrl?: string | File;
  resourceUrl?: string | File;
  duration: number; // minutes
  orderIndex: number;
  isPublished?: boolean;
  isFree?: boolean;
}

export interface UpdateLessonRequest {
  title?: string;
  content?: string;
  videoUrl?: string | File;
  resourceUrl?: string | File;
  duration?: number; // minutes
  orderIndex?: number;
  isPublished?: boolean;
  isFree?: boolean;
}

// Progress Types
export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  timeSpent: number; // in seconds
  lastAccessed?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  timeSpent: number;
  lastAccessed?: string;
  completedAt?: string;
  certificateIssued: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProgressRequest {
  status?: 'not_started' | 'in_progress' | 'completed';
  progressPercentage?: number;
  timeSpent?: number;
}

// Quiz Types
export interface Quiz {
  id: string;
  courseId?: string;
  sectionId?: string;
  title: string;
  description?: string;
  // Legacy quiz fields (optional depending on backend)
  questions?: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
  maxAttempts?: number;
  status?: 'active' | 'inactive';
  // Entity fields
  isLocked?: boolean;
  isPaid?: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  // Legacy quiz fields (optional)
  questions?: Omit<QuizQuestion, 'id'>[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  status?: 'active' | 'inactive';
  // Entity fields
  isLocked?: boolean;
  isPaid?: boolean;
  price?: number;
  courseId?: string;
  sectionId?: string;
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  questions?: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  status?: 'active' | 'inactive';
  isLocked?: boolean;
  isPaid?: boolean;
  price?: number;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
  progress: CourseProgress;
}

export interface EnrollmentRequest {
  courseId: string;
  paymentMethod?: string;
  paymentId?: string;
}

export interface EnrollmentInfo {
  isEnrolled: boolean;
  canEnroll: boolean;
  enrollment?: Enrollment;
  requiredPayment: boolean;
  price: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  icon?: string;
  image?: string;
  categories_avatar?: string;
  isActive?: boolean;
  courseCount: number;
  featured: boolean;
  status?: 'active' | 'inactive';
  order: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  icon?: string | File;
  categories_avatar?: string | File;
  featured?: boolean;
  isActive?: boolean;
  status?: 'active' | 'inactive';
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  icon?: string | File;
  categories_avatar?: string | File;
  featured?: boolean;
  isActive?: boolean;
  status?: 'active' | 'inactive';
  order?: number;
}

// Certificate Types
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  // Legacy name some backends may return
  certificateNumber?: string;
  verificationUrl?: string;
  // Entity fields
  certificateCode?: string;
  certificateUrl?: string;
  templateUrl?: string;
  qrCodeUrl?: string;
  issuedAt: string;
  user?: User;
  course?: Course;
}

export interface CreateCertificateRequest {
  userId: string;
  courseId: string;
}

// File Upload Types
export interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  type?: string;
  error?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
