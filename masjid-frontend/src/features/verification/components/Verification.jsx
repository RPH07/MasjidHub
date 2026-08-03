import DonationVerification from "./DonationVerification";
import ZakatVerificationTable from "./ZakatVerificationTable";
import { Button } from "@/components/ui/button";


const Verification = ({
    activeTab,
    onChangeTab,
    zakatPending = [],
    donasiPending = [],
    loading = false,
    actionLoading = false,
    error = '',
    onApproveZakat,
    onRejectZakat,
    onApproveDonasi,
    onRejectDonasi,
    onOpenBukti
}) => {
    const tabs = [
        {
            key: 'zakat',
            label: 'Zakat Masuk',
            count: zakatPending.length
        },
        {
            key: 'donasi',
            label: 'Donasi Program',
            count: donasiPending.length
        }
    ];

    return (
        <div className="space-y-6 px-5 sm:px-0">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight"></h2>
                <p className="mt-1 text-sm text-gray-500">Periksa bukti pembayaran sebelum transaksi masuk ke database</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-400">Zakat Menunggu Verification</p>
                    <p className="mt-2 text-2xl font-bold text-green-700">
                        {zakatPending.length}
                    </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-400">Donasi Menunggu Verification</p>
                    <p className="mt-2 text-2xl font-bold text-green-700">
                        {donasiPending.length}
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg  border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="-mb-px flex gap-6 whitespace-nowrap">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.key}
                            type="button"
                            onClick={() => onChangeTab(tab.key)}
                            className={`border-b-2 px-1 text-sm font-medium ${
                                activeTab === tab.key
                                ? 'border-blue-50 text-blue-600'
                                : 'border-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-05 text-xs text-gray-700">
                                {tab.count}
                            </span>
                        </Button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'zakat' && (
                <ZakatVerificationTable
                    data={zakatPending}
                    loading={loading}
                    actionLoading={actionLoading}
                    onApprove={onApproveZakat}
                    onReject={onRejectZakat}
                    onOpenBukti={onOpenBukti}
                />
            )}
            {activeTab === 'donasi' && (
                <DonationVerification
                data={donasiPending}
                loading={loading}
                actionLoading={actionLoading}
                onApprove={onApproveDonasi}
                onReject={onRejectDonasi}
                onOpenBukti={onOpenBukti}
                />
            )}
        </div>
    );
};

export default Verification;