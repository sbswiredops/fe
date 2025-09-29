Shekhabo Project Documentation (A–Z)

Overview
- Stack: Next.js (App Router) 15, React 19, TypeScript, Tailwind CSS v4, Lucide React, Axios, React Toastify
- Folder root: src/app (routes), src/components (UI), src/services (API), src/lib (stores/config)
- Layout: All public pages use src/components/layout/MainLayout.tsx which renders Header + page content + Footer

Fonts
- Configured via next/font in src/app/layout.tsx: Geist (Sans) and Geist_Mono (Mono) with CSS variables:
  • --font-geist-sans, --font-geist-mono
- Tailwind theme maps to: --font-sans: var(--font-geist-sans), --font-mono: var(--font-geist-mono)
- Global body font currently set in src/app/globals.css to Arial, Helvetica, sans-serif (overrides the font variable for body text)

Colors & Tokens
- CSS variables in src/app/globals.css:
  • --background: #ffffff (dark: #0a0a0a)
  • --foreground: #171717 (dark: #ededed)
  • --color-text-primary: #51356e
- Common gradient brand: linear-gradient(90deg, #51356e 0%, #8e67b6 100%)

Responsive Breakpoints (Tailwind defaults)
- sm ≥ 640px, md ≥ 768px, lg ≥ 1024px, xl ≥ 1280px, 2xl ≥ 1536px

Global Layout & Containers
- Containers: max-w-7xl (1280px) center-aligned with responsive horizontal padding
  • Typical page paddings: px-4 (16px), sm:px-6 (24px), lg:px-8 (32px)
- Page sections frequently use pt-16/pb-8 or py-16 spacing
- Body/html: overflow-x hidden; universal box-sizing; mobile tables scrollable

Header (src/components/layout/Header.tsx)
- Sticky, white background, border-b, z-30
- Logo sizes:
  • base: w-30 h-30 (7.5rem = 120px)
  • md: w-32 h-32 (8rem = 128px)
  • sm: w-16 h-16 (4rem = 64px)
- Desktop nav visible ≥ md; items in max-w-[60vw]
- Language dropdown; Auth Drawer for login; Mobile menu for < md

Footer (src/components/layout/Footer.tsx)
- Background: #8e67b6 with decorative top wave; text primarily white/gray
- Layout: max-w-7xl container; grid columns responsive: 1 → 2 → 4
- Social buttons: w-9 h-9 (36px), rounded-full; bottom bar with © year
- Included by MainLayout on all public pages

Home Page (src/app/page.tsx)
- Sections rendered in order: HeroSection, FeaturedCourses, LiveClasses, FreeLiveMasterclass, RecordedCoursesSection, LiveCourseContents, Testimonials

Hero Section (src/components/home/HeroSection.tsx)
- Typography:
  • Title: text-4xl (2.25rem/36px) on base, lg:text-6xl (3.75rem/60px)
  • Lead: text-xl (1.25rem/20px)
- Highlight span uses gradient background clip with brand colors
- CTA button sizes: Button size="lg"; secondary CTA styled with var(--color-text-primary)
- Stats: three counters, numbers styled with var(--color-text-primary)
- Illustration:
  • Wrapper: relative container with aspect ratios: base sm: aspect-[4/3], lg: aspect-[16/10]
  • Image: next/image fill; sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"; object-contain
  • Floating decorative elements with keyframe animation

Featured Courses (src/components/home/FeaturedCourses.tsx)
- Auto-advancing horizontal list of CourseCard
- Container paddings: pl-6/pr-4 (increase on sm+)
- "View All Courses" button uses outline style; hover swaps to var(--color-text-primary)

Live Classes (src/components/home/LiveClasses.tsx)
- Grid: 1 col → 2 cols (lg) → 3 cols (xl); cards have gradient header, info, progress bar
- Handles empty state: “No live classes available.”

Recorded Courses (src/components/home/RecordedCoursesSection.tsx)
- Uses CardSlider with controls and filters; shows up to 4 latest

Live Course Contents (src/components/home/LiveCourseContents.tsx)
- Features grid: 1 → 2 → 3 columns; rounded-3xl cards with subtle gradients
- Stats grid: 1 → 2 → 4; gradient icon tiles; KPIs like 9,000+ Job Placement

Testimonials (src/components/home/Testimonials.tsx)
- Carousel with autoplay; main highlighted card and grid of additional items

Course Card (src/components/ui/CourseCard.tsx)
- Outer card: w-full on narrow screens; sm:w-[330px]
- Thumbnail area: h-50 (12.5rem ≈ 200px), gradient background with icon
- Content area: p-5; fixed content height h-[280px]
- Category badge, title (line-clamp-2), instructor row, rating, enrolled count, price

Card Slider (src/components/ui/CardSlider.tsx)
- Item widths by breakpoint:
  • sm:w-[320px], md:w-[300px], lg:w-[300px], xl:w-[320px], 2xl:w-[320px]
- Visible slides auto-detected by window width; auto-scroll with pause on hover
- Header includes search, category filter, and arrow controls

Courses Listing (src/app/courses/page.tsx)
- Hero banner with brand gradient background
- Sidebar filters: search, categories, free-only; sort options (popularity, rating, newest, price)
- Grid: 1 col → 2 cols (sm) → 4 cols (xl); uses CourseCard

Course Details (src/app/courses/[id]/page.tsx)
- Two-column layout (lg): details + sticky purchase card
- Sticky purchase card image: h-48 (12rem = 192px); price emphasis; actions use var(--color-text-primary)
- Sections: What you’ll learn, Content modules, Prerequisites, Instructor

Dashboard (src/components/layout/DashboardLayout.tsx + src/app/dashboard/**)
- Protected via AuthContext; role-aware navigation (admin/teacher/student)
- Sidebar 256px (w-64) with sticky behavior; header with language/user menus
- Routes (non-exhaustive):
  • /dashboard, /dashboard/admin, /dashboard/teacher, /dashboard/student
  • Admin sub-pages: users, employees, courses (categories/certificate/lessons/quiz/sections)
  • Student sub-pages: learn/[id], profile

Other Public Pages
- About: src/app/about/page.tsx (multiple feature grids, workshops, reasons, CTA)
- Contact: src/app/contact/page.tsx (form + info + map placeholder)
- API Docs: src/app/api-docs/page.tsx
- Support: src/app/support/page.tsx
- Privacy: src/app/privacy/page.tsx
- Terms: src/app/terms/page.tsx
- Profile: src/app/profile/page.tsx

Internationalization
- Language provider: src/components/contexts/LanguageContext.tsx
- Locales: src/components/locales/en.json, src/components/locales/bn.json
- Header + pages use t("...") keys; language switcher in Header/Dashboard header

Services & Data
- Course/Category APIs: src/services/courseService.ts, src/services/categoryService.ts
- Auth: src/services/authService.ts; User: src/services/userService.ts
- Types: src/components/types, src/types/api.ts

Global CSS (src/app/globals.css)
- Tailwind import and inline theme mapping
- Utilities: .btn-animate, .card-shadow-hover, .slider-container, hero styles, floating elements animations
- Media queries:
  • Mobile (≤ 640px): hero/image and floating elements size adjustments; slider snap behavior
  • Tablet (641–1024px): hero image object-fit cover

Image & Asset Usage
- next/image used for hero and some logos; many cards use decorative SVG placeholders
- Public assets in /public (e.g., globe.svg, next.svg, vercel.svg, window.svg, file.svg)

Spacing & Sizing Reference (common Tailwind classes mapped)
- text-xl = 1.25rem (20px); text-3xl = 1.875rem (30px); text-4xl = 2.25rem (36px); text-5xl = 3rem (48px); text-6xl = 3.75rem (60px)
- w-30/h-30 = 7.5rem (120px); h-48 = 12rem (192px); h-50 ≈ 12.5rem (200px)
- px-4 = 16px; sm:px-6 = 24px; lg:px-8 = 32px

Accessibility & Performance
- Buttons/links have hover/focusable states; semantic headings per section
- Lists and grids adapt across breakpoints; scroll areas hide scrollbars visually
- next/font optimizes font loading; next/image optimizes images

How the Footer is Included Everywhere
- All public pages import and render MainLayout (src/components/layout/MainLayout.tsx) which composes Header + main + Footer
- Root layout (src/app/layout.tsx) provides global providers and metadata

Notes
- Primary brand color is provided via --color-text-primary and should be used for accents/hover states
- Keep existing gradients, rounded shapes, and purple branding consistent across new sections
