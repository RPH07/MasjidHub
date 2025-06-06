import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePendingData = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use unified pending endpoint
      const response = await axios.get(
        'http://localhost:5000/api/kas/pending',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPendingData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending data:', error);
      setPendingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  return {
    pendingData,
    loading,
    refreshData: fetchPendingData
  };
};