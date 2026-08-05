import React, { useState, useEffect, useMemo } from 'react'
import { DonationProgramCard, DonationProgramListSkeleton } from '../shared'
import { useDonations } from '../../hooks/useDonations'
import { Button } from "@/components/ui/button";
import { formatRupiah, toNumber } from '@/utils/formatters'
import {DonationRecords} from '../index'

const ActiveDonationPrograms = () => {
    const {
        programAktif,
        loading,
        error,
        fetchProgramAktif,
        deactivateProgram,
        completeProgram
    } = useDonations()

    const [sortBy, setSortBy] = useState('newest')
    const [viewingDonations, setViewingDonations] = useState(null)

    const getProgress= (program) => {
        const target = toNumber(program.target_dana)
        if (target <= 0) return 0

        return (toNumber(program.dana_terkumpul) / target) * 100
    }

    useEffect(() => {
        fetchProgramAktif()
    }, [fetchProgramAktif])

    const sortedPrograms = useMemo (() => {
        return [...programAktif].sort((a, b) => {
            switch (sortBy) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at)
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at)
            case 'highest_target':
                return toNumber(b.target_dana) - toNumber(a.target_dana)
            case 'highest_collected':
                return toNumber(b.dana_terkumpul || 0) - toNumber(a.dana_terkumpul || 0)
            case 'highest_progress':
                return getProgress(b) - getProgress(a)
            default:
                return 0
            }
        })
    }, [programAktif, sortBy])

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
        setViewingDonations(program);
    }

    const handleCloseViewDonations = () => {
        setViewingDonations(null);
    }

    const stats = useMemo(() => {
        const totalTarget = programAktif.reduce((sum, program) => {
            return sum + toNumber(program.target_dana)
        }, 0)

        const totalCollected = programAktif.reduce((sum, program) => {
            return sum + toNumber(program.dana_terkumpul)
        }, 0)

        return {
            totalTarget,
            totalCollected,
            totalPrograms: programAktif.length,
            avgProgress: programAktif.length > 0 ? (totalCollected / totalTarget) * 100 : 0
        }
    }, [programAktif])

    const isInitialLoading = loading && programAktif.length === 0

    if (isInitialLoading) {
        return <DonationProgramListSkeleton statsCount={4} filters={false} />
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <Button
                    onClick={() => fetchProgramAktif()}
                    variant="success"
                >
                    Coba Lagi
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header & Statistics */}
            <div>
                <div className='flex items-center gap-3 mb-4'>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Program Donasi Aktif
                    </h2>
                    {loading && programAktif.length > 0 && (
                        <span className='text-xs text-gray-400'>
                            Memperbarui...
                        </span>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-blue-600 text-sm font-medium">Total Program</div>
                        <div className="text-2xl font-bold text-blue-900">{stats.totalPrograms}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-green-600 text-sm font-medium">Target Total</div>
                        <div className="text-2xl font-bold text-green-900">{formatRupiah(stats.totalTarget)}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-yellow-600 text-sm font-medium">Dana Terkumpul</div>
                        <div className="text-2xl font-bold text-yellow-900">{formatRupiah(stats.totalCollected)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-purple-600 text-sm font-medium">Progress Rata-rata</div>
                        <div className="text-2xl font-bold text-purple-900">{stats.avgProgress.toFixed(1)}%</div>
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
                        <DonationProgramCard
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

            {viewingDonations && (
                <DonationRecords 
                    program={viewingDonations}
                    onClose={handleCloseViewDonations}
                />
            )}
        </div>
    )
}

export default ActiveDonationPrograms
