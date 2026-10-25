import React from 'react';

export default function QronosGuidelines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[40] w-full max-w-[1400px] -translate-x-1/2"
    >
      <span className="absolute inset-y-0 left-0 w-px bg-white/10 mix-blend-difference lg:left-5" />
      <span className="absolute inset-y-0 right-0 w-px bg-white/10 mix-blend-difference lg:right-5" />
      <span className="absolute inset-y-0 left-px w-px bg-white/5 mix-blend-difference lg:left-7 hidden sm:block" />
      <span className="absolute inset-y-0 right-px w-px bg-white/5 mix-blend-difference lg:right-7 hidden sm:block" />
    </div>
  );
}
