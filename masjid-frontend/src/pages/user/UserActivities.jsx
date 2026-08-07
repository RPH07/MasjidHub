import React, { useState, useEffect } from 'react';
import api from '@/config/api';
import { Button } from "@/components/ui/button";
import { FloatingInput } from '@/components/form';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/navigation/Footer';
import { ActivitiesListSkeleton } from '@/features/activities/components/loading';
import toast from 'react-hot-toast';

const UserActivities = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchKegiatan();
  }, []);

const fetchKegiatan = async () => {
    try {
      const response = await api.get('/kegiatan');
      const kegiatanData = response.data.data || response.data || [];

      const sortedKegiatan = kegiatanData.sort((a, b) => {
        return new Date(b.tanggal) - new Date(a.tanggal);
      });
      
      setKegiatan(sortedKegiatan);
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      toast.error('Gagal mengambil data kegiatan')
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (item) => item.judul || item.nama_kegiatan || 'Kegiatan Masjid';
  const getCategory = (item) => item.kategori?.nama_kategori || item.kategori_nama || 'Umum';
  const getImage = (item) => item.image_url || item.foto || null;
  const normalizeLabel = (value) => String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const includesSearch = (value) => String(value || '').toLowerCase().includes(searchTerm.toLowerCase());

  // Filter kegiatan berdasarkan search
  const filteredKegiatan = kegiatan.filter(item => 
    includesSearch(getTitle(item)) ||
    includesSearch(item.deskripsi) ||
    includesSearch(item.lokasi) ||
    includesSearch(getCategory(item))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <ActivitiesListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kegiatan <span className="text-green-600">Masjid</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Berbagai program dan kegiatan yang diselenggarakan untuk kemajuan umat
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <FloatingInput
              label="Cari Kegiatan"
              name="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputClassName="border-gray-300 focus:ring-green-500"
              labelFocusClass="peer-focus:text-green-600"
            />
          </div>
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Ditemukan <span className="font-semibold text-green-600">{filteredKegiatan.length}</span> kegiatan
              {searchTerm && ` untuk "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Kegiatan Grid */}
        {filteredKegiatan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredKegiatan.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {getImage(item) ? (
                    <img
                      src={getImage(item)}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-4xl">🕌</span>
                    </div>
                  )}
                  {/* Kategori Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                      {normalizeLabel(getCategory(item))}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {getTitle(item)}
                  </h3>
                  
                  {/* Date & Time */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">
                      {formatDate(item.tanggal)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{item.lokasi}</span>
                  </div>

                  {/* Description Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.deskripsi}
                  </p>

                  {/* Read More Button */}
                  <Button
                    onClick={() => navigate(`/activities/${item.id}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Lihat Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Kegiatan tidak ditemukan' : 'Belum ada kegiatan'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian atau hapus filter'
                : 'Kegiatan akan segera diumumkan'
              }
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserActivities;
