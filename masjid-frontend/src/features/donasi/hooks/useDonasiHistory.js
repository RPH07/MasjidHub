import { useState, useCallback } from 'react'
import { donasiService } from '../services/DonasiService'
import { toNumber } from '@/utils/formatters'

const getResponseData = (response, fallback = []) => response.data?.data ?? fallback;
const getErrorMessage = (error, fallback) =>
    error.response?.data?.msg ||
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    fallback;

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
            const completedPrograms = getResponseData(response).filter(program =>
                program.status === 'selesai' || toNumber(program.dana_terkumpul) >= toNumber(program.target_dana)
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
            setState(prev => ({ ...prev, error: null }))
            
            // Ambil detail program
            const programResponse = await donasiService.getProgramById(programId)
            const program = getResponseData(programResponse, null)
            const donatursResponse = await donasiService.getDonationHistory(programId)
            
            setState(prev => ({
                ...prev,
                detailProgram: program,
                donatursPerProgram: donatursResponse.data?.data?.donasi || []
            }))
        } catch (error) {
            console.error('Error fetching detail program:', error)
            setState(prev => ({
                ...prev,
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
            setState(prev => ({ ...prev, error: null }));
            if (format !== 'pdf') {
                throw new Error('Export CSV/Excel program donasi belum tersedia di backend baru');
            }

            const response = await donasiService.exportProgramPdf(programId);
            const blob = new Blob([response.data], { type: 'application/pdf' });

            if (blob.size === 0) {
                throw new Error('PDF file kosong');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `laporan-donasi-program-${programId}-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setState(prev => ({ ...prev, error: null }));
            return { success: true, message: 'Laporan berhasil diexport' };
            
        } catch (error) {
            console.error('❌ Export error:', error);
            setState(prev => ({ 
                ...prev, 
                error: error.message 
            }));
            return { success: false, message: getErrorMessage(error, error.message) };
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

export default useDonasiHistory;
