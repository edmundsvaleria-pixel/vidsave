// src/components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-[#1A1A1C] ${className}`} />
  );
}