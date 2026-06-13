import React, { useState } from 'react';
import Swal from 'sweetalert2';
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
        const transactionName =
            type === 'zakat'
                ? item.nama || 'Hamba Allah'
                : item.nama_donatur || 'Hamba Allah';

        const confirmation = await Swal.fire({
            title: 'Setujui transaksi?',
            text: `Transaksi dari ${transactionName} akan masuk ke kas setelah disetujui.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Setujui',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        });

        if (!confirmation.isConfirmed) return;

        const result = await verifyTransaction({
            type,
            id: item.id,
            action: 'approve'
        });

        if (result.success) {
            Swal.fire({
                title: 'Berhasil',
                text: result.message,
                icon: 'success',
                confirmButtonColor: '#16a34a'
            });
        } else {
            Swal.fire({
                title: 'Gagal',
                text: result.message,
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
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
            handleCloseReject();
            Swal.fire({
                title: 'Berhasil',
                text: result.message,
                icon: 'success',
                confirmButtonColor: '#16a34a'
            });
        } else {
            Swal.fire({
                title: 'Gagal',
                text: result.message,
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleOpenBukti = (buktiTransfer) => {
        if (!buktiTransfer) {
            Swal.fire({
                title: 'Bukti belum tersedia',
                text: 'Transaksi ini belum memiliki bukti transfer.',
                icon: 'info',
                confirmButtonColor: '#2563eb'
            });
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
