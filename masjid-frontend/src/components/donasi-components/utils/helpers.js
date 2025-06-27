import { STATUS_BADGES } from './constants'

export const getStatusBadge = (status) => {
    return STATUS_BADGES[status] || 'bg-gray-100 text-gray-800'
}

export const validateDonasiForm = (formData) => {
    const errors = {}

    if (!formData.nama_donatur?.trim()) {
        errors.nama_donatur = 'Nama donatur wajib diisi'
    }

    if (!formData.nominal || parseFloat(formData.nominal) <= 0) {
        errors.nominal = 'Nominal donasi harus lebih dari 0'
    }

    if (parseFloat(formData.nominal) < 10000) {
        errors.nominal = 'Nominal donasi minimal Rp 10.000'
    }

    if (!formData.metode_pembayaran) {
        errors.metode_pembayaran = 'Metode pembayaran wajib dipilih'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

export const validateProgramForm = (formData) => {
    const errors = {}

    if (!formData.nama_barang?.trim()) {
        errors.nama_barang = 'Nama barang wajib diisi'
    }

    if (!formData.target_dana || parseFloat(formData.target_dana) <= 0) {
        errors.target_dana = 'Target dana harus lebih dari 0'
    }

    if (parseFloat(formData.target_dana) < 100000) {
        errors.target_dana = 'Target dana minimal Rp 100.000'
    }

    if (!formData.deskripsi?.trim()) {
        errors.deskripsi = 'Deskripsi program wajib diisi'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

export const createFormData = (data, file) => {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key])
        }
    })
    
    if (file) {
        formData.append('foto_barang', file)
    }
    
    return formData
}

export const formatRupiah = (amount) => {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

export const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    })
}

export const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0
    return Math.min((current / target) * 100, 100)
}

// Backward compatibility
export const validateLelangForm = validateProgramForm;
export const validateBidForm = validateDonasiForm;