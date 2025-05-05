import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Statistik */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Kas</div>
          </div>
          <div className="mt-2 text-2xl font-bold">Rp 5.000.000</div>
          <div className="text-sm text-gray-500">+12% dari bulan lalu</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Kegiatan</div>
          </div>
          <div className="mt-2 text-2xl font-bold">15</div>
          <div className="text-sm text-gray-500">3 kegiatan baru</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Zakat</div>
          </div>
          <div className="mt-2 text-2xl font-bold">Rp 2.300.000</div>
          <div className="text-sm text-gray-500">Terkumpul bulan ini</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">Total Anggota</div>
          </div>
          <div className="mt-2 text-2xl font-bold">120</div>
          <div className="text-sm text-gray-500">+5 minggu ini</div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center justify-between border-b pb-2">
              <div>
                <div className="font-medium">Kegiatan {item}</div>
                <div className="text-sm text-gray-500">10 Mei 2025</div>
              </div>
              <div className="text-sm font-medium text-green-600">Rp 500.000</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;