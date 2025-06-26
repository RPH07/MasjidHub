export const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatCountdown = (sisaDetik) => {
    if (sisaDetik <= 0) return "Berakhir";

    const hari = Math.floor(sisaDetik / (24 * 3600));
    const jam = Math.floor((sisaDetik % (24 * 3600)) / 3600);
    const menit = Math.floor((sisaDetik % 3600) / 60);
    const detik = sisaDetik % 60;

    if (hari > 0) return `${hari}h ${jam}j ${menit}m`;
    if (jam > 0) return `${jam}j ${menit}m ${detik}d`;
    return `${menit}m ${detik}d`;
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID");
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
