import { useState } from 'react';
import axios from 'axios';
import { kategoriPemasukan } from '../utils/constants';

export const useTransactionOps = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const saveTransaction = async (formData, editId = null) => {
    if (!formData.tanggal || !formData.keterangan || !formData.jenis || !formData.jumlah) {
      throw new Error('Semua field wajib diisi');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/kas/${editId}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/kas', formData, config);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving data:', error);
      throw new Error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return false;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:5000/api/kas/${id}`, config);
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      throw new Error('Terjadi kesalahan saat menghapus data');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveTransaction,
    deleteTransaction,
    kategoriPemasukan
  };
};