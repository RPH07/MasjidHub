import { useState, useCallback } from 'react';
import { donasiService } from '../services/DonasiService';

export const useDonasi = () => {
    const [state, setState] = useState({
        programDonasi: [],
        programAktif: [],
        loading: false,
        error: null
    });

    const fetchProgramDonasi = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await donasiService.getPrograms();
            setState(prev => ({
                ...prev,
                programDonasi: response.data || [],
                loading: false
            }));
        } catch (error) {
            console.error('Error fetching program donasi:', error);
            setState(prev => ({
                ...prev,
                programDonasi: [],
                loading: false,
                error: 'Gagal mengambil data program donasi'
            }));
        }
    }, []);

    const fetchProgramAktif = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await donasiService.getActivePrograms();
            setState(prev => ({
                ...prev,
                programAktif: response.data || [],
                loading: false
            }));
        } catch (error) {
            console.error('Error fetching program aktif:', error);
            setState(prev => ({
                ...prev,
                programAktif: [],
                loading: false,
                error: 'Gagal mengambil data program aktif'
            }));
        }
    }, []);

    const createProgramDonasi = useCallback(async (formData, file) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            const form = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && key !== 'foto_barang') {
                    form.append(key, formData[key]);
                }
            });
            
            if (file) {
                form.append('foto_barang', file);
            }

            const response = await donasiService.createProgram(form);
            
            setState(prev => ({ ...prev, loading: false }));
            await fetchProgramDonasi();
            
            return { 
                success: true, 
                message: response.data?.message || 'Program donasi berhasil ditambahkan' 
            };
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            return {
                success: false,
                message: error.response?.data?.error || error.message || 'Gagal menambah program donasi'
            };
        }
    }, [fetchProgramDonasi]);
    const updateProgramDonasi = useCallback(async (id, formData, file) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            const updateData = new FormData();
            
            // Append form data
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    updateData.append(key, formData[key]);
                }
            });
            
            // Append file if exists
            if (file) {
                updateData.append('foto_barang', file);
            }
            
            const response = await donasiService.updateProgram(id, updateData);
            
            setState(prev => ({ ...prev, loading: false }));
            await fetchProgramDonasi(); // Refresh data
            
            return { 
                success: true, 
                message: response.data?.message || 'Program donasi berhasil diperbarui' 
            };
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            console.error('Update program error:', error);
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal memperbarui program donasi'
            };
        }
    }, [fetchProgramDonasi]);

        // Update deleteProgramDonasi method
    const deleteProgramDonasi = useCallback(async (id) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            const response = await donasiService.deleteProgram(id);
            
            setState(prev => ({ ...prev, loading: false }));
            await fetchProgramDonasi(); // Refresh data
            
            return { 
                success: true, 
                message: response.data?.message || 'Program donasi berhasil dihapus' 
            };
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            console.error('Delete program error:', error);
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal menghapus program donasi'
            };
        }
    }, [fetchProgramDonasi]);

    const activateProgram = useCallback(async (id) => {
        try {
            const response = await donasiService.activateProgram(id);
            await fetchProgramDonasi();
            await fetchProgramAktif();
            return { 
                success: true, 
                message: response.data?.message || 'Program berhasil diaktifkan' 
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Gagal mengaktifkan program'
            };
        }
    }, [fetchProgramDonasi, fetchProgramAktif]);

    const deactivateProgram = useCallback(async (id) => {
        try {
            const response = await donasiService.deactivateProgram(id);
            await fetchProgramDonasi();
            await fetchProgramAktif();
            return { 
                success: true, 
                message: response.data?.message || 'Program berhasil dinonaktifkan' 
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Gagal menonaktifkan program'
            };
        }
    }, [fetchProgramDonasi, fetchProgramAktif]);

    const completeProgram = useCallback(async (id) => {
        try {
            const response = await donasiService.completeProgram(id);
            await fetchProgramDonasi();
            await fetchProgramAktif();
            return { 
                success: true, 
                message: response.data?.message || 'Program berhasil diselesaikan' 
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Gagal menyelesaikan program'
            };
        }
    }, [fetchProgramDonasi, fetchProgramAktif]);

    return {
        ...state,
        fetchProgramDonasi,
        fetchProgramAktif,
        createProgramDonasi,
        updateProgramDonasi,
        deleteProgramDonasi,
        activateProgram,
        deactivateProgram,
        completeProgram
    };
};

export default useDonasi;