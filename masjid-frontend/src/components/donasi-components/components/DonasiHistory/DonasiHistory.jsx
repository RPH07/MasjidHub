import React, { useEffect, useState } from 'react'
import { useLelang, useBidHistory } from '../../hooks'
import { formatRupiah, formatDateTime, formatDate } from '../../utils'

const LelangHistory = () => {
    const {
        lelangHistory,
        loading,
        error,
        fetchLelangHistory
    } = useLelang()

    const {
        bidHistory,
        fetchBidHistory
    } = useBidHistory()

    const [sortBy, setSortBy] = useState('tanggal_selesai') // tanggal_selesai, harga_terjual, keuntungan
    const [sortOrder, setSortOrder] = useState('desc') // asc, desc
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedDetails, setExpandedDetails] = useState({})

    // Load data saat component mount
    useEffect(() => {
        fetchLelangHistory()
    }, [fetchLelangHistory])

    // Handle sorting
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    // Handle search
    const filteredAndSortedData = React.useMemo(() => {
        let filtered = lelangHistory.filter(item =>
            item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.pemenang_nama?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        // Sort data
        filtered.sort((a, b) => {
            let aValue, bValue

            switch (sortBy) {
                case 'tanggal_selesai':
                    aValue = new Date(a.tanggal_selesai || a.created_at)
                    bValue = new Date(b.tanggal_selesai || b.created_at)
                    break
                case 'harga_terjual':
                    aValue = a.harga_terjual || a.harga_tertinggi || 0
                    bValue = b.harga_terjual || b.harga_tertinggi || 0
                    break
                case 'keuntungan':
                    aValue = (a.harga_terjual || a.harga_tertinggi || 0) - a.harga_awal
                    bValue = (b.harga_terjual || b.harga_tertinggi || 0) - b.harga_awal
                    break
                default:
                    aValue = a[sortBy]
                    bValue = b[sortBy]
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        return filtered
    }, [lelangHistory, searchTerm, sortBy, sortOrder])

    // Handle expand details
    const handleToggleDetails = async (lelangId) => {
        if (expandedDetails[lelangId]) {
            setExpandedDetails(prev => ({
                ...prev,
                [lelangId]: false
            }))
        } else {
            await fetchBidHistory(lelangId)
            setExpandedDetails(prev => ({
                ...prev,
                [lelangId]: true
            }))
        }
    }

    // Calculate stats
    const stats = React.useMemo(() => {
        const totalLelang = lelangHistory.length
        const totalHargaAwal = lelangHistory.reduce((sum, item) => sum + item.harga_awal, 0)
        const totalHargaTerjual = lelangHistory.reduce((sum, item) => sum + (item.harga_terjual || item.harga_tertinggi || 0), 0)
        const totalKeuntungan = totalHargaTerjual - totalHargaAwal
        const avgKeuntungan = totalLelang > 0 ? totalKeuntungan / totalLelang : 0

        return {
            totalLelang,
            totalHargaAwal,
            totalHargaTerjual,
            totalKeuntungan,
            avgKeuntungan
        }
    }, [lelangHistory])

    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️'
        return sortOrder === 'asc' ? '↑' : '↓'
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat history lelang...</p>
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
                        <h3 className="text-red-800 font-medium">Gagal Memuat History</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchLelangHistory}
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
                    <h2 className="text-xl font-semibold text-gray-900">History Lelang</h2>
                    <p className="text-gray-600 text-sm">
                        Daftar semua lelang yang telah selesai beserta detail pemenang dan keuntungan
                    </p>
                </div>
                <button
                    onClick={fetchLelangHistory}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm flex items-center"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {lelangHistory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalLelang}</div>
                        <div className="text-sm text-gray-600">Total Lelang Selesai</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-blue-600">{formatRupiah(stats.totalHargaTerjual)}</div>
                        <div className="text-sm text-gray-600">Total Pendapatan</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-green-600">{formatRupiah(stats.totalKeuntungan)}</div>
                        <div className="text-sm text-gray-600">Total Keuntungan</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-purple-600">{formatRupiah(stats.avgKeuntungan)}</div>
                        <div className="text-sm text-gray-600">Rata-rata Keuntungan</div>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Cari barang atau nama pemenang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Sort Options */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleSort('tanggal_selesai')}
                            className={`px-3 py-2 rounded text-sm ${sortBy === 'tanggal_selesai' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Tanggal {getSortIcon('tanggal_selesai')}
                        </button>
                        <button
                            onClick={() => handleSort('harga_terjual')}
                            className={`px-3 py-2 rounded text-sm ${sortBy === 'harga_terjual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Harga {getSortIcon('harga_terjual')}
                        </button>
                        <button
                            onClick={() => handleSort('keuntungan')}
                            className={`px-3 py-2 rounded text-sm ${sortBy === 'keuntungan' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Keuntungan {getSortIcon('keuntungan')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredAndSortedData.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'Tidak Ditemukan' : 'Belum Ada History'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm
                            ? `Tidak ada lelang yang cocok dengan pencarian "${searchTerm}"`
                            : 'Belum ada lelang yang selesai. History akan muncul setelah ada lelang yang diselesaikan.'
                        }
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Barang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Harga Awal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Harga Final
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Keuntungan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pemenang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Selesai
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAndSortedData.map(item => {
                                    const hargaFinal = item.harga_terjual || item.harga_tertinggi || 0
                                    const keuntungan = hargaFinal - item.harga_awal
                                    const isExpanded = expandedDetails[item.id]
                                    const bids = bidHistory[item.id] || []

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {item.foto_barang && (
                                                            <img
                                                                src={`http://localhost:5000/uploads/${item.foto_barang}`}
                                                                alt={item.nama_barang}
                                                                className="h-10 w-10 rounded-lg object-cover mr-3"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.nama_barang}</div>
                                                            <div className="text-sm text-gray-500 capitalize">{item.kondisi_barang?.replace('_', ' ')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatRupiah(item.harga_awal)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-green-600">
                                                        {formatRupiah(hargaFinal)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-bold ${keuntungan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {keuntungan >= 0 ? '+' : ''}{formatRupiah(keuntungan)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {((keuntungan / item.harga_awal) * 100).toFixed(1)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.pemenang_nama || '-'}
                                                    </div>
                                                    {item.pemenang_kontak && (
                                                        <div className="text-sm text-gray-500">{item.pemenang_kontak}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.tanggal_selesai
                                                        ? formatDateTime(item.tanggal_selesai)
                                                        : formatDate(item.created_at)
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleToggleDetails(item.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        {isExpanded ? 'Tutup' : 'Detail'}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                        <div className="space-y-4">
                                                            {/* Informasi Detail */}
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 mb-2">Informasi Lelang</h4>
                                                                    <div className="text-sm space-y-1">
                                                                        <div>Total Bid: <span className="font-medium">{item.total_bid}</span></div>
                                                                        <div>Durasi: <span className="font-medium">{item.durasi_lelang_jam} jam</span></div>
                                                                        {item.tanggal_mulai && (
                                                                            <div>Dimulai: <span className="font-medium">{formatDateTime(item.tanggal_mulai)}</span></div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 mb-2">Deskripsi</h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        {item.deskripsi || 'Tidak ada deskripsi'}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 mb-2">Statistik</h4>
                                                                    <div className="text-sm space-y-1">
                                                                        <div>Persentase Keuntungan:
                                                                            <span className={`font-medium ml-1 ${keuntungan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {((keuntungan / item.harga_awal) * 100).toFixed(1)}%
                                                                            </span>
                                                                        </div>
                                                                        <div>Kenaikan dari Awal:
                                                                            <span className="font-medium ml-1 text-blue-600">
                                                                                {formatRupiah(hargaFinal - item.harga_awal)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* History Bidding */}
                                                            {bids.length > 0 && (
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 mb-3">History Bidding ({bids.length} bid)</h4>
                                                                    <div className="max-h-40 overflow-y-auto">
                                                                        <div className="grid gap-2">
                                                                            {bids.map((bid, index) => (
                                                                                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                                                                    <div>
                                                                                        <span className="font-medium">{bid.nama_bidder}</span>
                                                                                        <span className="text-gray-500 ml-2">#{bid.urutan}</span>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <div className="font-medium text-green-600">
                                                                                            {formatRupiah(bid.jumlah_bid)}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {formatDateTime(bid.tanggal_bid)}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LelangHistory