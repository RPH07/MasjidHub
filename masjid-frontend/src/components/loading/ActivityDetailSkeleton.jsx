import { Skeleton } from '@/components/ui/skeleton';

const ActivityDetailSkeleton = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <Skeleton className="w-full h-72 md:h-96 rounded-none" />
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>

        <Skeleton className="h-6 w-28 mb-4" />
        <Skeleton className="h-10 w-full max-w-2xl mb-5" />

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <Skeleton className="h-5 w-44 max-w-full" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-36 max-w-full" />
        </div>

        <article className="bg-white border rounded-lg p-6">
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-5/6 mb-3" />
          <Skeleton className="h-4 w-2/3" />
        </article>
      </section>
    </main>
  );
};

export default ActivityDetailSkeleton;
