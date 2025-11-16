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
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  courseIntroVideo?: string;
  price: number;
  duration: string;
  enrollmentCount?: number;
  rating?: number;
  instructor?: string;
  instructorId?: string;
  category?: string | { name: string };
  createdAt?: Date;
  sections: Section[]; // <-- Add this line
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
