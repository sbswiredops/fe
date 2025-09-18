import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import FreeLiveMasterclass from '@/components/home/FreeLiveMasterclass';
import RecordedCoursesSection from '@/components/home/RecordedCoursesSection';
import LiveCourseContents from '@/components/home/LiveCourseContents';
import LiveClasses from '@/components/home/LiveClasses';
import Testimonials from '@/components/home/Testimonials';


export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedCourses />
      <LiveClasses />
      <FreeLiveMasterclass />
      <RecordedCoursesSection />
      <LiveCourseContents />
      <Testimonials />
    </MainLayout>
  );
}
