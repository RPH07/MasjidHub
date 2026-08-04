import { Skeleton } from '@/components/ui/skeleton';

const ActivitiesListSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-72 max-w-full mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-xl mx-auto" />
        </div>

        <Skeleton className="h-12 w-full max-w-md mx-auto mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-5" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesListSkeleton;
