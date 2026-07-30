const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;

  let numericText = String(value).trim().replace(/[^\d,.-]/g, '');

  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(numericText)) {
    numericText = numericText.replace(/\./g, '').replace(',', '.');
  } else {
    numericText = numericText.replace(/,/g, '');
  }

  const numericValue = Number(numericText);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const formatRupiah = (amount) => rupiahFormatter.format(toNumber(amount));

export const formatCurrency = formatRupiah;

export const formatRupiahCompactMillions = (amount) => {
  const value = Math.floor(toNumber(amount) / 1000000);
  return value.toLocaleString('id-ID');
};
