import React, { useState, useEffect } from 'react'
import { ProgramCard } from '../shared'
import { useDonasi } from '../../hooks/'
import { DONASI_STATUS } from '../../utils/'

const DaftarDonasi = () => {
    const {
        programDonasi,
        loading,
        error,
        fetchProgramDonasi,
        deleteProgramDonasi,
        activateProgram,
        deactivateProgram,
        completeProgram
    } = useDonasi()

    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProgramDonasi()
    }, [fetchProgramDonasi])

    const filteredPrograms = programDonasi.filter(program => {
        const matchesFilter = filter === 'all' || program.status === filter
        const matchesSearch = program.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            program.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleEdit = (program) => {
        // TODO: Implement edit functionality
        console.log('Edit program:', program)
    }

    const handleDelete = async (programId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus program donasi ini?')) {
            const result = await deleteProgramDonasi(programId)
            if (result.success) {
                alert('Program donasi berhasil dihapus')
            } else {
                alert(result.message)
            }
        }
    }

    const handleActivate = async (programId) => {
        const result = await activateProgram(programId)
        if (result.success) {
            alert('Program donasi berhasil diaktifkan')
        } else {
            alert(result.message)
        }
    }

    const handleDeactivate = async (programId) => {
        if (window.confirm('Apakah Anda yakin ingin menonaktifkan program ini?')) {
            const result = await deactivateProgram(programId)
            if (result.success) {
                alert('Program donasi berhasil dinonaktifkan')
            } else {
                alert(result.message)
            }
        }
    }

    const handleComplete = async (programId) => {
        if (window.confirm('Apakah Anda yakin ingin menyelesaikan program ini?')) {
            const result = await completeProgram(programId)
            if (result.success) {
                alert('Program donasi berhasil diselesaikan')
            } else {
                alert(result.message)
            }
        }
    }

    const handleViewDonations = (program) => {
        // TODO: Navigate to donations detail
        console.log('View donations for:', program)
    }

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
                    onClick={() => fetchProgramDonasi()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Coba Lagi
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Daftar Program Donasi
                </h2>
                <div className="text-sm text-gray-600">
                    Total: {filteredPrograms.length} program
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Cari program donasi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="md:w-48">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value={DONASI_STATUS.DRAFT}>Draft</option>
                            <option value={DONASI_STATUS.AKTIF}>Aktif</option>
                            <option value={DONASI_STATUS.SELESAI}>Selesai</option>
                            <option value={DONASI_STATUS.BATAL}>Batal</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Program List */}
            {filteredPrograms.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">
                        {searchTerm || filter !== 'all' 
                            ? 'Tidak ada program yang sesuai dengan filter'
                            : 'Belum ada program donasi'
                        }
                    </div>
                    <div className="text-gray-400">
                        {searchTerm || filter !== 'all'
                            ? 'Coba ubah kata kunci pencarian atau filter'
                            : 'Mulai dengan menambahkan program donasi baru'
                        }
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredPrograms.map(program => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onActivate={handleActivate}
                            onDeactivate={handleDeactivate}
                            onComplete={handleComplete}
                            onViewDonations={handleViewDonations}
                            showActions={true}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default DaftarDonasi