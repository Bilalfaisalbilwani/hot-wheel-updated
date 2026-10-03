import React from 'react';

interface DirhamSymbolProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  strokeWidth?: number;
}

/**
 * UAE Dirham Sign (U+20C3) SVG Component
 * Visual Design: Latin capital letter 'D' with two horizontal crossbars.
 * Rendered as an ultra-crisp vector SVG that scales perfectly at all sizes
 * and aligns naturally with typography baseline, matching standard currency symbols like $.
 */
export const DirhamSymbol: React.FC<DirhamSymbolProps> = ({
  className = '',
  size = 'custom',
  strokeWidth = 2.4,
  style,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    custom: 'w-[0.9em] h-[0.9em]'
  }[size];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 align-[-0.12em] ${sizeClasses} ${className}`}
      aria-label="UAE Dirham"
      role="img"
      style={style}
      {...props}
    >
      {/* Latin Capital D: Vertical Spine */}
      <path d="M6 3.5v17" />
      {/* Latin Capital D: Rounded Outer Loop / Bowl */}
      <path d="M6 3.5h5.5a8.5 8.5 0 0 1 0 17H6" />
      {/* Two Horizontal Parallel Crossbars */}
      <path d="M2.5 9h16.5" />
      <path d="M2.5 15h16.5" />
    </svg>
  );
};

export default DirhamSymbol;
