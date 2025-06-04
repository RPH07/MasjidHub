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
        tanggal: data.tanggal,
        keterangan: data.keterangan,
        jenis: data.jenis,
        jumlah: data.jumlah,
        kategori: data.kategori || 'operasional',
        kategori_pemasukan: data.kategori_pemasukan || 'donasi_umum'
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        jenis: type === 'add-pemasukan' ? 'masuk' : 'keluar',
        jumlah: '',
        kategori: 'operasional',
        kategori_pemasukan: 'donasi_umum'
      });
    }
  }, [data, type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveTransaction(formData, data?.id);
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
                value={formData.tanggal}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {formData.jenis === 'masuk' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori Pemasukan</label>
                <select
                  name="kategori_pemasukan"
                  value={formData.kategori_pemasukan}
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
                value={formData.keterangan}
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
                value={formData.jumlah}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
                required
              />
            </div>

            {formData.jenis === 'keluar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori Pengeluaran</label>
                <select
                  name="kategori"
                  value={formData.kategori}
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
