import React from 'react';

interface QronosCardProps {
  children: React.ReactNode;
  className?: string;
  withReticles?: boolean;
  withTopRim?: boolean;
}

export default function QronosCard({
  children,
  className = '',
  withReticles = false,
  withTopRim = true,
}: QronosCardProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[14px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(19,19,21,0.96),rgba(7,7,8,0.98))] p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.7),0_10px_30px_rgba(0,0,0,0.4)] ${className}`}
    >
      {withTopRim && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[1.125rem] top-0 h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-slate-300/0 via-slate-200/80 to-slate-300/0"
        />
      )}
      {withReticles && (
        <>
          <span className="qronos-reticle left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
          <span className="qronos-reticle right-0 top-0 translate-x-1/2 -translate-y-1/2" />
          <span className="qronos-reticle bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <span className="qronos-reticle bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </>
      )}
      {children}
    </div>
  );
}
