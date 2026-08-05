import { Skeleton } from '@/components/ui/skeleton';

const DonationProgramListSkeleton = ({ statsCount = 0, filters = true }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-24" />
        </div>

        {statsCount > 0 && (
            <div className={`grid grid-cols-1 gap-4 ${statsCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
                {Array.from({ length: statsCount }).map((_, index) => (
                    <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-3 h-8 w-28" />
                    </div>
                ))}
            </div>
        )}

        {filters && (
            <div className="rounded-lg bg-white p-4 shadow">
                <div className="grid gap-4 md:grid-cols-4">
                    <Skeleton className="h-10 w-full md:col-span-2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )}

        <div className="grid gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <Skeleton className="h-32 w-full rounded-md md:w-40" />
                        <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <Skeleton className="h-6 w-56 max-w-full" />
                                <Skeleton className="h-6 w-20 shrink-0" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default DonationProgramListSkeleton;
