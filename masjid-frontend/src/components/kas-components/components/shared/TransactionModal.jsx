import React, { useState, useEffect } from 'react';
import { useTransactionOps } from '../../hooks/useTransactionOps';

// Default kategori pengeluaran
const defaultKategoriPengeluaran = [
  { value: 'operasional', label: 'Operasional' },
  { value: 'kegiatan', label: 'Kegiatan' },
  { value: 'pemeliharaan', label: 'Pemeliharaan' },
  { value: 'bantuan', label: 'Bantuan Sosial' },
  { value: 'custom', label: '+ Kategori Lainnya' }
];

const TransactionModal = ({ 
  type, 
  data, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { saveTransaction, loading, kategoriPemasukan } = useTransactionOps(onSuccess);
  
  const [formData, setFormData] = useState({
    tanggal: '',
    keterangan: '',
    jenis: 'masuk',
    jumlah: '',
    kategori: 'operasional',
    kategori_pemasukan: 'donasi_umum',
    nama_pemberi: ''
  });

  // format angka untuk input jumlah
  const [formattedJumlah, setFormattedJumlah] = useState('');

  // State untuk kategori custom
  const [showCustomKategori, setShowCustomKategori] = useState(false);
  const [showCustomPemasukan, setShowCustomPemasukan] = useState(false);
  const [customKategori, setCustomKategori] = useState('');
  const [customPemasukan, setCustomPemasukan] = useState('');

  // Enhanced kategori pemasukan dengan option custom
  const enhancedKategoriPemasukan = {
    ...kategoriPemasukan,
    custom: '+ Kategori Lainnya'
  };

  useEffect(() => {
    if (data) {
      const isCustomKategori = !defaultKategoriPengeluaran.some(k => k.value === data.kategori);
      const isCustomPemasukan = !kategoriPemasukan[data.kategori_pemasukan];
      
      setFormData({
        tanggal: data.tanggal || '',
        keterangan: data.keterangan || data.deskripsi || '',
        jenis: data.jenis || (type === 'edit-pemasukan' ? 'masuk' : 'keluar'),
        jumlah: data.jumlah || '',
        kategori: isCustomKategori ? 'custom' : (data.kategori || 'operasional'),
        kategori_pemasukan: isCustomPemasukan ? 'custom' : (data.kategori_pemasukan || 'donasi_umum'),
        nama_pemberi: data.nama_pemberi || data.nama_donatur || ''
      });

      setFormattedJumlah(data.jumlah ? formatNumber(data.jumlah.toString()) : '');

      if (isCustomKategori) {
        setShowCustomKategori(true);
        setCustomKategori(data.kategori);
      }
      
      if (isCustomPemasukan) {
        setShowCustomPemasukan(true);
        setCustomPemasukan(data.kategori_pemasukan);
      }
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        jenis: type === 'add-pemasukan' || type === 'edit-pemasukan' ? 'masuk' : 'keluar',
        jumlah: '',
        kategori: 'operasional',
        kategori_pemasukan: 'donasi_umum'
      });
      setFormattedJumlah('');
      setShowCustomKategori(false);
      setShowCustomPemasukan(false);
      setCustomKategori('');
      setCustomPemasukan('');
    }
  }, [data, type, kategoriPemasukan]);

  const safeFormData = {
    tanggal: formData.tanggal || '',
    keterangan: formData.keterangan || '',
    jenis: formData.jenis || 'masuk',
    jumlah: formData.jumlah || '',
    kategori: formData.kategori || 'operasional',
    kategori_pemasukan: formData.kategori_pemasukan || 'donasi_umum'
  };

  // fungsi untuk format angka dengan titik
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // fungsi untuk menghapus format titik
  const unformatNumber = (str) => {
    return str.replace(/\./g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'jumlah'){
      const unformattedValue = unformatNumber(value);
      if (unformattedValue === '' || /^\d+$/.test(unformattedValue)){
        setFormData(prev => ({
          ...prev,
          [name]: unformattedValue
        }));
        setFormattedJumlah(unformattedValue ? formatNumber(unformattedValue) : '');
      }
      return;
    }
    
    if (name === 'kategori') {
      if (value === 'custom') {
        setShowCustomKategori(true);
      } else {
        setShowCustomKategori(false);
        setCustomKategori('');
      }
    }
    
    if (name === 'kategori_pemasukan') {
      if (value === 'custom') {
        setShowCustomPemasukan(true);
      } else {
        setShowCustomPemasukan(false);
        setCustomPemasukan('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi custom kategori
    if (safeFormData.kategori === 'custom' && !customKategori.trim()) {
      alert('Mohon isi kategori pengeluaran');
      return;
    }

    if (safeFormData.kategori_pemasukan === 'custom' && !customPemasukan.trim()) {
      alert('Mohon isi kategori pemasukan');
      return;
    }

    const payload = {
      ...formData,
      jumlah: parseInt(formData.jumlah, 10),
      // Gunakan custom kategori jika dipilih
      kategori: safeFormData.kategori === 'custom' ? customKategori.trim() : safeFormData.kategori,
      kategori_pemasukan: safeFormData.kategori_pemasukan === 'custom' ? customPemasukan.trim() : safeFormData.kategori_pemasukan
    };

    if (isNaN(payload.jumlah)) {
      alert('Jumlah tidak valid.');
      return;
    }

    try {
      await saveTransaction(payload, data?.id);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  

  return (
    <div className="fixed inset-0 bg-black/45 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {type === 'edit' ? 'Edit Transaksi' :
            type === 'add-pemasukan' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input
                type="date"
                name="tanggal"
                value={safeFormData.tanggal}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {safeFormData.jenis === 'masuk' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori Pemasukan</label>
                <select
                  name="kategori_pemasukan"
                  value={safeFormData.kategori_pemasukan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {Object.entries(enhancedKategoriPemasukan).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                
                {showCustomPemasukan && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customPemasukan}
                      onChange={(e) => setCustomPemasukan(e.target.value)}
                      placeholder="Masukkan kategori pemasukan"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            )}
            {safeFormData.jenis === 'masuk' &&(
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Donatur (Opsional)</label>
                <input
                  type="text"
                  name="nama_pemberi"
                  value={formData.nama_pemberi || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="kosongkan jika tidak ada"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Keterangan</label>
              <input
                type="text"
                name="keterangan"
                value={safeFormData.keterangan}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Deskripsi transaksi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
              <input
                type="text"
                name="jumlah"
                value={formattedJumlah}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
                required
              />
            </div>

            {safeFormData.jenis === 'keluar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori Pengeluaran</label>
                <select
                  name="kategori"
                  value={safeFormData.kategori}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {defaultKategoriPengeluaran.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                
                {showCustomKategori && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customKategori}
                      onChange={(e) => setCustomKategori(e.target.value)}
                      placeholder="Masukkan kategori pengeluaran"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : (type === 'edit' ? 'Update' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;