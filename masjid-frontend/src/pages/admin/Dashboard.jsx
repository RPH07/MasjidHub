import React, { useState, useEffect } from 'react';
import api from '@/config/api';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-36" />

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-3 h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
      ))}
    </div>

    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Skeleton className="mb-4 h-6 w-40" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 border-b pb-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-52 max-w-full" />
              <Skeleton className="h-4 w-36 max-w-full" />
            </div>
            <Skeleton className="h-4 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalKas: 0,
    totalKegiatan: 0,
    totalZakat: 0,
    totalAnggota: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Mengambil semua data yang dibutuhkan secara paralel
        const [summaryRes, kegiatanRes, userRes] = await Promise.all([
          api.get('/kas/summary'),
          api.get('/kegiatan'),
          api.get('/user') 
        ]);

        const summaryData = summaryRes.data.data;
        const kegiatanResponse = kegiatanRes.data;
        const userData = userRes.data;

        let kegiatanData = [];
        if(Array.isArray(kegiatanResponse)){
          kegiatanData = kegiatanResponse;
        } else if (kegiatanResponse && Array.isArray(kegiatanResponse.data)){
          kegiatanData = kegiatanResponse.data;
        } else{
          console.warn('Data kegiatan tidak dalam format array:', kegiatanResponse)
        }

        setStats({
          totalKas: summaryData?.totalSaldo || 0,
          totalKegiatan: kegiatanData?.length || 0,
          // Mengambil total zakat dari ringkasan kas bulan ini
          totalZakat: summaryData?.pemasukanKategori?.zakat || 0,
          totalAnggota: userData?.length || 0,
        });

        // Mengambil 5 kegiatan terbaru
        setRecentActivities(kegiatanData.slice(0, 5));
        
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
        setError("Gagal memuat data dashboard. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Statistik */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Kas</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatCurrency(stats.totalKas)}</div>
          <div className="text-sm text-gray-500">Saldo saat ini</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Kegiatan</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.totalKegiatan}</div>
          <div className="text-sm text-gray-500">Kegiatan terencana & terlaksana</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Zakat</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatCurrency(stats.totalZakat)}</div>
          <div className="text-sm text-gray-500">Terkumpul bulan ini</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Anggota</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.totalAnggota}</div>
          <div className="text-sm text-gray-500">Jamaah terdaftar</div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{item.nama_kegiatan}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">{item.lokasi}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">Tidak ada aktivitas terbaru.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
