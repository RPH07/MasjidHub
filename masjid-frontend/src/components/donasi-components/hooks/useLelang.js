import { useState, useEffect, useCallback } from 'react'
import { lelangService } from '../services/lelangService'
import { validateLelangForm, createFormData } from '../utils/helpers'

export const useLelang = () => {
    const [state, setState] = useState({
        barangLelang: [],
        lelangAktif: [],
        lelangHistory: [],
        loading: false,
        error: null
    })

    // Fetch semua barang lelang
    const fetchBarangLelang = useCallback(async (status = 'all') => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }))
            const response = await lelangService.getAll(status)
            setState(prev => ({
                ...prev,
                barangLelang: response.data.data,
                loading: false
            }))
        } catch (error) {
            console.error('Error fetching barang lelang:', error)
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Gagal mengambil data barang lelang'
            }))
        }
    }, [])

    // Fetch lelang aktif
    const fetchLelangAktif = useCallback(async () => {
        try {
            const response = await lelangService.getActive()
            setState(prev => ({
                ...prev,
                lelangAktif: response.data.data
            }))
        } catch (error) {
            console.error('Error fetching lelang aktif:', error)
            setState(prev => ({
                ...prev,
                error: 'Gagal mengambil data lelang aktif'
            }))
        }
    }, [])

    // Fetch history lelang
    const fetchLelangHistory = useCallback(async () => {
        try {
            const response = await lelangService.getAll('selesai')
            setState(prev => ({
                ...prev,
                lelangHistory: response.data.data
            }))
        } catch (error) {
            console.error('Error fetching lelang history:', error)
            setState(prev => ({
                ...prev,
                error: 'Gagal mengambil history lelang'
            }))
        }
    }, [])

    // Tambah barang lelang baru
    const createBarangLelang = useCallback(async (formData, file) => {
        try {
            const validation = validateLelangForm(formData)
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors)[0])
            }

            setState(prev => ({ ...prev, loading: true }))
            const form = createFormData(formData, file)
            await lelangService.create(form)

            setState(prev => ({ ...prev, loading: false }))
            await fetchBarangLelang()
            return { success: true, message: 'Barang lelang berhasil ditambahkan' }
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }))
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal menambah barang lelang'
            }
        }
    }, [fetchBarangLelang])

    // Update barang lelang
    const updateBarangLelang = useCallback(async (id, formData, file) => {
        try {
            const validation = validateLelangForm(formData)
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors)[0])
            }

            setState(prev => ({ ...prev, loading: true }))
            const form = createFormData(formData, file)
            await lelangService.update(id, form)

            setState(prev => ({ ...prev, loading: false }))
            await fetchBarangLelang()
            return { success: true, message: 'Barang lelang berhasil diperbarui' }
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }))
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal memperbarui barang lelang'
            }
        }
    }, [fetchBarangLelang])

    // Hapus barang lelang
    const deleteBarangLelang = useCallback(async (id) => {
        try {
            await lelangService.delete(id)
            await fetchBarangLelang()
            return { success: true, message: 'Barang lelang berhasil dihapus' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menghapus barang lelang'
            }
        }
    }, [fetchBarangLelang])

    // Mulai lelang
    const startLelang = useCallback(async (id) => {
        try {
            await lelangService.start(id)
            await fetchBarangLelang()
            await fetchLelangAktif()
            return { success: true, message: 'Lelang berhasil dimulai' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memulai lelang'
            }
        }
    }, [fetchBarangLelang, fetchLelangAktif])

    // Batalkan lelang
    const cancelLelang = useCallback(async (id, alasan) => {
        try {
            await lelangService.cancel(id, alasan)
            await fetchBarangLelang()
            await fetchLelangAktif()
            return { success: true, message: 'Lelang berhasil dibatalkan' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal membatalkan lelang'
            }
        }
    }, [fetchBarangLelang, fetchLelangAktif])

    // Selesaikan lelang
    const finishLelang = useCallback(async (id) => {
        try {
            await lelangService.finish(id)
            await fetchBarangLelang()
            await fetchLelangAktif()
            await fetchLelangHistory()
            return { success: true, message: 'Lelang berhasil diselesaikan' }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menyelesaikan lelang'
            }
        }
    }, [fetchBarangLelang, fetchLelangAktif, fetchLelangHistory])

    // Auto refresh lelang aktif
    useEffect(() => {
        let interval
        if (state.lelangAktif.length > 0) {
            interval = setInterval(fetchLelangAktif, 5000) // refresh tiap 5 detik
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [state.lelangAktif.length, fetchLelangAktif])

    return {
        // State
        ...state,

        // Actions
        fetchBarangLelang,
        fetchLelangAktif,
        fetchLelangHistory,
        createBarangLelang,
        updateBarangLelang,
        deleteBarangLelang,
        startLelang,
        cancelLelang,
        finishLelang
    }
}

export default useLelang