// Shared money-formatting helper — thousands separators, always exactly two
// decimal places, e.g. formatCurrency(2000000.8) -> "2,000,000.80".
export const formatCurrency = (value) => {
  const num = Number(value);
  if (value === null || value === undefined || value === '' || Number.isNaN(num)) return '—';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
