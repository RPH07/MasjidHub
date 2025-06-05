import { useState, useCallback } from 'react';
import axios from 'axios';

export const useValidationOps = (onRefresh) => {
  const [loading, setLoading] = useState(false);

  const validatePayment = useCallback(async (type, id, action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put(
        `http://localhost:5000/api/kas/validate/${type}/${id}`,
        { action },
        config
      );

      if (response.data.success) {
        alert(response.data.message);
        onRefresh?.();
        return true;
      }
    } catch (error) {
      console.error('Error validating payment:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat validasi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  const approvePayment = useCallback((type, id) => {
    if (window.confirm('Apakah Anda yakin ingin menyetujui pembayaran ini?')) {
      return validatePayment(type, id, 'approve');
    }
    return Promise.resolve(false);
  }, [validatePayment]);

  const rejectPayment = useCallback((type, id) => {
    if (window.confirm('Apakah Anda yakin ingin menolak pembayaran ini?')) {
      return validatePayment(type, id, 'reject');
    }
    return Promise.resolve(false);
  }, [validatePayment]);

  return {
    loading,
    approvePayment,
    rejectPayment
  };
};
