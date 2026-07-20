import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  if (type === 'hero') {
    return (
      <div className="relative w-full h-[600px] lg:h-[650px] bg-[#0B0B0B] overflow-hidden">
        <div className="skeleton absolute inset-0 opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent z-10"></div>
        <div className="relative z-20 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-xl space-y-6">
            <div className="skeleton h-6 w-32 rounded-full"></div>
            <div className="skeleton h-14 w-96 rounded-xl"></div>
            <div className="skeleton h-4 w-80 rounded"></div>
            <div className="flex gap-3">
              <div className="skeleton h-5 w-16 rounded"></div>
              <div className="skeleton h-5 w-16 rounded"></div>
              <div className="skeleton h-5 w-16 rounded"></div>
            </div>
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-3/4 rounded"></div>
            <div className="flex gap-4 pt-2">
              <div className="skeleton h-12 w-40 rounded-xl"></div>
              <div className="skeleton h-12 w-40 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden border border-border bg-bg-card shadow-sm"
          >
            <div className="relative aspect-poster">
              <div className="skeleton absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 skeleton h-6 w-16 rounded-md" />
              <div className="absolute top-3 right-3 skeleton h-6 w-14 rounded-md" />
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5">
                <div className="skeleton h-4 w-4/5 rounded-md" />
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="skeleton h-9 w-full rounded-lg mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'trending') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="skeleton w-20 h-28 rounded-xl shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-3 w-2/3 rounded"></div>
              <div className="skeleton h-3 w-1/3 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
