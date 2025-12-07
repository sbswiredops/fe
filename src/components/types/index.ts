export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  joinedAt: Date;
}

export interface Instructor {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  categories_avatar?: string | null;
  icon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  isLocked?: boolean;
  isPaid?: boolean;
  price?: number | null;
  createdAt?: string;
  createdby?: string;
  updatedAt?: string;
  updatedby?: string;
  totalQuestions: number;
  totalMarks: number;
  totalTime: number;
  passMark: number;
  hasNegativeMark?: boolean;
  negativeMarkPercentage?: number | null;
  isFinalQuiz?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  video?: string;
  resource?: string | null;
  isFree?: boolean;
  duration?: number;
  orderIndex?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  sectionId?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  orderIndex?: number;
  status?: boolean;
  isQuizLocked?: boolean;
  isFinalSection?: boolean;
  lessons: Lesson[];
  quizzes?: Quiz[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: string | Instructor;
  instructorId: string;
  price: number | string;
  discountPrice?: number | string;
  discountPercentage?: number | string;
  duration: string | number;
  thumbnail: string;
  courseIntroVideo?: string | null;
  category: string | Category;
  categoryId?: string;
  rating: number | string;
  reviewCount?: number;
  enrollmentCount: number;
  sections: Section[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdby?: string;
  updatedby?: string;
  type?: 'Recorded' | 'Live';
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  isPublished?: boolean;
  isFeatured?: boolean;
  total?: number;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  scheduledAt: Date;
  duration: number; // in minutes
  meetingLink: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  studentName: string;
  studentImage: string;
  rating: number;
  comment: string;
  course: string;
  createdAt: Date;
}

export interface Language {
  code: 'en' | 'bn';
  name: string;
  flag: string;
}

export interface Translation {
  [key: string]: string | Translation;
}
