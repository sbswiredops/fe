"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLanguage } from "../contexts/LanguageContext";
import Image from "next/image";

function Counter({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    let raf: number;

    function update() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        raf = requestAnimationFrame(update);
      } else {
        setCount(end);
      }
    }
    update();
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-8 pb-4 px-2 sm:px-6 lg:pt-20 lg:pb-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t("hero.title")}{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #51356e 0%, #8e67b6 100%)",
                  }}
                >
                  {t("hero.subtitle")}
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t("hero.description")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="w-full sm:w-auto btn-hover btn-animate"
                >
                  {t("hero.ctaButton")}
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/demo">
                <button
                  className="w-full sm:w-auto btn-hover justify-center btn-animate border-[2px] rounded-lg flex items-center px-6 py-3"
                  style={{
                    borderColor: "var(--color-text-primary)",
                    color: "var(--color-text-primary)",
                    backgroundColor: "rgba(80, 53, 110, 0.05)",
                    minWidth: "0",
                    maxWidth: "100%",
                  }}
                >
                  <span className="flex items-center justify-center">
                    <span>{t("hero.watchDemo")}</span>
                  </span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Counter end={10000} duration={2000} suffix="+" />
                </div>
                <div className="text-sm text-gray-600">
                  {t("featuredCourses.students")}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Counter end={500} duration={2000} suffix="+" />
                </div>
                <div className="text-sm text-gray-600">{t("nav.courses")}</div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Counter end={100} duration={2000} suffix="+" />
                </div>
                <div className="text-sm text-gray-600">Instructors</div>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center  lg:justify-end items-center">
            <div className="absolute inset-0 "></div>

            <div className="relative w-full max-w-none lg:max-w-[780px] xl:max-w-[920px] aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/10] rounded-tl-2xl rounded-br-2xl overflow-hidden">
              <Image
                src="/my.png"
                alt="Learning Platform Hero"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                className="object-contain object-top" // removed rounded here
                priority
              />
            </div>
            <div className="floating-element floating-element-1"></div>
            <div className="floating-element floating-element-2"></div>
            <div className="floating-element floating-element-3"></div>
            <div className="floating-element floating-element-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
