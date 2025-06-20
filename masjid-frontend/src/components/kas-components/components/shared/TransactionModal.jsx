import React, { useState, useEffect } from 'react';
import { useTransactionOps } from '../../hooks/useTransactionOps';

const TransactionModal = ({ 
  type, 
  data, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { saveTransaction, loading, kategoriPemasukan } = useTransactionOps(onSuccess);
  // console.log('TransactionModal props:', { type, data, isOpen });
  const [formData, setFormData] = useState({
    tanggal: '',
    keterangan: '',
    jenis: 'masuk',
    jumlah: '',
    kategori: 'operasional',
    kategori_pemasukan: 'donasi_umum'
  });

  useEffect(() => {
    if (data) {
      setFormData({
        tanggal: data.tanggal || '',
        keterangan: data.keterangan || data.deskripsi || '',
        jenis: data.jenis || (type === 'edit-pemasukan' ? 'masuk' : 'keluar'),
        jumlah: data.jumlah || '',
        kategori: data.kategori || 'operasional',
        kategori_pemasukan: data.kategori_pemasukan || 'donasi_umum'
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        jenis: type === 'add-pemasukan' || type === 'edit-pemasukan' ? 'masuk' : 'keluar',
        jumlah: '',
        kategori: 'operasional',
        kategori_pemasukan: 'donasi_umum'
      });
    }
  }, [data, type]);

  // safeForm data
  const safeFormData =  {
    tanggal: formData.tanggal || '',
    keterangan: formData.keterangan || '',
    jenis: formData.jenis || 'masuk',
    jumlah: formData.jumlah || '',
    kategori: formData.kategori || 'operasional',
    kategori_pemasukan: formData.kategori_pemasukan || 'donasi_umum'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
const payload = {
      ...formData,
      jumlah: parseInt(formData.jumlah, 10)
    };

    // Pastikan parsing berhasil
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
                  {Object.entries(kategoriPemasukan).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
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
                type="number"
                name="jumlah"
                value={safeFormData.jumlah}
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
                  <option value="operasional">Operasional</option>
                  <option value="kegiatan">Kegiatan</option>
                  <option value="pemeliharaan">Pemeliharaan</option>
                  <option value="bantuan">Bantuan Sosial</option>
                </select>
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
