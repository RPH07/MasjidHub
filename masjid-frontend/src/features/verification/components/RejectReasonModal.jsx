import { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

const RejectReasonModal = ({
    open,
    title = 'Tolak Transaksi',
    description = 'Berikan alasan penolakan untuk transaksi ini',
    loading = false,
    onClose,
    onSubmit
}) => {
    const [reason, setReason] = useState('');

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!reason.trim()) {
            Swal.fire({
                title: 'Alasan wajib diisi',
                text: 'Masukkan alasan penolakan supaya donatur/DKM tahu penyebab transaksi ditolak.',
                icon: 'warning',
                confirmButtonColor: '#dc2626'
            });
            return;
        }

        onSubmit(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-l">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border border-r-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Contoh: Bukti Transfer Tidak Sesuai"
                        disabled={loading}
                    />
                    <div className="flex justify-end gap-2">
                        <Button 
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-shadow-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </Button>
                        
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Tolak'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectReasonModal;
