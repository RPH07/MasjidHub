import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const usePendingData = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:5000/api/kas/pending', config);
      setPendingData(response.data);
    } catch (error) {
      console.error('Error fetching pending data:', error);
      setPendingData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingData();
  }, [fetchPendingData]);

  return {
    pendingData,
    loading,
    refreshData: fetchPendingData
  };
};
