import React from 'react';
import ActivityCard from '../ActivityCard';
import { ActivitySort } from '../shared';
import { Skeleton } from '@/components/ui/skeleton';

const ActivityList = ({ 
  kegiatan = [], 
  kategoriList = [], 
  isLoading, 
  sortOrder, 
  onSort, 
  onEdit, 
  onDelete 
}) => {
  const safeKegiatan = Array.isArray(kegiatan) ? kegiatan : [];
  const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];
  if (isLoading) {
    return (
      <div className="mt-6">
        <div className='mb-2 flex items-center justify-between'>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({length: 6}).map((_, index) => (
            <div key={index} className='rounded-lg order g-hite p-4 shadow-sm'>
              <Skeleton className="h-40 w-full rounded-md" />
              <div className='mt-4 space-y-3'>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className='mt-4 flex gap-2'>
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div> 
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Daftar Kegiatan</h2>
        <ActivitySort sortOrder={sortOrder} onSort={onSort} />
      </div>
      
      {safeKegiatan.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium">Belum ada kegiatan</p>
          <p className="text-sm">Tambahkan kegiatan pertama Anda</p>
        </div>
      ) : (
        <ul className="space-y-3 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeKegiatan.map((item) => (
            <ActivityCard
              key={item.id}
              kegiatan={item}
              kategoriList={safeKategoriList}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityList;
