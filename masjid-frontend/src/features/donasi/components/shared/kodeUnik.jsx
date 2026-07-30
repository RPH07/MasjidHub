// Function yang sama persis seperti di backend
export const generateKodeUnikDonasi = () => {
    const kategoriKode = 3;
    const randomDigit = Math.floor(Math.random() * 90) + 10;
    return parseInt(`${kategoriKode}${randomDigit}`); // Random 3XX (300-399)
};

// Helper untuk format display
export const formatKodeUnik = (kode) => {
    return `+${kode}`;
};