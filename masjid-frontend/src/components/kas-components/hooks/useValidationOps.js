import { useState } from 'react';
import apiService from '../../../services/apiServices'; 
import { API_ENDPOINTS } from '../../../config/api.config'; 
import Swal from 'sweetalert2';

const useValidationOps = () => {
  const [loading, setLoading] = useState(false);

  const approveTransaction = async (type, id, additionalData = {}) => {
    try {
      setLoading(true);
      
      const response = await apiService.post(API_ENDPOINTS.KAS.APPROVE, {
        type,
        id,
        ...additionalData
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi berhasil disetujui',
        timer: 2000,
        showConfirmButton: false
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error approving transaction:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.response?.data?.message || 'Gagal menyetujui transaksi',
        confirmButtonColor: '#EF4444'
      });

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const rejectTransaction = async (type, id, reason = '') => {
    try {
      setLoading(true);
      
      const response = await apiService.post(API_ENDPOINTS.KAS.REJECT, {
        type,
        id,
        reason
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi berhasil ditolak',
        timer: 2000,
        showConfirmButton: false
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error rejecting transaction:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.response?.data?.message || 'Gagal menolak transaksi',
        confirmButtonColor: '#EF4444'
      });

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    approveTransaction,
    rejectTransaction
  };
};

export default useValidationOps;