import React, { useState, useEffect } from 'react'
import { ProgramCard } from '../shared'
import { useDonasi } from '../../hooks/useDonasi'
import { formatRupiah } from '../../utils'

const DonasiAktif = () => {
    const {
        programAktif,
        loading,
        error,
        fetchProgramAktif,
        deactivateProgram,
        completeProgram
    } = useDonasi()

    const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
        fetchProgramAktif()
    }, [fetchProgramAktif])

    const sortedPrograms = [...programAktif].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.tanggal_dibuat) - new Date(a.tanggal_dibuat)
            case 'oldest':
                return new Date(a.tanggal_dibuat) - new Date(b.tanggal_dibuat)
            case 'highest_target':
                return b.target_dana - a.target_dana
            case 'highest_collected':
                return (b.dana_terkumpul || 0) - (a.dana_terkumpul || 0)
            case 'highest_progress':
                { const progressA = ((a.dana_terkumpul || 0) / a.target_dana) * 100
                const progressB = ((b.dana_terkumpul || 0) / b.target_dana) * 100
                return progressB - progressA }
            default:
                return 0
        }
    })

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

    // Calculate statistics
    const totalTarget = programAktif.reduce((sum, program) => sum + program.target_dana, 0)
    const totalCollected = programAktif.reduce((sum, program) => sum + (program.dana_terkumpul || 0), 0)
    const totalPrograms = programAktif.length
    const avgProgress = totalPrograms > 0 ? (totalCollected / totalTarget) * 100 : 0

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
                    onClick={() => fetchProgramAktif()}
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
                    Program Donasi Aktif
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-blue-600 text-sm font-medium">Total Program</div>
                        <div className="text-2xl font-bold text-blue-900">{totalPrograms}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-green-600 text-sm font-medium">Target Total</div>
                        <div className="text-2xl font-bold text-green-900">{formatRupiah(totalTarget)}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-yellow-600 text-sm font-medium">Dana Terkumpul</div>
                        <div className="text-2xl font-bold text-yellow-900">{formatRupiah(totalCollected)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-purple-600 text-sm font-medium">Progress Rata-rata</div>
                        <div className="text-2xl font-bold text-purple-900">{avgProgress.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Menampilkan {sortedPrograms.length} program aktif
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Urutkan:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="newest">Terbaru</option>
                            <option value="oldest">Terlama</option>
                            <option value="highest_target">Target Tertinggi</option>
                            <option value="highest_collected">Dana Terkumpul Terbanyak</option>
                            <option value="highest_progress">Progress Tertinggi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Program List */}
            {sortedPrograms.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">
                        Tidak ada program donasi aktif
                    </div>
                    <div className="text-gray-400">
                        Aktifkan program donasi dari daftar draft
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {sortedPrograms.map(program => (
                        <ProgramCard
                            key={program.id}
                            program={program}
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

export default DonasiAktif