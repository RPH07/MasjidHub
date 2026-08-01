import React, { useState } from 'react';
import DaftarDonasi from '@/features/donasi/components/DaftarDonasi/DaftarDonasi';
import TambahDonasi from '@/features/donasi/components/TambahDonasi/DonasiTambah';
import DonasiAktif from '@/features/donasi/components/DonasiAktif/DonasiAktif';
import HistoryDonasi from '@/features/donasi/components/DonasiHistory/DonasiHistory';
import { Button } from "@/components/ui/button";

const Donasi = () => {
    const [activeTab, setActiveTab] = useState('Daftar Program');
    const [visitedTabs, setVisitedTabs] = useState(['Daftar Program']);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setVisitedTabs((prev) => {
            return prev.includes(tab) ? prev : [...prev, tab];
        });
    };
    

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Program Donasi</h1>
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex border-b mb-4">
                    <Button
                        onClick={() => handleTabChange('Daftar Program')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Daftar Program' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Daftar Program
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Tambah Program')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Tambah Program' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Tambah Program
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Program Aktif')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Program Aktif' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Program Aktif
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Riwayat Donasi')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Riwayat Donasi' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Riwayat Donasi
                    </Button>
                </div>
                <div>
                    {visitedTabs.includes('Daftar Program') && (
                        <div className={activeTab === 'Daftar Program' ? 'block' : 'hidden'}>
                            <DaftarDonasi />
                        </div>
                    )}

                    {visitedTabs.includes('Tambah Program') && (
                        <div className={activeTab === 'Tambah Program' ? 'block' : 'hidden'}>
                            <TambahDonasi />
                        </div>
                    )}

                    {visitedTabs.includes('Program Aktif') && (
                        <div className={activeTab === 'Program Aktif' ? 'block' : 'hidden'}>
                            <DonasiAktif />
                        </div>
                    )}

                    {visitedTabs.includes('Riwayat Donasi') && (
                        <div className={activeTab === 'Riwayat Donasi' ? 'block' : 'hidden'}>
                            <HistoryDonasi />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Donasi;