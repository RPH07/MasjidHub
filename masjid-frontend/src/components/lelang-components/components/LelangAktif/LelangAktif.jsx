import React, { useEffect, useState } from 'react'
import { useLelang, useBidHistory } from '../../hooks'
import { formatRupiah, formatCountdown, formatDateTime } from '../../utils'

const LelangAktif = () => {
    const {
        lelangAktif,
        loading,
        error,
        fetchLelangAktif,
        finishLelang,
        cancelLelang
    } = useLelang()

    const {
        bidHistory,
        fetchBidHistory,
        clearBidHistory
    } = useBidHistory()

    const [expandedBids, setExpandedBids] = useState({})
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Auto refresh setiap 3 detik
    useEffect(() => {
        let interval
        if (autoRefresh) {
            fetchLelangAktif() // Initial load
            interval = setInterval(() => {
                fetchLelangAktif()
            }, 3000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [fetchLelangAktif, autoRefresh])

    // Handle actions
    const handleFinishLelang = async (id) => {
        if (window.confirm('Yakin ingin menyelesaikan lelang ini sekarang?')) {
            const result = await finishLelang(id)
            if (result.success) {
                alert(result.message)
                clearBidHistory(id) // Clear bid history untuk lelang yang selesai
            } else {
                alert(result.message)
            }
        }
    }

    const handleCancelLelang = async (id) => {
        const alasan = window.prompt('Alasan pembatalan lelang:')
        if (alasan !== null && alasan.trim()) {
            const result = await cancelLelang(id, alasan)
            if (result.success) {
                alert(result.message)
                clearBidHistory(id)
            } else {
                alert(result.message)
            }
        }
    }

    const handleToggleBidHistory = async (lelangId) => {
        if (expandedBids[lelangId]) {
            // Collapse
            setExpandedBids(prev => ({
                ...prev,
                [lelangId]: false
            }))
        } else {
            // Expand and fetch
            await fetchBidHistory(lelangId)
            setExpandedBids(prev => ({
                ...prev,
                [lelangId]: true
            }))
        }
    }

    const getTimeStatus = (sisaDetik) => {
        if (sisaDetik <= 0) return { status: 'ended', color: 'text-red-600' }
        if (sisaDetik <= 120) return { status: 'critical', color: 'text-red-600' } // 2 menit
        if (sisaDetik <= 600) return { status: 'warning', color: 'text-orange-600' } // 10 menit
        return { status: 'normal', color: 'text-green-600' }
    }

    if (loading && lelangAktif.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat lelang aktif...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="text-red-600 mr-3">⚠️</div>
                    <div>
                        <h3 className="text-red-800 font-medium">Gagal Memuat Data</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchLelangAktif}
                        className="ml-auto bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Monitor Lelang Aktif</h2>
                    <p className="text-gray-600 text-sm">
                        Pantau lelang yang sedang berjalan secara real-time
                        {lelangAktif.length > 0 && (
                            <span className="ml-2 text-blue-600">
                                • {lelangAktif.length} lelang aktif
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Auto Refresh Toggle */}
                    <label className="flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="mr-2"
                        />
                        Auto refresh (3s)
                    </label>

                    {/* Manual Refresh */}
                    <button
                        onClick={fetchLelangAktif}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm flex items-center"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Status Indicator */}
            {autoRefresh && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-sm text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        Auto refresh aktif - Data diperbarui setiap 3 detik
                    </div>
                </div>
            )}

            {/* Content */}
            {lelangAktif.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">⏰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Lelang Aktif</h3>
                    <p className="text-gray-600 mb-6">
                        Saat ini tidak ada lelang yang sedang berjalan. Mulai lelang dari tab "Daftar Barang".
                    </p>
                    <div className="text-sm text-gray-500">
                        💡 Tip: Lelang yang dimulai akan muncul di sini dan dapat dipantau secara real-time
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {lelangAktif.map(lelang => {
                        const timeStatus = getTimeStatus(lelang.sisa_detik)
                        const isExpanded = expandedBids[lelang.id]
                        const bids = bidHistory[lelang.id] || []

                        return (
                            <div key={lelang.id} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="p-6">
                                    {/* Header Info */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center space-x-4">
                                            {lelang.foto_barang && (
                                                <img
                                                    src={`http://localhost:5000/uploads/${lelang.foto_barang}`}
                                                    alt={lelang.nama_barang}
                                                    className="h-20 w-20 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{lelang.nama_barang}</h3>
                                                <p className="text-gray-600 text-sm mb-1">{lelang.deskripsi}</p>
                                                <div className="text-xs text-gray-500">
                                                    Dimulai: {formatDateTime(lelang.tanggal_mulai)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Time */}
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold mb-1 ${timeStatus.color}`}>
                                                {formatCountdown(lelang.sisa_detik)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {lelang.sisa_detik <= 0 ? 'Berakhir' : 'Sisa waktu'}
                                            </div>
                                            {lelang.sisa_detik <= 120 && lelang.sisa_detik > 0 && (
                                                <div className="text-xs text-red-600 font-medium mt-1 flex items-center">
                                                    ⚡ Auto-extend aktif
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bid Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-sm text-gray-600">Harga Awal</div>
                                            <div className="text-lg font-medium text-gray-900">
                                                {formatRupiah(lelang.harga_awal)}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-sm text-blue-600">Bid Tertinggi</div>
                                            <div className="text-lg font-bold text-blue-700">
                                                {formatRupiah(lelang.harga_tertinggi)}
                                            </div>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-sm text-green-600">Total Bid</div>
                                            <div className="text-lg font-bold text-green-700">
                                                {lelang.total_bid} bid
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleToggleBidHistory(lelang.id)}
                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 text-sm"
                                            >
                                                {isExpanded ? 'Sembunyikan' : 'Lihat'} History Bid
                                                {lelang.total_bid > 0 && (
                                                    <span className="ml-1">({lelang.total_bid})</span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => window.open(`/lelang-public/${lelang.id}`, '_blank')}
                                                className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-200 text-sm"
                                            >
                                                🔗 Link Public
                                            </button>
                                        </div>

                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleFinishLelang(lelang.id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                            >
                                                Selesaikan
                                            </button>
                                            <button
                                                onClick={() => handleCancelLelang(lelang.id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                                            >
                                                Batalkan
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bid History Expanded */}
                                    {isExpanded && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-gray-900">History Bidding</h4>
                                                    <div className="text-sm text-gray-500">
                                                        {bids.length} bid tercatat
                                                    </div>
                                                </div>

                                                {bids.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500">
                                                        Belum ada bid untuk lelang ini
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                                        {bids.map((bid, index) => (
                                                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                                                <div>
                                                                    <div className="font-medium text-gray-900">
                                                                        {bid.nama_bidder}
                                                                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                            #{bid.urutan}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatDateTime(bid.tanggal_bid)}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold text-green-600">
                                                                        {formatRupiah(bid.jumlah_bid)}
                                                                    </div>
                                                                    {index === 0 && (
                                                                        <div className="text-xs text-green-600">Tertinggi</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default LelangAktif