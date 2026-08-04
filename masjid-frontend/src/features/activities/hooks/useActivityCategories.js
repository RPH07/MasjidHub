import { useState, useCallback } from 'react';
import { activityCategoryService } from '../services';
import { initialKategoriData } from '../utils';
import toast from 'react-hot-toast';

export const useActivityCategories = () => {
  const [kategoriList, setKategoriList] = useState([]);
  const [showKategoriManager, setShowKategoriManager] = useState(false);
  const [newKategori, setNewKategori] = useState(initialKategoriData);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch semua kategori
  const fetchKategori = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await activityCategoryService.getAll();
      setKategoriList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
      setKategoriList([]);
      toast.error('Gagal mengambil data kategori!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle form change
  const handleKategoriChange = useCallback((field, value) => {
    setNewKategori(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Create kategori
  const createKategori = useCallback(async (kategoriPayload = newKategori) => {
    const namaKategori = kategoriPayload.nama_kategori?.trim();

    if (!namaKategori) {
      toast.error('Nama kategori wajib diisi!');
      return false;
    }

    try {
      await activityCategoryService.create({ nama_kategori: namaKategori });
      toast.success('Kategori berhasil ditambahkan!', {
        icon: '✅',
        duration: 3000
      });
      
      setNewKategori(initialKategoriData);
      await fetchKategori();
      setShowKategoriManager(false);
      return true;
    } catch (err) {
      console.error('Error adding kategori:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan kategori!', {
        icon: '❌',
        duration: 4000
      });
      return false;
    }
  }, [fetchKategori, newKategori]);

  // Update kategori
  const updateKategori = async (id, kategoriData) => {
    try {
      await activityCategoryService.update(id, kategoriData);
      toast.success('Kategori berhasil diperbarui!', {
        icon: '✅',
        duration: 3000
      });
      fetchKategori();
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast.error('Gagal memperbarui kategori!', {
        icon: '❌',
        duration: 4000
      });
      return false;
    }
  };

  // Delete kategori
  const deleteKategori = async (id, namaKategori) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${namaKategori}"?`)) {
      try {
        await activityCategoryService.delete(id);
        toast.success('Kategori berhasil dihapus!', {
          icon: '🗑️',
          duration: 3000
        });
        fetchKategori();
        return true;
      } catch (err) {
        console.error('Gagal menghapus kategori:', err);
        toast.error('Gagal menghapus kategori!', {
          icon: '❌',
          duration: 4000
        });
        return false;
      }
    }
    return false;
  };

  // Toggle modal
  const toggleKategoriManager = useCallback(() => {
    setShowKategoriManager(prevShow => {
      if (!prevShow) {
        setNewKategori(initialKategoriData);
      }
      return !prevShow;
    });
  }, []);

  return {
    kategoriList,
    showKategoriManager,
    newKategori,
    isLoading,
    fetchKategori,
    handleKategoriChange,
    createKategori,
    updateKategori,
    deleteKategori,
    toggleKategoriManager,
    setShowKategoriManager,
    setNewKategori
  };
};
