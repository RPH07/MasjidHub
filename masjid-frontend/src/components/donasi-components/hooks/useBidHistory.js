import { useState, useCallback } from 'react'
import { lelangService } from '../services/lelangService'
import { validateBidForm } from '../utils/helpers'

export const useBidHistory = () => {
    const [bidHistory, setBidHistory] = useState({})
    const [loading, setLoading] = useState(false)

    // Fetch bid history untuk lelang tertentu
    const fetchBidHistory = useCallback(async (lelangId) => {
        try {
            setLoading(true)
            const response = await lelangService.getBidHistory(lelangId)
            setBidHistory(prev => ({
                ...prev,
                [lelangId]: response.data.data
            }))
            setLoading(false)
        } catch (error) {
            console.error('Error fetching bid history:', error)
            setLoading(false)
        }
    }, [])

    // Submit bid baru
    const submitBid = useCallback(async (lelangId, bidData) => {
        try {
            const validation = validateBidForm(bidData)
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors)[0])
            }

            const response = await lelangService.submitBid(lelangId, bidData)

            // Refresh bid history setelah submit
            await fetchBidHistory(lelangId)

            return {
                success: true,
                message: 'Bid berhasil disubmit!',
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Gagal submit bid'
            }
        }
    }, [fetchBidHistory])

    // Clear bid history untuk lelang tertentu
    const clearBidHistory = useCallback((lelangId) => {
        setBidHistory(prev => {
            const newHistory = { ...prev }
            delete newHistory[lelangId]
            return newHistory
        })
    }, [])

    // Clear semua bid history
    const clearAllBidHistory = useCallback(() => {
        setBidHistory({})
    }, [])

    return {
        bidHistory,
        loading,
        fetchBidHistory,
        submitBid,
        clearBidHistory,
        clearAllBidHistory
    }
}

export default useBidHistory