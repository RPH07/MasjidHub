import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const KontribusiHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!axios.defaults.baseURL) {
      axios.defaults.baseURL = 'http://localhost:5000';
    }
  }, []);

  useEffect(() => {
    console.log('🔍 Debug - User data:', user);
    if (user?.id) {
      console.log('📞 Calling fetchHistory for user ID:', user.id);
      fetchHistory();
      fetchSummary();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/kontribusi/history/${user.id}`;
      console.log('🌐 Fetching URL:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📊 API Response:', response.data);
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      console.error('❌ Error details:', error.response?.data);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const url = `http://localhost:5000/api/kontribusi/summary/${user.id}`;
      console.log('📈 Fetching Summary URL:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📈 Summary Response:', response.data);
      const summaryData = response.data.data || response.data;
      setSummary(summaryData);
    } catch (error) {
      console.error('❌ Error fetching summary:', error);
      console.error('❌ Summary error details:', error.response?.data);
    }
  };

  // ✅ FILTER: Search berdasarkan nama, detail program, metode pembayaran, status
  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nama?.toLowerCase().includes(searchLower) ||
      item.detail_program?.toLowerCase().includes(searchLower) ||
      item.metode_pembayaran?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower) ||
      item.type?.toLowerCase().includes(searchLower) ||
      item.jenis_kontribusi?.toLowerCase().includes(searchLower)
    );
  });

  const safeNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    
    // ✅ FIX: Handle concatenated strings like "1000000.00140000.00"
    if (typeof value === 'string' && value.includes('.00') && value.length > 10) {
      console.log('🔧 Detected concatenated string:', value);
      const parts = value.split('.00');
      let total = 0;
      parts.forEach(part => {
        if (part && !isNaN(part)) {
          total += parseFloat(part);
        }
      });
      console.log('🔧 Fixed concatenated value:', total);
      return total;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getTypeBadge = (type) => {
    const badges = {
      donasi: 'bg-blue-100 text-blue-800 border border-blue-200',
      zakat: 'bg-purple-100 text-purple-800 border border-purple-200'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Silakan login untuk melihat riwayat kontribusi Anda.</p>
        </div>
      </div>
    );
  }

  const getBuktiTransferUrl = (buktiTransfer, type) => {
    if (!buktiTransfer) return null;
    
    const baseUrl = axios.defaults.baseURL || 'http://localhost:5173';
    let folderPath = '';
    
    if (type === 'zakat') {
      folderPath = 'uploads/bukti-zakat';
    } else if (type === 'donasi') {
      folderPath = 'uploads/bukti-donasi';
    } else {
      if (buktiTransfer.startsWith('zakat-')) {
        folderPath = 'uploads/bukti-zakat';
      } else if (buktiTransfer.startsWith('bukti-')) {
        folderPath = 'uploads/bukti-donasi';
      } else {
        folderPath = 'uploads';
      }
    }
    
    return `${baseUrl}/${folderPath}/${buktiTransfer}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Riwayat Kontribusi Saya
          </h1>
          <p className="text-gray-600 mt-1">
            Riwayat donasi dan zakat yang telah Anda lakukan
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Kontribusi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Kontribusi</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(safeNumber(summary.total?.total_amount || 0))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summary.total?.total_count || 0} transaksi
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-blue-600 text-xl">💝</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Donasi Program</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(parseFloat(summary.donasi?.total_amount || 0))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summary.donasi?.total_count || 0} donasi
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-blue-600 text-xl">🎯</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Zakat</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(parseFloat(summary.zakat?.total_amount || 0))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summary.zakat?.total_count || 0} zakat
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <span className="text-purple-600 text-xl">🕌</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama, program, atau status..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Ditemukan <span className="font-semibold text-blue-600">{filteredHistory.length}</span> kontribusi
            {searchTerm && ` untuk "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Kontribusi ({filteredHistory.length})
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat riwayat kontribusi...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {searchTerm ? '🔍' : '📋'}
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'Kontribusi tidak ditemukan' : 'Belum ada riwayat kontribusi'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm 
                  ? 'Coba ubah kata kunci pencarian'
                  : 'Kontribusi Anda akan muncul di sini setelah melakukan donasi atau zakat'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}-${index}`}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(item.type)}`}>
                          {item.type === 'donasi' ? '💝 Donasi' : '🕌 Zakat'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(item.status)}`}>
                          {item.status === 'pending' && '⏳ Pending'}
                          {item.status === 'approved' && '✅ Disetujui'}
                          {item.status === 'rejected' && '❌ Ditolak'}
                        </span>
                        {item.jenis_kontribusi && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {item.jenis_kontribusi === 'fitrah' && '🌙 Fitrah'}
                            {item.jenis_kontribusi === 'maal' && '💰 Maal'}
                            {item.jenis_kontribusi === 'profesi' && '💼 Profesi'}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {item.detail_program}
                      </h3>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Atas nama:</span> {item.nama}</p>
                        <p><span className="font-medium">Tanggal submit:</span> {formatDate(item.created_at)}</p>
                        {item.validated_at && (
                          <p><span className="font-medium">Tanggal validasi:</span> {formatDate(item.validated_at)}</p>
                        )}
                        <p><span className="font-medium">Metode pembayaran:</span> {item.metode_pembayaran}</p>
                        {item.catatan && (
                          <p><span className="font-medium">Catatan:</span> {item.catatan}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:text-right lg:ml-6 flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(item.jumlah)}
                      </div>
                      
                      {item.kode_unik && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Kode Unik:</span> {item.kode_unik}
                        </div>
                      )}
                      
                      {item.total_transfer && item.total_transfer !== item.jumlah && (
                        <div className="text-sm text-blue-600 mb-2">
                          <span className="font-medium">Total Transfer:</span> {formatCurrency(item.total_transfer)}
                        </div>
                      )}
                      
                      {item.bukti_transfer && (
                        <button
                          onClick={() => window.open(getBuktiTransferUrl(item.bukti_transfer, item.type), '_blank')}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                        >
                          <span className="mr-1">📄</span>
                          Lihat Bukti Transfer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KontribusiHistory;