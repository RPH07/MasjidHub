import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
    baseURL: `${API_BASE_URL}/lelang`
})

export const lelangService = {
    // CRUD Barang Lelang
    getAll: (status = 'all') => {
        const params = status !== 'all' ? { status } : {}
        return api.get('/', { params })
    },

    create: (formData) => {
        return api.post('/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    update: (id, formData) => {
        return api.put(`/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    delete: (id) => {
        return api.delete(`/${id}`)
    },

    // Kelola Status Lelang
    start: (id) => {
        return api.post(`/${id}/start`)
    },

    cancel: (id, alasan = 'Dibatalkan oleh admin') => {
        return api.post(`/${id}/cancel`, { alasan })
    },

    finish: (id) => {
        return api.post(`/${id}/finish`)
    },

    // Lelang Aktif & Bidding
    getActive: () => {
        return api.get('/aktif')
    },

    submitBid: (id, bidData) => {
        return api.post(`/${id}/bid`, bidData)
    },

    getBidHistory: (id) => {
        return api.get(`/${id}/bids`)
    }
}

export default lelangService