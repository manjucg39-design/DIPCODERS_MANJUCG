import React from 'react';

interface QronosSeparatorProps {
  className?: string;
}

export default function QronosSeparator({ className = '' }: QronosSeparatorProps) {
  return (
    <div aria-hidden="true" className={`qronos-separator ${className}`}>
      <div className="qronos-separator-hatch" />
      {/* 4 corner reticles */}
      <span className="qronos-reticle left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
      <span className="qronos-reticle right-0 top-0 translate-x-1/2 -translate-y-1/2" />
      <span className="qronos-reticle bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
      <span className="qronos-reticle bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
    </div>
  );
}
