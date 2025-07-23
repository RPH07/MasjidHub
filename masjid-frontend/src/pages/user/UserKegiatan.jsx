import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiServices'; 
import { API_ENDPOINTS } from '../../config/api.config';

const UserKegiatan = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchKegiatan();
  }, []);

const fetchKegiatan = async () => {
    try {
      console.log('🔍 Fetching kegiatan data...');
      const response = await apiService.get(API_ENDPOINTS.KEGIATAN.BASE);
      
      console.log('📊 Response:', response.data);
      
      const kegiatanData = response.data.data || response.data || [];
      
      console.log('📋 Kegiatan data:', kegiatanData);
      
      // Urutkan berdasarkan tanggal terbaru
      const sortedKegiatan = kegiatanData.sort((a, b) => {
        return new Date(b.tanggal) - new Date(a.tanggal);
      });
      
      setKegiatan(sortedKegiatan);
      console.log('✅ Kegiatan loaded:', sortedKegiatan.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching kegiatan:', error);
      console.error('Response details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Filter kegiatan berdasarkan search
  const filteredKegiatan = kegiatan.filter(item => 
    item.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kategori_nama && item.kategori_nama.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = (kegiatanItem) => {
    setSelectedKegiatan(kegiatanItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedKegiatan(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kegiatan...</p>
        </div>
      </div>
    );
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari kegiatan, lokasi, atau kategori..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  {item.foto ? (
                    <img
                      src={`http://localhost:5000/uploads/${item.foto}`}
                      alt={item.nama_kegiatan}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-4xl">🕌</span>
                    </div>
                  )}
                  {/* Kategori Badge */}
                  {item.kategori_nama && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                        {item.kategori_nama}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.nama_kegiatan}
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
                  <button
                    onClick={() => openModal(item)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Lihat Detail
                  </button>
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

      {/* Modal Detail */}
      {showModal && selectedKegiatan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              {selectedKegiatan.foto ? (
                <img
                  src={`http://localhost:5000/uploads/${selectedKegiatan.foto}`}
                  alt={selectedKegiatan.nama_kegiatan}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-6xl">🕌</span>
                </div>
              )}
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Kategori Badge */}
              {selectedKegiatan.kategori_nama && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                    {selectedKegiatan.kategori_nama}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedKegiatan.nama_kegiatan}
              </h2>

              {/* Date, Time & Location Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Tanggal & Waktu</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedKegiatan.tanggal)} • {formatTime(selectedKegiatan.tanggal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Lokasi</p>
                    <p className="text-sm text-gray-600">{selectedKegiatan.lokasi}</p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi Kegiatan</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedKegiatan.deskripsi}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Tutup
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserKegiatan;