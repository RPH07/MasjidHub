import { useState, useCallback } from 'react';
import { KegiatanService } from '../services';
import { sortData } from '../utils';
import toast from 'react-hot-toast';

export const useKegiatan = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch semua kegiatan
  const fetchKegiatan = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await KegiatanService.getAll();
      setOriginalData(data);
      const sorted = sortData(data, 'desc');
      setKegiatan(sorted);
    } catch (err) {
      console.error('Gagal mengambil data kegiatan:', err);
      toast.error('Gagal mengambil data kegiatan!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle sort
  const handleSort = useCallback((order) => {
    setSortOrder(order);
    const sorted = sortData(originalData, order);
    setKegiatan(sorted);
  }, [originalData]);

  // Create kegiatan
  const createKegiatan = async (formData) => {
    try {
      await KegiatanService.create(formData);
      toast.success('Kegiatan berhasil ditambahkan!', {
        icon: '🎉',
        duration: 3000
      });
      fetchKegiatan();
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast.error('Gagal menambahkan kegiatan!', {
        icon: '❌',
        duration: 4000
      });
      return false;
    }
  };

  // Update kegiatan
  const updateKegiatan = async (id, formData) => {
    try {
      await KegiatanService.update(id, formData);
      toast.success('Kegiatan berhasil diperbarui!', {
        icon: '✅',
        duration: 3000
      });
      fetchKegiatan();
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast.error('Gagal memperbarui kegiatan!', {
        icon: '❌',
        duration: 4000
      });
      return false;
    }
  };

  // Delete kegiatan
  const deleteKegiatan = async (id, namaKegiatan) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kegiatan "${namaKegiatan}"?`)) {
      try {
        await KegiatanService.delete(id);
        toast.success('Kegiatan berhasil dihapus!', {
          icon: '🗑️',
          duration: 3000
        });
        fetchKegiatan();
        return true;
      } catch (err) {
        console.error('Gagal menghapus kegiatan:', err);
        toast.error('Gagal menghapus kegiatan!', {
          icon: '❌',
          duration: 4000
        });
        return false;
      }
    }
    return false;
  };

  return {
    kegiatan,
    isLoading,
    sortOrder,
    fetchKegiatan,
    handleSort,
    createKegiatan,
    updateKegiatan,
    deleteKegiatan
  };
};
