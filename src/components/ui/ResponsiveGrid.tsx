import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export default function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-6',
  className = ''
}: ResponsiveGridProps) {
  const gridCols = `grid-cols-${columns.mobile || 1} md:grid-cols-${columns.tablet || 2} lg:grid-cols-${columns.desktop || 3}`;
  
  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
}
