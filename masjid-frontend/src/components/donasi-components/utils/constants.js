export const DONASI_STATUS = {
    DRAFT: "draft",
    AKTIF: "aktif", 
    SELESAI: "selesai",
    BATAL: "batal",
};

export const KATEGORI_BARANG = {
    ELEKTRONIK: "elektronik",
    FURNITURE: "furniture", 
    PERLENGKAPAN_IBADAH: "perlengkapan_ibadah",
    RENOVASI: "renovasi",
    LAINNYA: "lainnya"
};

export const METODE_PEMBAYARAN = [
    { value: "transfer_bank", label: "Transfer Bank" },
    { value: "e_wallet", label: "E-Wallet (GoPay, OVO, Dana)" },
    { value: "tunai", label: "Tunai" }
];

export const STATUS_BADGES = {
    [DONASI_STATUS.DRAFT]: "bg-gray-100 text-gray-800",
    [DONASI_STATUS.AKTIF]: "bg-green-100 text-green-800", 
    [DONASI_STATUS.SELESAI]: "bg-blue-100 text-blue-800",
    [DONASI_STATUS.BATAL]: "bg-red-100 text-red-800",
};

// Backward compatibility dengan lelang
export const LELANG_STATUS = DONASI_STATUS;
export const KONDISI_BARANG = KATEGORI_BARANG;
export const DURASI_LELANG = METODE_PEMBAYARAN;