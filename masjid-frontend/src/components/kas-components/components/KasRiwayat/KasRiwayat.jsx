import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import axios from 'axios';
import Swal from 'sweetalert2';

const formatKategori = (kategoriStr) => {
  if (!kategoriStr) return "Umum";
  return kategoriStr
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const KasRiwayat = ({ 
  kasData, 
  zakatData, 
  infaqData, 
  donasiData = [],
  onOpenBukti = [], 
  currentPeriod 
}) => {
  // STATE UNTUK SORTING
  const [sortConfig, setSortConfig] = useState({
    key: 'tanggal',
    direction: 'desc' // desc = terbaru, asc = terlama
  });

  const [exportLoading, setExportLoading] = useState({
    csv: false,
    excel: false
  });

  // FUNGSI SORTING
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // ICON UNTUK SORTING
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'desc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
  };
  // handle nama file
  const generateFileName = (period, format) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleDateString('id-ID', { month: 'long' });
    
    let fileName = 'riwayat-transaksi-';
    
    switch (period) {
      case 'hari-ini':
        { const todayStr = today.toLocaleDateString('id-ID').replace(/\//g, '-');
        fileName += `hari-ini-${todayStr}`;
        break; }
      case 'kemarin':
        { const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('id-ID').replace(/\//g, '-');
        fileName += `kemarin-${yesterdayStr}`;
        break; }
      case 'minggu-ini':
        fileName += `minggu-ini-${month.toLowerCase()}-${year}`;
        break;
      case 'minggu-lalu':
        fileName += `minggu-lalu-${month.toLowerCase()}-${year}`;
        break;
      case 'bulan-ini':
        fileName += `${month.toLowerCase()}-${year}`;
        break;
      case 'bulan-lalu':
        { const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthName = lastMonth.toLocaleDateString('id-ID', { month: 'long' });
        const lastMonthYear = lastMonth.getFullYear();
        fileName += `${lastMonthName.toLowerCase()}-${lastMonthYear}`;
        break; }
      case 'tahun-ini':
        fileName += `tahun-${year}`;
        break;
      case 'tahun-lalu':
        fileName += `tahun-${year - 1}`;
        break;
      default:
        fileName += `${month.toLowerCase()}-${year}`;
    }
    
    return fileName + `.${format === 'csv' ? 'csv' : 'xlsx'}`;
  };

  // export function
  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(prev => ({...prev, [format]: true}))
      const token = localStorage.getItem('token');
      console.log(`🚀 Starting ${format} export...`);

      const loadingToast = Swal.fire({
        title: `Memproses Export ${format.toUpperCase()}...`,
        html: '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span>Mohon tunggu sebentar</span></div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.get('http://localhost:5000/api/kas/history/export', {
        params: {
          period: currentPeriod,
          type: 'all',
          status: 'all',
          format: format
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      console.log(`📦 Response received:`, response);
      console.log(`📊 Blob size:`, response.data.size)

      const blob = new Blob([response.data],{
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const fileName = generateFileName(currentPeriod, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      loadingToast.close();

      console.log(`✅ ${format} export completed with filename: ${fileName}`);
      await Swal.fire({
        icon: 'success',
        title: 'Export Berhasil!',
        html: `
          <div class="text-left">
            <p class="mb-2">File <strong>${format.toUpperCase()}</strong> berhasil diunduh:</p>
            <p class="text-sm text-gray-600 bg-gray-100 p-2 rounded font-mono">${fileName}</p>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10B981',
        timer: 5000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      Swal.close();
      
      let errorTitle = 'Export Gagal';
      let errorMessage = 'Terjadi kesalahan saat export data';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorTitle = 'Endpoint Tidak Ditemukan';
          errorMessage = 'Fitur export belum tersedia. Hubungi administrator.';
        } else if (error.response.status === 401) {
          errorTitle = 'Akses Ditolak';
          errorMessage = 'Sesi Anda telah berakhir. Silakan login ulang.';
        } else if (error.response.status === 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Terjadi kesalahan pada server. Coba lagi dalam beberapa saat.';
        } else {
          errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorTitle = 'Koneksi Bermasalah';
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.message;
      }

      // Error alert 
      await Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#EF4444',
        footer: '<p class="text-xs text-gray-500">Jika masalah berlanjut, hubungi support</p>',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    } finally{
      setExportLoading(prev => ({...prev, [format]: false}));
    }
  };

  // ✅ NORMALIZE DATA - GABUNGKAN SEMUA DATA DENGAN FORMAT YANG SAMA
  const normalizeAllData = () => {
    const allData = [];

    // Data Kas
    kasData.forEach(item => {
      allData.push({
        ...item,
        source: 'kas',
        display_date: item.tanggal,
        display_jenis: item.jenis === 'masuk' ? `✏️ ${formatKategori(item.kategori)}` : `📤 ${item.kategori || 'Operasional'}`,
        display_nama: item.jenis === 'masuk' ? (item.nama_pemberi || 'Hamba Allah') : (item.nama_penerima || '-'),
        display_deskripsi: item.keterangan || item.deskripsi || '-',
        display_metode: 'Manual',
        display_jumlah: item.jumlah,
        display_bukti: null,
        display_kode_unik: null
      });
    });

    // Data Zakat
    zakatData.forEach(item => {
      allData.push({
        ...item,
        type: 'masuk',
        source: 'zakat',
        display_date: item.created_at,
        display_jenis: `🕌 Zakat ${item.jenis_zakat}`,
        display_nama: item.nama,
        display_deskripsi: '-',
        display_metode: item.metode_pembayaran,
        display_jumlah: item.jumlah,
        display_bukti: item.bukti_transfer,
        display_kode_unik: null
      });
    });

    // Data Infaq
    infaqData.forEach(item => {
      allData.push({
        ...item,
        type: 'masuk',
        source: 'infaq',
        display_date: item.tanggal,
        display_jenis: '📝 Infaq',
        display_nama: item.nama_pemberi || 'Hamba Allah',
        display_deskripsi: item.keterangan || '-',
        display_metode: 'Form Online',
        display_jumlah: item.jumlah,
        display_bukti: item.bukti_transfer,
        display_kode_unik: null
      });
    });

    // Data Donasi
    donasiData.forEach(item => {
      allData.push({
        ...item,
        type: 'masuk',
        source: 'donasi',
        display_date: item.tanggal || item.created_at,
        display_jenis: '💝 Donasi Program',
        display_nama: item.nama_donatur || item.nama_pemberi || 'Hamba Allah',
        display_deskripsi: item.program_donasi || 'Program Donasi',
        display_metode: item.metode_pembayaran,
        display_jumlah: item.jumlah,
        display_bukti: item.bukti_transfer,
        display_kode_unik: item.kode_unik
      });
    });

    return allData;
  };

  // FUNGSI UNTUK SORT DATA GABUNGAN
  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'tanggal':
          aValue = new Date(a.display_date);
          bValue = new Date(b.display_date);
          break;
        case 'jenis':
          aValue = a.display_jenis.toLowerCase();
          bValue = b.display_jenis.toLowerCase();
          break;
        case 'nama':
          aValue = (a.display_nama || '').toLowerCase();
          bValue = (b.display_nama || '').toLowerCase();
          break;
        case 'deskripsi':
          aValue = (a.display_deskripsi || '').toLowerCase();
          bValue = (b.display_deskripsi || '').toLowerCase();
          break;
        case 'metode':
          aValue = (a.display_metode || '').toLowerCase();
          bValue = (b.display_metode || '').toLowerCase();
          break;
        case 'jumlah':
          aValue = Number(a.display_jumlah || 0);
          bValue = Number(b.display_jumlah || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // GET ALL DATA DAN SORT
  const allData = normalizeAllData();
  const sortedAllTransactions = sortData(allData);

  // helper function untuk get nama pemberi (mobile)
  const shouldShowName = (item) => {
    if (item.source === 'zakat') return true;
    if (item.source === 'donasi') return true;
    if (item.source === 'infaq' && item.nama_pemberi) return true;
    if (item.source === 'kas' && item.type === 'masuk') return true;
    return false;
  }

  return (
    <div className="space-y-4">
      <div className='flex justify-between items-center'>
        <h3 className="text-lg font-medium">Riwayat Semua Transaksi</h3>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exportLoading.csv || sortedAllTransactions.length === 0}
            className='flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {exportLoading.csv ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="3 3 18 18">
                  <path
                    className="opacity-25"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>Export CSV</>
            )}
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={exportLoading.excel || sortedAllTransactions.length === 0}
            className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {exportLoading.excel ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="3 3 18 18">
                  <path
                    className="opacity-25"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M12 3v2a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z"
                  />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>Export Excel</>
            )}
          </button>
        </div>
      </div>

      {/* INFO SORTING */}
      {sortedAllTransactions.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Diurutkan berdasarkan: <strong className="capitalize">{sortConfig.key}</strong> 
              ({sortConfig.direction === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}) - 
              Total: <strong>{sortedAllTransactions.length}</strong> transaksi
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sortedAllTransactions.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <p>Tidak ada transaksi yang tersedia.</p>
        </div>
      )}

      {/* Desktop View */}
      {sortedAllTransactions.length > 0 && (
      <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                {/* SORTABLE HEADERS */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tanggal')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    <SortIcon column="tanggal" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jenis')}
                >
                  <div className="flex items-center gap-1">
                    Jenis
                    <SortIcon column="jenis" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nama')}
                >
                  <div className="flex items-center gap-1">
                    Nama/Donatur
                    <SortIcon column="nama" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('deskripsi')}
                >
                  <div className="flex items-center gap-1">
                    Deskripsi/Program
                    <SortIcon column="deskripsi" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('metode')}
                >
                  <div className="flex items-center gap-1">
                    Metode
                    <SortIcon column="metode" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jumlah')}
                >
                  <div className="flex items-center gap-1">
                    Jumlah
                    <SortIcon column="jumlah" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Unik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* RENDER DATA YANG SUDAH DI-SORT */}
              {sortedAllTransactions.map((item, index) => {
                return (
                  <tr key={`${item.source}-${item.id}-${index}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.display_date).toLocaleDateString('id-ID')}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.source === 'zakat' ? 'bg-green-100 text-green-800' :
                        item.source === 'infaq' ? 'bg-blue-100 text-blue-800' :
                        item.source === 'donasi' ? 'bg-purple-100 text-purple-800' :
                        (item.jenis || item.type) === 'masuk' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.display_jenis}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.display_nama}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.display_deskripsi}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.display_metode === 'Manual' ? 'bg-amber-100 text-amber-800' :
                        item.display_metode === 'Form Online' ? 'bg-gray-100 text-gray-800' :
                        item.display_metode === 'qris' ? 'bg-purple-100 text-purple-800' :
                        item.display_metode === 'cash' || item.display_metode === 'tunai' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.display_metode === 'Manual' ? '✏️ Input Manual' :
                         item.display_metode === 'Form Online' ? '📝 Form Online' :
                         item.display_metode === 'qris' ? '📱 QRIS' :
                         item.display_metode === 'cash' || item.display_metode === 'tunai' ? '💵 Tunai' :
                         '🏦 Transfer Bank'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={(item.jenis || item.type) === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {(item.jenis || item.type) === 'masuk' ? '+' : '-'}{formatCurrency(item.display_jumlah)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-center">
                      {item.display_kode_unik ? (
                        <span className="px-2 py-1 text-xs font-mono font-medium bg-yellow-100 text-yellow-800 rounded">
                          +{item.display_kode_unik}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      {item.display_bukti ? (
                        <button
                          onClick={() => onOpenBukti(item.display_bukti)}
                          className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                        >
                          Lihat
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Mobile View */}
      {sortedAllTransactions.length > 0 && (
      <div className="block sm:hidden space-y-4">
        {/*  Mobile sorting controls */}
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Urutkan berdasarkan:</span>
            <select 
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="tanggal-desc">Tanggal (Terbaru)</option>
              <option value="tanggal-asc">Tanggal (Terlama)</option>
              <option value="jenis-asc">Jenis (A-Z)</option>
              <option value="jenis-desc">Jenis (Z-A)</option>
              <option value="nama-asc">Nama (A-Z)</option>
              <option value="nama-desc">Nama (Z-A)</option>
              <option value="jumlah-desc">Jumlah (Tertinggi)</option>
              <option value="jumlah-asc">Jumlah (Terendah)</option>
            </select>
          </div>
        </div>

        {/*  Mobile cards */}
        {sortedAllTransactions.map((item, index) => (
          <div key={`mobile-${item.source}-${item.id}-${index}`} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.display_date).toLocaleDateString('id-ID')}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                (item.jenis || item.type) === 'masuk' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {(item.jenis || item.type) === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </div>
            
            <div className="text-sm font-medium text-gray-900 mb-1">
              {item.display_jenis}
            </div>
            
            {shouldShowName(item) && (
              <div className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Nama:</span> {item.display_nama}
              </div>
            )}
            
            {item.source === 'donasi' && item.display_kode_unik && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Kode Unik:</span> 
                <span className="ml-1 px-2 py-1 text-xs font-mono font-medium bg-yellow-100 text-yellow-800 rounded">
                  +{item.display_kode_unik}
                </span>
              </div>
            )}
            
            {item.display_deskripsi !== '-' && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Deskripsi:</span> {item.display_deskripsi}
              </div>
            )}
            
            {(item.source === 'zakat' || item.source === 'donasi' || item.source === 'infaq') && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Metode:</span>
                <span className="ml-1">
                  {item.display_metode === 'Manual' ? '✏️ Input Manual' :
                   item.display_metode === 'Form Online' ? '📝 Form Online' :
                   item.display_metode === 'qris' ? '📱 QRIS' :
                   item.display_metode === 'cash' || item.display_metode === 'tunai' ? '💵 Tunai' :
                   '🏦 Transfer Bank'}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-medium">
                <span className={(item.jenis || item.type) === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                  {(item.jenis || item.type) === 'masuk' ? '+' : '-'}{formatCurrency(item.display_jumlah)}
                </span>
              </div>
              {item.display_bukti ? (
                <button
                  onClick={() => onOpenBukti(item.display_bukti)}
                  className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                >
                  Lihat Bukti
                </button>
              ) : (
                <span className="text-gray-400 text-xs">Tidak ada bukti</span>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default KasRiwayat;