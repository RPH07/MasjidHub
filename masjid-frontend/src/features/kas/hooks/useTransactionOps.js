import { useState } from 'react';
import { kasService } from '../services/kasService';
import { kategoriPemasukan } from '../utils/constants';

export const useTransactionOps = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const saveTransaction = async (formData, editId = null) => {
    if (!formData.tanggal || !formData.keterangan || !formData.jenis || !formData.jumlah) {
      throw new Error('Tanggal, keterangan, jenis, dan jumlah wajib diisi');
    }

    setLoading(true);
    try {
      const response = editId
        ? await kasService.updateManual(editId, formData)
        : await kasService.createManual(formData);

      if (onSuccess) onSuccess();
      return response;
    } catch (error) {
      console.error('Error saving kas manual:', error.response?.data || error);
      throw new Error(error.response?.data?.msg || error.response?.data?.error || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    setLoading(true);
    try {
      await kasService.deleteManual(id);
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting kas manual:', error.response?.data || error);
      throw new Error(error.response?.data?.msg || error.response?.data?.error || 'Terjadi kesalahan saat menghapus data');
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
