import React, { useState } from 'react';
import DaftarDonasi from '../../components/donasi-components/components/DaftarDonasi/DaftarDonasi';
import TambahDonasi from '../../components/donasi-components/components/TambahDonasi/DonasiTambah';
import DonasiAktif from '../../components/donasi-components/components/DonasiAktif/DonasiAktif';
import HistoryDonasi from '../../components/donasi-components/components/DonasiHistory/DonasiHistory';

const Donasi = () => {
    const [activeTab, setActiveTab] = useState('Daftar Program');

    const renderContent = () => {
        switch (activeTab) {
            case 'Daftar Program':
                return <DaftarDonasi />;
            case 'Tambah Program':
                return <TambahDonasi />;
            case 'Program Aktif':
                return <DonasiAktif />;
            case 'Riwayat Donasi':
                return <HistoryDonasi />;
            default:
                return <DaftarDonasi />;
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Program Donasi</h1>
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex border-b mb-4">
                    <button
                        onClick={() => setActiveTab('Daftar Program')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Daftar Program' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Daftar Program
                    </button>
                    <button
                        onClick={() => setActiveTab('Tambah Program')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Tambah Program' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Tambah Program
                    </button>
                    <button
                        onClick={() => setActiveTab('Program Aktif')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Program Aktif' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Program Aktif
                    </button>
                    <button
                        onClick={() => setActiveTab('Riwayat Donasi')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'Riwayat Donasi' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    >
                        Riwayat Donasi
                    </button>
                </div>
                <div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Donasi;