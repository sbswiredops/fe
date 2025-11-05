import React, { useMemo, useRef, useState, useEffect } from "react";
import CourseCard from "./CourseCard";
import { Course } from "../types";

export interface CardSliderProps {
  items: Course[];
  title?: string;
  categories?: string[];
  className?: string;
  renderItem?: (item: Course) => React.ReactNode;
}

export default function CardSlider({
  items,
  title,
  categories = [],
  className = "",
  renderItem,
}: CardSliderProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [visibleSlides, setVisibleSlides] = useState(3);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (category !== "all" && it.category !== category) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        (it.instructor || "").toLowerCase().includes(q)
      );
    });
  }, [items, search, category]);
  // Auto-move logic
  // ...filtered is now declared above, remove this duplicate...

  // Auto-move logic (moved below filtered declaration)

  useEffect(() => {
    if (isHovered || filtered.length <= visibleSlides) return;
    const el = containerRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      // If at end, go to start
      if (el.scrollLeft + el.clientWidth + 10 >= el.scrollWidth) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll right by one slide
        const child = el.querySelector<HTMLElement>("[data-slider-item]");
        const styles = getComputedStyle(el);
        const gap = parseFloat(styles.columnGap || styles.gap || "16");
        const childWidth = child
          ? child.getBoundingClientRect().width
          : el.clientWidth / visibleSlides;
        const distance = childWidth + gap;
        el.scrollTo({ left: el.scrollLeft + distance, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [filtered, visibleSlides, isHovered]);

  // Always show 4 cards per screen
  useEffect(() => {
    setVisibleSlides(4);
  }, []);

  // ...filtered is now declared at the top, remove this duplicate...

  const scrollBySlides = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    // Calculate slide width using first child
    const child = el.querySelector<HTMLElement>("[data-slider-item]");
    const styles = getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "16");
    const childWidth = child
      ? child.getBoundingClientRect().width
      : el.clientWidth / visibleSlides;
    const distance = childWidth * visibleSlides + gap * (visibleSlides - 1);
    const target =
      direction === "left"
        ? el.scrollLeft - distance
        : el.scrollLeft + distance;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const goToStart = () => {
    containerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const goToEnd = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  };

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth + 10 < el.scrollWidth);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [filtered, visibleSlides]);

  return (
    <section
      className={`card-slider-section overflow-visible ${className}`}
      aria-labelledby={title ? "card-slider-title" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Responsive header and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          {title && (
            <h2
              id="card-slider-title"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </h2>
          )}
          <p className="text-sm text-gray-600">{filtered.length} items</p>
        </div>

        {/* Responsive filters container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search input */}
          <div className="flex-1 sm:flex-initial flex items-center border border-gray-200 rounded overflow-hidden bg-white">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="flex-1 px-3 py-2 text-sm outline-none w-full sm:w-44 md:w-64 text-gray-900 placeholder-gray-400"
              aria-label="Search courses"
            />
            <button
              onClick={() => setSearch("")}
              className="px-3 border-l border-gray-200 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              aria-label="Clear search"
            >
              Clear
            </button>
          </div>

          {/* Category select */}
          <div className="flex-1 sm:flex-initial flex items-center bg-white border border-gray-200 rounded">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm outline-none bg-transparent text-gray-900"
              aria-label="Filter by category"
            >
              <option value="all" className="text-gray-900">
                All categories
              </option>
              {categories.map((c) => (
                <option key={c} value={c} className="text-gray-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => scrollBySlides("left")}
              aria-label="Previous"
              className={`bg-white rounded-full p-2 shadow transition-opacity border border-gray-200 ${
                canScrollLeft ? "opacity-100" : "opacity-30 pointer-events-none"
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => scrollBySlides("right")}
              aria-label="Next"
              className={`bg-white rounded-full p-2 shadow transition-opacity border border-gray-200 ${
                canScrollRight
                  ? "opacity-100"
                  : "opacity-30 pointer-events-none"
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full flex justify-center">
        <div
          ref={containerRef}
          className="slider-container overflow-x-auto overflow-y-visible scrollbar-hide flex gap-4 snap-x snap-mandatory no-scrollbar touch-pan-x scroll-smooth max-w-screen-xl w-full py-3 lg:py-4 px-4 sm:px-6 lg:px-8"
          role="list"
        >
          {filtered.map((it, idx) => (
            <div
              key={it.id}
              data-slider-item
              role="listitem"
              className={
                `flex-shrink-0 w-[90vw] sm:w-[320px] md:w-[300px] slider-item-1of4` +
                (idx === filtered.length - 1 ? " mr-0" : "")
              }
            >
              {renderItem ? renderItem(it) : <CourseCard course={it} />}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({
          length: Math.max(1, Math.ceil(filtered.length / visibleSlides)),
        }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              const child = el.querySelector<HTMLElement>("[data-slider-item]");
              const styles = getComputedStyle(el);
              const gap = parseFloat(styles.columnGap || styles.gap || "16");
              const childWidth = child
                ? child.getBoundingClientRect().width
                : el.clientWidth / visibleSlides;
              el.scrollTo({
                left: i * (childWidth + gap) * visibleSlides,
                behavior: "smooth",
              });
            }}
            className="w-2 h-2 rounded-full bg-gray-300"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
