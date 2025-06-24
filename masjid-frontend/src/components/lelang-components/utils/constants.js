export const LELANG_STATUS = {
    DRAFT: "draft",
    AKTIF: "aktif",
    SELESAI: "selesai",
    BATAL: "batal",
};

export const KONDISI_BARANG = {
    BARU: "baru",
    BEKAS_BAIK: "bekas_baik",
    BEKAS_RUSAK: "bekas_rusak",
};

export const DURASI_LELANG = [
    { value: "24", label: "24 Jam" },
    { value: "48", label: "48 Jam" },
    { value: "72", label: "72 Jam" },
];

export const API_BASE_URL = "http://localhost:5000/api";

export const STATUS_BADGES = {
    [LELANG_STATUS.DRAFT]: "bg-gray-100 text-gray-800",
    [LELANG_STATUS.AKTIF]: "bg-green-100 text-green-800",
    [LELANG_STATUS.SELESAI]: "bg-blue-100 text-blue-800",
    [LELANG_STATUS.BATAL]: "bg-red-100 text-red-800",
};
