import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { ProgramCard } from '../shared'
import { useDonasi } from '../../hooks/'
import { DONASI_STATUS } from '../../utils/'
import {EditDonasi, ViewDonations} from '../index'
import { Button } from "@/components/ui/button";
import { FloatingInput } from '@/components/form';

const DaftarDonasi = () => {
    const {
        programDonasi,
        loading,
        error,
        fetchProgramDonasi,
        updateProgramDonasi,
        deleteProgramDonasi,
        activateProgram,
        deactivateProgram,
        completeProgram
    } = useDonasi()

    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [editingProgram, setEditingProgram] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewingDonations, setViewingDonations] = useState(null);

    useEffect(() => {
        fetchProgramDonasi()
    }, [fetchProgramDonasi])

    useEffect (() => {
        if (error){
            console.error('Error in DaftarDonasi: ', error)
        }
    }, [error]);

    const filteredPrograms = programDonasi.filter(program => {
        const matchesFilter = filter === 'all' || program.status === filter
        const matchesSearch = program.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            program.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Handler untuk edit
    const handleEdit = (program) => {
        setEditingProgram(program);
    };

    // Handler untuk save edit
    const handleSaveEdit = async (formData) => {
        setIsSubmitting(true);
        try {
            const result = await updateProgramDonasi(editingProgram.id, formData, formData.foto_barang);
            
            if (result.success) {
                Swal.fire('Berhasil', result.message || 'Program donasi berhasil diperbarui!', 'success');
                setEditingProgram(null);
            } else {
                Swal.fire('Gagal', result.message, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler untuk cancel edit
    const handleCancelEdit = () => {
        setEditingProgram(null);
    };

    // Update handleDelete method
    const handleDelete = async (programId) => {
        try {
            const result = await deleteProgramDonasi(programId);
            if (result.success) {
                Swal.fire('Berhasil', result.message || 'Program donasi berhasil dihapus', 'success');
            } else {
                Swal.fire('Belum tersedia', result.message || 'Fitur hapus program belum tersedia', 'info');
            }
        } catch (error) {
            console.error('Error deleting program:', error);
            Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menghapus program', 'error');
        }
    };

    const handleActivate = async (programId) => {
        const result = await activateProgram(programId)
        if (result.success) {
            Swal.fire('Berhasil', result.message || 'Program donasi berhasil diaktifkan', 'success')
        } else {
            Swal.fire('Gagal', result.message, 'error')
        }
    }

    const handleDeactivate = async (programId) => {
        const result = await deactivateProgram(programId)
        if (result.success) {
            Swal.fire('Berhasil', result.message || 'Program donasi berhasil dinonaktifkan', 'success')
        } else {
            Swal.fire('Belum tersedia', result.message, 'info')
        }
    }

    const handleComplete = async (programId) => {
        const confirmation = await Swal.fire({
            title: 'Selesaikan program?',
            text: 'Program yang selesai akan masuk ke riwayat dan laporan.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Selesaikan',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        })

        if (!confirmation.isConfirmed) return

        const result = await completeProgram(programId)
        if (result.success) {
            Swal.fire('Berhasil', result.message || 'Program donasi berhasil diselesaikan', 'success')
        } else {
            Swal.fire('Gagal', result.message, 'error')
        }
    }

    const handleViewDonations = (program) => {
        setViewingDonations(program);
    };

    const handleCloseViewDonations = () => {
        setViewingDonations(null);
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
                <div className="text-red-600 mb-4">Terjadi Kesalahan: {error}</div>
                <Button
                    onClick={() => fetchProgramDonasi()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Coba Lagi
                </Button>
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

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                    <Button 
                        onClick={() => fetchProgramDonasi()} 
                        className="ml-2 underline hover:no-underline"
                    >
                        Muat ulang
                    </Button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <FloatingInput
                        label="Cari Program Donasi"
                        name="searchTerm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                        inputClassName="border-gray-300 focus:ring-green-500"
                        labelFocusClass="peer-focus:text-green-600"
                    />

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

            {editingProgram && (
                <EditDonasi 
                    program={editingProgram}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    isSubmitting={isSubmitting}
                />
            )}

            {viewingDonations && (
                <ViewDonations 
                    program={viewingDonations}
                    onClose= {handleCloseViewDonations}
                />
            )}
        </div>
    )
}

export default DaftarDonasi
