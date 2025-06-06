import { useState } from 'react';
import axios from 'axios';

export const useValidationOps = (refreshCallback) => {
  const [loading, setLoading] = useState(false);

  const approveTransaction = async (type, id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/${type}/${id}/validate`,
        { action: 'approve' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (refreshCallback) refreshCallback();
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error approving transaction:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Terjadi kesalahan saat approve' 
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectTransaction = async (type, id, reason) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/${type}/${id}/validate`,
        { 
          action: 'reject', 
          reason: reason || 'Tidak ada alasan yang diberikan' 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (refreshCallback) refreshCallback();
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Terjadi kesalahan saat reject' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    approveTransaction,
    rejectTransaction,
    loading
  };
};