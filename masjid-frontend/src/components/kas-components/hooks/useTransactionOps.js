import { useState } from 'react';
import apiService from '../../../services/apiServices';
import { API_ENDPOINTS } from '../../../config/api.config';
import { kategoriPemasukan } from '../utils/constants';
// import Swal from 'sweetalert2';

export const useTransactionOps = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const saveTransaction = async (formData, editId = null) => {
    if (!formData.tanggal || !formData.keterangan || !formData.jenis || !formData.jumlah) {
      throw new Error('Semua field wajib diisi');
    }

    setLoading(true);
    try {
      let response;
      if (editId && editId !== null) {
        response = await apiService.put(`${API_ENDPOINTS.KAS.BASE}/${editId}`, formData);
      } else {
        response = await apiService.post(API_ENDPOINTS.KAS.BASE, formData);
      }
      
      if (onSuccess) onSuccess();
      return response.data;
    } catch (error) {
      console.error('Error saving data:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    setLoading(true);
    try {
      // ✅ Delete transaction using apiService
      const response = await apiService.delete(`${API_ENDPOINTS.KAS.BASE}/${id}`);
      
      console.log('Delete response:', response.data);

      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting data:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Terjadi kesalahan saat menghapus data');
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