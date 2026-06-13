import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useVerifikasiTransaksi } from '@/components/verifikasi-components/hooks/useVerifikasiTransaksi';
import Verifikasi from '@/components/verifikasi-components/components/Verifikasi';
import RejectReasonModal from '@/components/verifikasi-components/components/RejectReasonModal';


const VerifikasiTransaksi = () => {
    const [activeTab, setActiveTab] = useState('zakat');
    const [rejectModal, setRejectModal] = useState({
        open: false,
        type: '',
        id: null,
        name: ''
    });

    const {
        zakatPending,
        donasiPending,
        loading,
        actionLoading,
        error,
        verifyTransaction
    } = useVerifikasiTransaksi();

    const handleApprove = async (type, item) => {
        const confirmed = window.confirm('Yakin ingin menyetujui transaksi ini?');

        if(!confirmed) return;

        const result = await verifyTransaction({
            type, 
            id: item.id,
            action: 'approve'
        });

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
        
    };

    const handleOpenReject = (type, item) => {
        setRejectModal({
            open: true,
            type,
            id: item.id,
            name: 
                type === 'zakat'
                    ? item.nama || 'Hamba Allah'
                    : item.nama_donatur || 'Hamba Allah'
        });
    };

    const handleCloseReject = () => {
        setRejectModal({
            open: false,
            type: '',
            id: null,
            name: ''
        });
    };

    const handleRejectSubmit = async(reason) => {
        const result = await verifyTransaction({
            type: rejectModal.type,
            id: rejectModal.id,
            action: 'reject',
            rejectReason: reason
        });
        if (result.success) {
            toast.success(result.message);
            handleCloseReject();
        } else {
            toast.error(result.message);
        }
    };

    const handleOpenBukti = (buktiTransfer) => {
        if (!buktiTransfer) {
            toast.error('Bukti Transfer belum tersedia');
            return;
        }
        window.open(buktiTransfer, '_blank', 'noopener, noreferrer');
    };

    return(
        <>
            <Verifikasi
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                zakatPending={zakatPending}
                donasiPending={donasiPending}
                loading={loading}
                actionLoading={actionLoading}
                error={error}
                onApproveZakat={(item) => handleApprove('zakat', item)}
                onRejectZakat={(item) => handleOpenReject('zakat', item)}
                onApproveDonasi={(item) => handleApprove('donasi', item)}
                onRejectDonasi={(item) => handleOpenReject('donasi', item)}
                onOpenBukti={handleOpenBukti}
            />

            <RejectReasonModal 
                open={rejectModal.open}
                title={`Tolak ${rejectModal.type === 'zakat' ? 'Zakat' : 'Donasi'} dari ${rejectModal.name}?`}
                description="Berikan alasan penolakan untuk informasi donatur"
                loading={actionLoading}
                onClose={handleCloseReject}
                onSubmit={handleRejectSubmit}
            />
        </>
    );
};

export default VerifikasiTransaksi;

