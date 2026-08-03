import { useState, useCallback } from 'react';
import { donasiService } from '../services/DonasiService';
import Swal from 'sweetalert2';

const getResponseData = (response, fallback = []) => response.data?.data ?? fallback;
const getResponseMessage = (response, fallback) => response.data?.msg || response.data?.message || fallback;
const getErrorMessage = (error, fallback) =>
    error.response?.data?.msg ||
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    fallback;

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
                programDonasi: getResponseData(response),
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
                programAktif: getResponseData(response),
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
                message: getResponseMessage(response, 'Program donasi berhasil ditambahkan')
            };
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            return {
                success: false,
                message: getErrorMessage(error, 'Gagal menambah program donasi')
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
                message: getResponseMessage(response, 'Program donasi berhasil diperbarui')
            };
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            console.error('Update program error:', error);
            
            return {
                success: false,
                message: getErrorMessage(error, 'Gagal memperbarui program donasi')
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
                message: getResponseMessage(response, 'Program donasi berhasil dihapus')
            };
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            console.error('Delete program error:', error);
            
            return {
                success: false,
                message: getErrorMessage(error, 'Gagal menghapus program donasi')
            };
        }
    }, [fetchProgramDonasi]);

    const activateProgram = useCallback(async (id) => {
        try {
            const response = await donasiService.activateProgram(id);
            return { 
                success: true, 
                message: getResponseMessage(response, 'Program berhasil diaktifkan')
            };
        } catch (error) {
            return {
                success: false,
                message: getErrorMessage(error, 'Gagal mengaktifkan program')
            };
        }
    }, []);

    const deactivateProgram = useCallback(async (id) => {
        try {
            const response = await donasiService.deactivateProgram(id);
            return { 
                success: true, 
                message: getResponseMessage(response, 'Program berhasil dinonaktifkan')
            };
        } catch (error) {
            return {
                success: false,
                message: getErrorMessage(error, 'Gagal menonaktifkan program')
            };
        }
    }, []);

    const completeProgram = useCallback(async (id) => {
        try {
            const response = await donasiService.completeProgram(id);
            return { 
                success: true, 
                message: getResponseMessage(response, 'Program berhasil diselesaikan')
            };
        } catch (error) {
            return {
                success: false,
                message: getErrorMessage(error, 'Gagal menyelesaikan program')
            };
        }
    }, []);

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
