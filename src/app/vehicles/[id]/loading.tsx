import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="w-full aspect-[16/9] rounded-lg mb-3" />
        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-28 shrink-0" />
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-7 w-40 rounded-full" />
      </div>

      <Skeleton className="h-16 w-full rounded-lg" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}
