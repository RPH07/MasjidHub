import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const KasPemasukan = ({ 
  zakatData = [], 
  infaqData = [], 
  donasiData = [], 
  kasData = [], 
  onEdit, 
  onDelete, 
  onOpenModal, 
  onOpenBukti 
}) => {
  // ✅ STATE UNTUK SORTING
  const [sortConfig, setSortConfig] = useState({
    key: 'tanggal',
    direction: 'desc' // desc = terbaru, asc = terlama
  });

  // ✅ PINDAHKAN formatKategori KE ATAS
  const formatKategori = (kategori) => {
    const kategoriMap = {
      'kas_manual': 'Kas Manual',
      'donasi_umum': 'Donasi Umum',
      'sumbangan': 'Sumbangan',
      'lainnya': 'Lainnya',
      'infaq_jumat': 'Infaq Jumat'
    };
    return kategoriMap[kategori] || kategori;
  };

  // ✅ FUNGSI SORTING
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ NORMALIZE DATA - GABUNGKAN SEMUA DATA DENGAN FORMAT YANG SAMA
  const normalizeAllData = () => {
    const allData = [];

    // Data Zakat
    zakatData.forEach(item => {
      allData.push({
        ...item,
        type: 'zakat',
        display_date: item.created_at,
        display_name: item.nama,
        display_jenis: `🕌 Zakat ${item.jenis_zakat}`,
        display_kategori: '-',
        display_metode: item.metode_pembayaran,
        display_jumlah: item.jumlah,
        display_bukti: item.bukti_transfer,
        display_kode_unik: item.kode_unik || null,
        can_edit: false,
        is_approved: true
      });
    });

    // Data Infaq
    infaqData.forEach(item => {
      allData.push({
        ...item,
        type: 'infaq',
        display_date: item.tanggal,
        display_name: item.nama_pemberi || 'Hamba Allah',
        display_jenis: `📝 Infaq ${item.kategori_infaq}`,
        display_kategori: item.keterangan || '-',
        display_metode: item.metode_pembayaran,
        display_jumlah: item.jumlah,
        display_bukti: item.bukti_transfer,
        display_kode_unik: item.kode_unik || null,
        can_edit: false,
        is_approved: true
      });
    });

    // Data Donasi
    donasiData.forEach(item => {
      allData.push({
        ...item,
        type: 'donasi',
        display_date: item.tanggal || item.created_at,
        display_name: item.nama_donatur || item.nama_pemberi || 'Hamba Allah',
        display_jenis: '💝 Donasi Program',
        display_kategori: item.program_donasi || 'Program Donasi',
        display_metode: item.metode_pembayaran,
        display_jumlah: item.jumlah || item.nominal,
        display_bukti: item.bukti_transfer,
        display_kode_unik: item.kode_unik || null,
        can_edit: false,
        is_approved: true
      });
    });

    // Data Kas Manual
    kasData.filter(item => item.jenis === 'masuk').forEach(item => {
      allData.push({
        ...item,
        type: 'kas',
        display_date: item.tanggal,
        display_name: item.nama_pemberi || item.deskripsi || 'Manual Entry',
        display_jenis: `✏️ ${formatKategori(item.kategori)}`,
        display_kategori: item.keterangan || item.deskripsi || 'Kas Manual',
        display_metode: 'Manual',
        display_jumlah: item.jumlah,
        display_bukti: null,
        can_edit: true,
        is_approved: false
      });
    });

    return allData;
  };

  // ✅ FUNGSI UNTUK SORT DATA GABUNGAN
  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'tanggal':
          aValue = new Date(a.display_date);
          bValue = new Date(b.display_date);
          break;
        case 'nama':
          aValue = (a.display_name || '').toLowerCase();
          bValue = (b.display_name || '').toLowerCase();
          break;
        case 'jenis':
          aValue = a.display_jenis.toLowerCase();
          bValue = b.display_jenis.toLowerCase();
          break;
        case 'jumlah':
          aValue = Number(a.display_jumlah || 0);
          bValue = Number(b.display_jumlah || 0);
          break;
        case 'metode':
          aValue = (a.display_metode || '').toLowerCase();
          bValue = (b.display_metode || '').toLowerCase();
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

  // ✅ ICON UNTUK SORTING
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

  // ✅ GET ALL DATA DAN SORT
  const allData = normalizeAllData();
  const sortedAllData = sortData(allData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Data Pemasukan</h3>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          onClick={() => onOpenModal("add-pemasukan")}
        >
          + Tambah Pemasukan
        </button>
      </div>

      {/* ✅ INFO SORTING */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Diurutkan berdasarkan: <strong className="capitalize">{sortConfig.key}</strong> 
            ({sortConfig.direction === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}) - 
            Total: <strong>{sortedAllData.length}</strong> data
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                {/* ✅ SORTABLE HEADERS */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tanggal')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    <SortIcon column="tanggal" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jenis')}
                >
                  <div className="flex items-center gap-1">
                    Jenis
                    <SortIcon column="jenis" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nama')}
                >
                  <div className="flex items-center gap-1">
                    Nama/Donatur
                    <SortIcon column="nama" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program/Kategori
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('metode')}
                >
                  <div className="flex items-center gap-1">
                    Metode
                    <SortIcon column="metode" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jumlah')}
                >
                  <div className="flex items-center gap-1">
                    Jumlah
                    <SortIcon column="jumlah" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Unik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bukti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ✅ RENDER SEMUA DATA YANG SUDAH DI-SORT */}
              {sortedAllData.map((item, index) => (
                <tr key={`${item.type}-${item.id}-${index}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.display_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'zakat' ? 'bg-green-100 text-green-800' :
                      item.type === 'infaq' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'donasi' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.display_jenis}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.display_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.display_kategori}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="capitalize">{item.display_metode}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(item.display_jumlah)}
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
                        className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.can_edit ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <span className="text-gray-500">|</span>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">✓ Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden space-y-4">
        {/* Mobile sorting controls */}
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
              <option value="nama-asc">Nama (A-Z)</option>
              <option value="nama-desc">Nama (Z-A)</option>
              <option value="jumlah-desc">Jumlah (Tertinggi)</option>
              <option value="jumlah-asc">Jumlah (Terendah)</option>
            </select>
          </div>
        </div>

        {/* Mobile cards with sorted data */}
        {sortedAllData.map((item, index) => (
          <div key={`mobile-${item.type}-${item.id}-${index}`} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.display_date).toLocaleDateString("id-ID")}
              </div>
              {item.can_edit ? (
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Approved
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {item.display_jenis}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Nama:</span> {item.display_name}
            </div>
            {item.display_kode_unik && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Kode Unik:</span> 
                <span className="ml-1 px-2 py-1 text-xs font-mono font-medium bg-yellow-100 text-yellow-800 rounded">
                  +{item.display_kode_unik}
                </span>
              </div>
            )}
            {item.display_kategori !== '-' && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Kategori:</span> {item.display_kategori}
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                {item.display_metode}
              </span>
              <div className="text-lg font-medium text-green-600">
                {formatCurrency(item.display_jumlah)}
              </div>
            </div>
            <div className="flex justify-end">
              {item.display_bukti ? (
                <button
                  onClick={() => onOpenBukti(item.display_bukti)}
                  className="text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded"
                >
                  Lihat Bukti
                </button>
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada bukti</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KasPemasukan;