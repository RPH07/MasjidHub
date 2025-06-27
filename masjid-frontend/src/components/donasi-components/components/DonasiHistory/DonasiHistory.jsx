import React, { useState, useEffect } from 'react'
import { ProgramCard } from '../shared'
import { useDonasiHistory } from '../../hooks/useDonasiHistory'
import { formatRupiah, formatDate } from '../../utils/formatters'

const DonasiHistory = () => {
    const {
        historyDonasi,
        detailProgram,
        donatursPerProgram,
        loading,
        error,
        fetchHistoryDonasi,
        fetchDetailProgram,
        resetDetailProgram,
        exportLaporanDonasi
    } = useDonasiHistory()

    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState({
        from: '',
        to: ''
    })
    const [sortBy, setSortBy] = useState('tanggal_selesai') // tanggal_selesai, dana_terkumpul, nama_barang
    const [showDetailModal, setShowDetailModal] = useState(false)

    useEffect(() => {
        fetchHistoryDonasi()
    }, [fetchHistoryDonasi])

    // Pastikan historyDonasi adalah array
    const safeHistory = Array.isArray(historyDonasi) ? historyDonasi : []

    // Filter dan sort history
    const filteredHistory = safeHistory
        .filter(program => {
            const matchesSearch = program.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                program.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
            
            let matchesDate = true
            if (dateFilter.from || dateFilter.to) {
                const programDate = new Date(program.tanggal_selesai || program.created_at)
                if (dateFilter.from) {
                    matchesDate = matchesDate && programDate >= new Date(dateFilter.from)
                }
                if (dateFilter.to) {
                    matchesDate = matchesDate && programDate <= new Date(dateFilter.to)
                }
            }
            
            return matchesSearch && matchesDate
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'tanggal_selesai':
                    return new Date(b.tanggal_selesai || b.created_at) - new Date(a.tanggal_selesai || a.created_at)
                case 'dana_terkumpul':
                    return (b.dana_terkumpul || 0) - (a.dana_terkumpul || 0)
                case 'nama_barang':
                    return (a.nama_barang || '').localeCompare(b.nama_barang || '')
                default:
                    return 0
            }
        })

    const handleViewDetail = async (program) => {
        await fetchDetailProgram(program.id)
        setShowDetailModal(true)
    }

    const handleCloseDetail = () => {
        setShowDetailModal(false)
        resetDetailProgram()
    }

    const handleExportLaporan = async (programId, format) => {
        const result = await exportLaporanDonasi(programId, format)
        if (result.success) {
            alert('Laporan berhasil diexport')
        } else {
            alert(result.message)
        }
    }

    // Calculate statistics
    const totalPrograms = safeHistory.length
    const totalDanaSelesai = safeHistory.reduce((sum, program) => sum + (program.dana_terkumpul || 0), 0)
    const avgDanaPerProgram = totalPrograms > 0 ? totalDanaSelesai / totalPrograms : 0

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                    onClick={() => fetchHistoryDonasi()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Coba Lagi
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header & Statistics */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Riwayat Program Donasi
                </h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-700">Total Program Selesai</h3>
                        <p className="text-2xl font-bold text-blue-900">{totalPrograms}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-700">Total Dana Terkumpul</h3>
                        <p className="text-2xl font-bold text-green-900">{formatRupiah(totalDanaSelesai)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-purple-700">Rata-rata per Program</h3>
                        <p className="text-2xl font-bold text-purple-900">{formatRupiah(avgDanaPerProgram)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Cari program..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Date From */}
                    <div>
                        <input
                            type="date"
                            value={dateFilter.from}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Dari tanggal"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <input
                            type="date"
                            value={dateFilter.to}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Sampai tanggal"
                        />
                    </div>
                </div>

                {/* Sort */}
                <div className="mt-4 flex justify-between items-center">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="tanggal_selesai">Urutkan: Tanggal Selesai</option>
                        <option value="dana_terkumpul">Urutkan: Dana Terkumpul</option>
                        <option value="nama_barang">Urutkan: Nama Program</option>
                    </select>

                    <div className="text-sm text-gray-600">
                        Menampilkan {filteredHistory.length} dari {totalPrograms} program
                    </div>
                </div>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">
                        {totalPrograms === 0 
                            ? 'Belum ada program donasi yang selesai'
                            : 'Tidak ada program yang sesuai dengan filter'
                        }
                    </div>
                    <div className="text-gray-400">
                        {totalPrograms === 0
                            ? 'Program yang sudah selesai akan muncul di sini'
                            : 'Coba ubah kata kunci pencarian atau filter tanggal'
                        }
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredHistory.map(program => (
                        <div key={program.id} className="relative">
                            <ProgramCard
                                program={program}
                                onViewDonations={handleViewDetail}
                                showActions={false}
                            />
                            {/* Additional History Info */}
                            <div className="absolute top-4 right-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewDetail(program)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                    >
                                        Detail
                                    </button>
                                    <button
                                        onClick={() => handleExportLaporan(program.id, 'csv')}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && detailProgram && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Detail Program: {detailProgram.nama_barang}
                                </h3>
                                <button
                                    onClick={handleCloseDetail}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Program Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Target Dana</span>
                                        <div className="font-semibold">{formatRupiah(detailProgram.target_dana)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Dana Terkumpul</span>
                                        <div className="font-semibold text-green-600">{formatRupiah(detailProgram.dana_terkumpul)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Total Donatur</span>
                                        <div className="font-semibold">{donatursPerProgram.length} orang</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Tanggal Selesai</span>
                                        <div className="font-semibold">{formatDate(detailProgram.tanggal_selesai)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Donors List */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Daftar Donatur ({donatursPerProgram.length})</h4>
                                {donatursPerProgram.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada data donatur
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Nama Donatur
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Nominal
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Metode
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tanggal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {donatursPerProgram.map((donasi, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {donasi.nama_donatur}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatRupiah(donasi.nominal)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span className="capitalize">{donasi.metode_pembayaran}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(donasi.tanggal_donasi)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                                <button
                                    onClick={() => handleExportLaporan(detailProgram.id, 'csv')}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={handleCloseDetail}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DonasiHistory