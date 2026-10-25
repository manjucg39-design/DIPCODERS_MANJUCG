import React from 'react';
import { Link } from 'react-router-dom';

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  variant?: 'white' | 'orange' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function StarButton({
  to,
  variant = 'white',
  size = 'md',
  children,
  icon,
  className = '',
  onClick,
  disabled,
  type = 'button',
  ...props
}: StarButtonProps) {
  const sizeClasses = {
    sm: 'text-[11px] py-1.5 px-3.5 h-8',
    md: 'text-xs py-2 px-4 h-9',
    lg: 'text-sm py-2.5 px-5 h-11',
  }[size];

  const beamColor = variant === 'orange' ? 'star-btn-beam-orange' : 'star-btn-beam';

  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 transition-transform group-hover:translate-x-0.5">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );

  const innerContent = (
    <>
      <div className={beamColor} aria-hidden="true" />
      <span className={`star-btn-inner ${sizeClasses}`}>
        <span className="flex items-center gap-1.5">
          {children}
          {icon ?? defaultIcon}
        </span>
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`star-btn-container group no-underline inline-flex ${className}`}
        aria-disabled={disabled}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`star-btn-container group cursor-pointer ${className}`}
      {...props}
    >
      {innerContent}
    </button>
  );
}
