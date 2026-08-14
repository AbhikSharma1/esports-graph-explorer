export function SkeletonBlock({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-white/[0.04] rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

export function SidePanelSkeleton() {
  return (
    <div className="p-5 space-y-4">
      {/* Avatar + name area */}
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-14 rounded-xl" />)}
      </div>
      {/* Content rows */}
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-1/3" />
        <SkeletonBlock className="h-10 rounded-xl" />
        <SkeletonBlock className="h-10 rounded-xl" />
        <SkeletonBlock className="h-10 rounded-xl" />
      </div>
    </div>
  );
}
