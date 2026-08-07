import React, { useState } from 'react';
import DonationProgramList from '@/features/donations/components/DonationProgramList/DonationProgramList';
import CreateDonationProgram from '@/features/donations/components/CreateDonationProgram/CreateDonationProgram';
import ActiveDonationPrograms from '@/features/donations/components/ActiveDonationPrograms/ActiveDonationPrograms';
import DonationHistory from '@/features/donations/components/DonationHistory/DonationHistory';
import { Button } from "@/components/ui/button";

const Donations = () => {
    const [activeTab, setActiveTab] = useState('Daftar Program');
    const [visitedTabs, setVisitedTabs] = useState(['Daftar Program']);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setVisitedTabs((prev) => {
            return prev.includes(tab) ? prev :
            [...prev, tab]
        });
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Program Donasi</h1>
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex border-b mb-4">
                    <Button
                        onClick={() => handleTabChange('Daftar Program')}
                        variant="tab"
                        active={activeTab === 'Daftar Program'}
                        className="font-semibold"
                    >
                        Daftar Program
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Tambah Program')}
                        variant="tab"
                        active={activeTab === 'Tambah Program'}
                        className="font-semibold"
                    >
                        Tambah Program
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Program Aktif')}
                        variant="tab"
                        active={activeTab === 'Program Aktif'}
                        className="font-semibold"
                    >
                        Program Aktif
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Riwayat Donasi')}
                        variant="tab"
                        active={activeTab === 'Riwayat Donasi'}
                        className="font-semibold"
                    >
                        Riwayat Donasi
                    </Button>
                </div>
                <div>
                    {visitedTabs.includes('Daftar Program') && (
                        <div className={activeTab === 'Daftar Program' ? 'block' : 'hidden'}>
                            <DonationProgramList />
                        </div>
                    )}
                    {visitedTabs.includes('Tambah Program') && (
                        <div className={activeTab === 'Tambah Program' ? 'block' : 'hidden'}>
                            <CreateDonationProgram />
                        </div>
                    )}
                    {visitedTabs.includes('Program Aktif') && (
                        <div className={activeTab === 'Program Aktif' ? 'block' : 'hidden'}>
                            <ActiveDonationPrograms />
                        </div>
                    )}
                    {visitedTabs.includes('Riwayat Donasi') && (
                        <div className={activeTab === 'Riwayat Donasi' ? 'block' : 'hidden'}>
                            <DonationHistory />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Donations;
