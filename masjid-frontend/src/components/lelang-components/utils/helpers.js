import { STATUS_BADGES } from './constants'

export const getStatusBadge = (status) => {
    return STATUS_BADGES[status] || 'bg-gray-100 text-gray-800'
}

export const validateBidForm = (bidData) => {
    const errors = {}

    if (!bidData.nama_bidder?.trim()) {
        errors.nama_bidder = 'Nama wajib diisi'
    }

    if (!bidData.jumlah_bid || bidData.jumlah_bid <= 0) {
        errors.jumlah_bid = 'Jumlah bid harus lebih dari 0'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

export const validateLelangForm = (formData) => {
    const errors = {}

    if (!formData.nama_barang?.trim()) {
        errors.nama_barang = 'Nama barang wajib diisi'
    }

    if (!formData.harga_awal || formData.harga_awal <= 0) {
        errors.harga_awal = 'Harga awal harus lebih dari 0'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

export const createFormData = (data, file = null) => {
    const formData = new FormData()

    Object.keys(data).forEach(key => {
        formData.append(key, data[key])
    })

    if (file) {
        formData.append('foto', file)
    }

    return formData
}