const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;

    const numericValue = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(numericValue) ? numericValue : fallback;
};

const formatRupiahNumber = (value) => toNumber(value);

const formatRupiah = (value) => `Rp ${formatRupiahNumber(value).toLocaleString('id-ID')}`;

const formatRupiahCompact = (value) => `Rp${formatRupiahNumber(value).toLocaleString('id-ID')}`;

module.exports = {
    toNumber,
    formatRupiah,
    formatRupiahCompact,
    formatRupiahNumber
};
