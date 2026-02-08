export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  joinedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  video?: string;
  resource?: string;
  isFree?: boolean;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
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

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: Instructor;
  instructorId: string;
  price: number | string;
  duration: number | string;
  thumbnail: string;
  category: Category | string; // Allow both Category object or string for flexibility
  rating: number | string;
  sections: any[];
  courseIntroVideo: string | null;
  enrollmentCount: number;
  createdAt: Date | string;
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
  discountPercentage?: number;
  discountPrice?: number;
    faqs?: Faq[]; // <-- Add this line

  // Add other fields as needed
}
export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder?: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
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
