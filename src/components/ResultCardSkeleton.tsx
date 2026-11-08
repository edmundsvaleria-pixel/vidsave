// src/components/ResultCardSkeleton.tsx
import { Skeleton } from "./ui/Skeleton";

export default function ResultCardSkeleton() {
  return (
    <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6 w-full shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Thumbnail Skeleton */}
        <div className="w-full shrink-0 sm:w-40">
          <Skeleton className="aspect-square sm:aspect-video w-full rounded-lg" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Title & Author */}
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/4 mb-6" />

          {/* Buttons */}
          <div className="mt-auto space-y-2 pt-5">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>

          {/* Pro Tools */}
          <div className="pt-4 mt-2 border-t border-[#27272A]">
            <Skeleton className="h-3 w-20 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}