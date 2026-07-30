import { useCallback, useEffect, useState } from "react";
import { verifikasiService } from "../services/verifikasiService";

export const useVerifikasiTransaksi = () => {
    const [zakatPending, setZakatPending] = useState([]);
    const [donasiPending, setDonasiPending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPending = useCallback(async() => {
        setLoading(true);
        setError('');

        try {
            const [zakat, donasi] = await Promise.all([
                verifikasiService.getPendingZakat(),
                verifikasiService.getPendingDonasi()
            ]);

            setZakatPending(zakat);
            setDonasiPending(donasi);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.msg || 
                'Gagal mengambil data verifikasi'
            )
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyTransaction = async({type, id, action, rejectReason = ''}) => {
        setActionLoading(true);

        try {
            const response = 
                type == 'zakat'
                ? await verifikasiService.verifyZakat(id, action, rejectReason)
                : await verifikasiService.verifyDonasi(id, action, rejectReason);

                await fetchPending();

                return {
                    success: true,
                    message: response?.msg || response?.message || 'Transaksi berhasil diverifikasi'
                }
        } catch (error) {
            console.error(error);

            return {
                success: false,
                message: 
                    error.response?.data?.msg ||
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Gagal memverifikasi transaksi'
            }
                
        } finally {
            setActionLoading(false)
        }
    };

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    return {
        zakatPending,
        donasiPending,
        loading,
        actionLoading,
        error,
        fetchPending,
        verifyTransaction
    };
};