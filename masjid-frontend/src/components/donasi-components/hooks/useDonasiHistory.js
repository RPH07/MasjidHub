import { useState, useCallback } from 'react'
import { donasiService } from '../services/DonasiService'
import { createFormData } from '../utils/helpers'

export const useDonasiHistory = () => {    
    const [state, setState] = useState({
        historyDonasi: [],
        detailProgram: null,
        donatursPerProgram: [],
        loading: false,
        error: null
    })

    // Fetch history donasi yang sudah selesai
    const fetchHistoryDonasi = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }))
            const response = await donasiService.getPrograms()
            const completedPrograms = response.data.filter(program => 
                program.status === 'selesai' || program.dana_terkumpul >= program.target_dana
            )
            
            setState(prev => ({
                ...prev,
                historyDonasi: completedPrograms,
                loading: false
            }))
        } catch (error) {
            console.error('Error fetching history donasi:', error)
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Gagal mengambil history donasi'
            }))
        }
    }, [])

    // Fetch detail program donasi beserta daftar donatur
    const fetchDetailProgram = useCallback(async (programId) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }))
            
            // Ambil detail program
            const programResponse = await donasiService.getPrograms()
            const program = programResponse.data.find(p => p.id === programId)
            
            // Ambil daftar donatur untuk program ini
            const donatursResponse = await donasiService.getDonationHistory(programId)
            
            setState(prev => ({
                ...prev,
                detailProgram: program,
                donatursPerProgram: donatursResponse.data || [],
                loading: false
            }))
        } catch (error) {
            console.error('Error fetching detail program:', error)
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Gagal mengambil detail program'
            }))
        }
    }, [])

    // Reset detail program
    const resetDetailProgram = useCallback(() => {
        setState(prev => ({
            ...prev,
            detailProgram: null,
            donatursPerProgram: []
        }))
    }, [])

    // Export laporan donasi
    const exportLaporanDonasi = useCallback(async (programId, format = 'csv') => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const token = localStorage.getItem('token');
            
            let endpoint;
            if (format === 'pdf') {
                endpoint = `http://localhost:5000/api/donasi/program/${programId}/export/pdf`;
            } else {
                endpoint = `http://localhost:5000/api/donasi/program/${programId}/export?format=${format}`;
            }

            console.log('📡 Fetching from:', endpoint);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Handle PDF differently
            if (format === 'pdf') {
                const blob = await response.blob();
                console.log('📄 PDF Blob size:', blob.size, 'bytes');
                console.log('📄 PDF Blob type:', blob.type);
                
                if (blob.size === 0) {
                    throw new Error('PDF file is empty');
                }

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `laporan-donasi-program-${programId}-${Date.now()}.pdf`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                console.log('✅ PDF download completed');
            } else {
                // Handle CSV/Excel
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `laporan-donasi-program-${programId}-${Date.now()}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }

            // ✅ UPDATE STATE SUCCESS
            setState(prev => ({ ...prev, loading: false, error: null }));
            return { success: true, message: 'Laporan berhasil diexport' };
            
        } catch (error) {
            console.error('❌ Export error:', error);
            setState(prev => ({ 
                ...prev, 
                loading: false, 
                error: error.message 
            }));
            return { success: false, message: error.message };
        }
    }, []);

    return {
        ...state,

        // Actions
        fetchHistoryDonasi,
        fetchDetailProgram,
        resetDetailProgram,
        exportLaporanDonasi
    }
}

// Hook utama untuk semua fungsionalitas donasi
export const useDonasi = () => {
    const [state, setState] = useState({
        programDonasi: [],
        programAktif: [],
        donasiHistory: [],
        loading: false,
        error: null
    })

    // Fetch semua program donasi
    const fetchProgramDonasi = useCallback(async (status = 'all') => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }))
            const response = await donasiService.getPrograms()
            let programs = response.data
            
            if (status !== 'all') {
                programs = programs.filter(program => program.status === status)
            }
            
            setState(prev => ({
                ...prev,
                programDonasi: programs,
                loading: false
            }))
        } catch (error) {
            console.error('Error fetching program donasi:', error)
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Gagal mengambil data program donasi'
            }))
        }
    }, [])

    // Fetch program aktif
    const fetchProgramAktif = useCallback(async () => {
        try {
            const response = await donasiService.getActivePrograms()
            setState(prev => ({
                ...prev,
                programAktif: response.data
            }))
        } catch (error) {
            console.error('Error fetching program aktif:', error)
            setState(prev => ({
                ...prev,
                error: 'Gagal mengambil data program aktif'
            }))
        }
    }, [])

    // Fetch history donasi
    const fetchDonasiHistory = useCallback(async () => {
        try {
            const response = await donasiService.getPrograms()
            const completedPrograms = response.data.filter(program => 
                program.status === 'selesai' || program.dana_terkumpul >= program.target_dana
            )
            setState(prev => ({
                ...prev,
                donasiHistory: completedPrograms
            }))
        } catch (error) {
            console.error('Error fetching donasi history:', error)
            setState(prev => ({
                ...prev,
                error: 'Gagal mengambil history donasi'
            }))
        }
    }, [])

    // Tambah program donasi baru
    const createProgramDonasi = useCallback(async (formData, file) => {
        try {
            setState(prev => ({ ...prev, loading: true }))
            const form = createFormData(formData, file)
            await donasiService.createProgram(form)

            setState(prev => ({ ...prev, loading: false }))
            await fetchProgramDonasi()
            return { success: true, message: 'Program donasi berhasil ditambahkan' }
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }))
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal menambah program donasi'
            }
        }
    }, [fetchProgramDonasi])

    // Update program donasi
    const updateProgramDonasi = useCallback(async (id, formData, file) => {
        try {
            setState(prev => ({ ...prev, loading: true }))
            const form = createFormData(formData, file)
            await donasiService.updateProgram(id, form)

            setState(prev => ({ ...prev, loading: false }))
            await fetchProgramDonasi()
            return { success: true, message: 'Program donasi berhasil diperbarui' }
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }))
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal memperbarui program donasi'
            }
        }
    }, [fetchProgramDonasi])

    // Hapus program donasi
    const deleteProgramDonasi = useCallback(async (id) => {
        try {
            await donasiService.deleteProgram(id)
            await fetchProgramDonasi()
            return { success: true, message: 'Program donasi berhasil dihapus' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menghapus program donasi'
            }
        }
    }, [fetchProgramDonasi])

    // Aktifkan program
    const activateProgram = useCallback(async (id) => {
        try {
            await donasiService.activateProgram(id)
            await fetchProgramDonasi()
            await fetchProgramAktif()
            return { success: true, message: 'Program berhasil diaktifkan' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mengaktifkan program'
            }
        }
    }, [fetchProgramDonasi, fetchProgramAktif])

    // Nonaktifkan program
    const deactivateProgram = useCallback(async (id) => {
        try {
            await donasiService.deactivateProgram(id)
            await fetchProgramDonasi()
            await fetchProgramAktif()
            return { success: true, message: 'Program berhasil dinonaktifkan' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menonaktifkan program'
            }
        }
    }, [fetchProgramDonasi, fetchProgramAktif])

    // Selesaikan program
    const completeProgram = useCallback(async (id) => {
        try {
            await donasiService.completeProgram(id)
            await fetchProgramDonasi()
            await fetchProgramAktif()
            await fetchDonasiHistory()
            return { success: true, message: 'Program berhasil diselesaikan' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menyelesaikan program'
            }
        }
    }, [fetchProgramDonasi, fetchProgramAktif, fetchDonasiHistory])

    return {
        // State
        ...state,

        // Actions
        fetchProgramDonasi,
        fetchProgramAktif,
        fetchDonasiHistory,
        createProgramDonasi,
        updateProgramDonasi,
        deleteProgramDonasi,
        activateProgram,
        deactivateProgram,
        completeProgram
    }
}

// Backward compatibility
export const useLelang = useDonasi;
export default useDonasi;