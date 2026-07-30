import { useState } from 'react';
import { kasService } from '../services/kasService';

export const useValidationOps = (refreshCallback) => {
  const [loading, setLoading] = useState(false);

  const approveVoid = async (id) => {
    setLoading(true);
    try {
      const response = await kasService.approveVoid(id);
      if (refreshCallback) refreshCallback();
      return { success: true, message: response.msg || 'Persetujuan void berhasil dicatat' };
    } catch (error) {
      console.error('Error approving void:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.msg || 'Gagal menyetujui void transaksi'
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectVoid = async (id, rejectReason) => {
    setLoading(true);
    try {
      const response = await kasService.rejectVoid(id, rejectReason);
      if (refreshCallback) refreshCallback();
      return { success: true, message: response.msg || 'Void transaksi berhasil ditolak' };
    } catch (error) {
      console.error('Error rejecting void:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.msg || 'Gagal menolak void transaksi'
      };
    } finally {
      setLoading(false);
    }
  };

  const requestVoid = async (id, reason) => {
    setLoading(true);
    try {
      const response = await kasService.requestVoid(id, reason);
      if (refreshCallback) refreshCallback();
      return { success: true, message: response.msg || 'Permintaan void berhasil dibuat' };
    } catch (error) {
      console.error('Error requesting void:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.msg || 'Gagal membuat permintaan void'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    approveVoid,
    rejectVoid,
    requestVoid,
    loading
  };
};

export default useValidationOps;
