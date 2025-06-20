import { useState } from 'react';
import axios from 'axios';
import { kategoriPemasukan } from '../utils/constants';

export const useTransactionOps = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const saveTransaction = async (formData, editId = null) => {
    //  console.log('saveTransaction called:', { 
    //   formData, 
    //   editId, 
    //   editIdType: typeof editId,
    //   editIdValue: editId 
    // }); // Debug log

    if (!formData.tanggal || !formData.keterangan || !formData.jenis || !formData.jumlah) {
      throw new Error('Semua field wajib diisi');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (editId && editId !== null) {
        // console.log('Updating transaction:', editId);
        response = await axios.put(`http://localhost:5000/api/kas/${editId}`, formData, config);
      } else {
        // console.log('Creating new transaction');
        response = await axios.post('http://localhost:5000/api/kas', formData, config);
      }
      // console.log('Save response:', response.data);
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
    // console.log('deleteTransaction called with ID:', id); // Debug log
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // console.log('Sending DELETE request to:', `http://localhost:5000/api/kas/${id}`);
      const response = await axios.delete(`http://localhost:5000/api/kas/${id}`, config);
      
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