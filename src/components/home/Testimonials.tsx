'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Testimonial } from '../types';

// Mock data for testimonials
const testimonials: Testimonial[] = [
  {
    id: '1',
    studentName: 'Ahmed Rahman',
    studentImage: '/placeholder-avatar.jpg',
    rating: 5,
    comment: 'Shekhabo completely transformed my career. The courses are well-structured and the instructors are incredibly knowledgeable. I landed my dream job as a full-stack developer!',
    course: 'Full Stack Web Development',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    studentName: 'Fatima Khan',
    studentImage: '/placeholder-avatar.jpg',
    rating: 5,
    comment: 'The live classes feature is amazing! Being able to interact with instructors in real-time made all the difference in my learning experience.',
    course: 'Digital Marketing Mastery',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    studentName: 'Rahul Sharma',
    studentImage: '/placeholder-avatar.jpg',
    rating: 4,
    comment: 'Great platform with excellent content. The multi-language support helped me learn in my native language, making complex concepts easier to understand.',
    course: 'UI/UX Design Fundamentals',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    studentName: 'Sarah Abdullah',
    studentImage: '/placeholder-avatar.jpg',
    rating: 5,
    comment: 'I love how practical and job-focused the courses are. The skills I learned here directly applied to my work, leading to a promotion within 3 months!',
    course: 'Advanced React Patterns',
    createdAt: new Date('2024-01-25'),
  },
  {
    id: '5',
    studentName: 'Mohammad Ali',
    studentImage: '/placeholder-avatar.jpg',
    rating: 5,
    comment: 'The community support and instructor feedback have been exceptional. Shekhabo provides everything you need to succeed in your learning journey.',
    course: 'Data Science Bootcamp',
    createdAt: new Date('2024-01-30'),
  },
  {
    id: '6',
    studentName: 'Priya Patel',
    studentImage: '/placeholder-avatar.jpg',
    rating: 4,
    comment: 'Flexible learning schedule and high-quality content make this platform perfect for working professionals looking to upskill.',
    course: 'Machine Learning Fundamentals',
    createdAt: new Date('2024-02-05'),
  },
];

export default function Testimonials() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000); // Resume auto-play after 5 seconds
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl  mx-auto px-4 sm:px-10 lg:px-50">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative ">
          {/* Main Testimonial */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto">
            <div className="text-center">
              {/* Quote Icon */}
              <svg className="w-12 h-12 text-blue-600 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>

              {/* Rating */}
              <div className="flex justify-center mb-6">
                <StarRating rating={testimonials[currentIndex].rating} />
              </div>

              {/* Comment */}
              <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                "{testimonials[currentIndex].comment}"
              </blockquote>

              {/* Student Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {testimonials[currentIndex].studentName.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {testimonials[currentIndex].studentName}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentIndex].course}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => goToSlide(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goToSlide(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Additional Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-gray-200 rounded-lg p-6 card-shadow-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={testimonial.rating} />
                <span className="text-sm text-gray-500">{testimonial.course}</span>
              </div>
              <p className="text-gray-700 mb-4 line-clamp-3">
                &ldquo;{testimonial.comment}&rdquo;
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {testimonial.studentName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.studentName}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
