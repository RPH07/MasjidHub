import React, { useEffect, useState } from 'react'
import { useLelang } from '../../hooks'
import { LelangCard } from '../shared'
import { LELANG_STATUS } from '../../utils'

const LelangDaftar = () => {
    const {
        barangLelang,
        loading,
        error,
        fetchBarangLelang,
        deleteBarangLelang,
        startLelang,
        cancelLelang,
        finishLelang
    } = useLelang()

    const [filter, setFilter] = useState('all')
    const [editModal, setEditModal] = useState({ show: false, data: null })

    // Load data saat component mount
    useEffect(() => {
        fetchBarangLelang(filter)
    }, [fetchBarangLelang, filter])

    // Handle actions
    const handleStartLelang = async (id) => {
        if (window.confirm('Yakin ingin memulai lelang ini?')) {
            const result = await startLelang(id)
            if (result.success) {
                alert(result.message)
            } else {
                alert(result.message)
            }
        }
    }

    const handleCancelLelang = async (id) => {
        const alasan = window.prompt('Alasan pembatalan (opsional):')
        if (alasan !== null) { // User tidak cancel prompt
            const result = await cancelLelang(id, alasan)
            if (result.success) {
                alert(result.message)
            } else {
                alert(result.message)
            }
        }
    }

    const handleFinishLelang = async (id) => {
        if (window.confirm('Yakin ingin menyelesaikan lelang ini?')) {
            const result = await finishLelang(id)
            if (result.success) {
                alert(result.message)
            } else {
                alert(result.message)
            }
        }
    }

    const handleDeleteLelang = async (id) => {
        if (window.confirm('Yakin ingin menghapus barang lelang ini? Aksi ini tidak dapat dibatalkan.')) {
            const result = await deleteBarangLelang(id)
            if (result.success) {
                alert(result.message)
            } else {
                alert(result.message)
            }
        }
    }

    const handleEditLelang = (barang) => {
        setEditModal({ show: true, data: barang })
    }

    // Filter data
    const filteredData = filter === 'all'
        ? barangLelang
        : barangLelang.filter(item => item.status_lelang === filter)

    // Stats untuk cards
    const stats = {
        total: barangLelang.length,
        draft: barangLelang.filter(item => item.status_lelang === LELANG_STATUS.DRAFT).length,
        aktif: barangLelang.filter(item => item.status_lelang === LELANG_STATUS.AKTIF).length,
        selesai: barangLelang.filter(item => item.status_lelang === LELANG_STATUS.SELESAI).length,
        batal: barangLelang.filter(item => item.status_lelang === LELANG_STATUS.BATAL).length
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data lelang...</p>
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
                        <h3 className="text-red-800 font-medium">Terjadi Kesalahan</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchBarangLelang(filter)}
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
            {/* Header & Stats */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Daftar Barang Lelang</h2>
                        <p className="text-gray-600 text-sm">Kelola semua barang yang akan/sedang/sudah dilelang</p>
                    </div>
                    <button
                        onClick={() => fetchBarangLelang(filter)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm flex items-center"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'blue' },
                        { label: 'Draft', value: stats.draft, color: 'gray' },
                        { label: 'Aktif', value: stats.aktif, color: 'green' },
                        { label: 'Selesai', value: stats.selesai, color: 'blue' },
                        { label: 'Dibatalkan', value: stats.batal, color: 'red' }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'Semua' },
                        { key: LELANG_STATUS.DRAFT, label: 'Draft' },
                        { key: LELANG_STATUS.AKTIF, label: 'Aktif' },
                        { key: LELANG_STATUS.SELESAI, label: 'Selesai' },
                        { key: LELANG_STATUS.BATAL, label: 'Dibatalkan' }
                    ].map(filterOption => (
                        <button
                            key={filterOption.key}
                            onClick={() => setFilter(filterOption.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === filterOption.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {filterOption.label}
                            {filterOption.key !== 'all' && (
                                <span className="ml-1 text-xs">
                                    ({filterOption.key === LELANG_STATUS.DRAFT ? stats.draft
                                        : filterOption.key === LELANG_STATUS.AKTIF ? stats.aktif
                                            : filterOption.key === LELANG_STATUS.SELESAI ? stats.selesai
                                                : stats.batal})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {filteredData.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filter === 'all' ? 'Belum Ada Barang Lelang' : `Tidak Ada Lelang ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {filter === 'all'
                            ? 'Mulai dengan menambahkan barang pertama untuk dilelang'
                            : 'Belum ada lelang dengan status ini'
                        }
                    </p>
                    {filter === 'all' && (
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            + Tambah Barang Lelang
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredData.map(barang => (
                        <LelangCard
                            key={barang.id}
                            barang={barang}
                            onStart={handleStartLelang}
                            onCancel={handleCancelLelang}
                            onFinish={handleFinishLelang}
                            onEdit={handleEditLelang}
                            onDelete={handleDeleteLelang}
                            showActions={true}
                        />
                    ))}
                </div>
            )}

            {/* Edit Modal - TODO: Implement later */}
            {editModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Edit Barang Lelang</h3>
                        <p className="text-gray-600 mb-4">Fitur edit akan diimplementasikan di komponen LelangTambah</p>
                        <button
                            onClick={() => setEditModal({ show: false, data: null })}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LelangDaftar