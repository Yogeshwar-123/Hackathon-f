export function getCurrencySymbol(currency) {
  if (!currency) return "\u20B9";
  const upper = currency.toUpperCase();
  if (upper === "INR" || upper === "INDIA") return "\u20B9";
  if (upper === "USD") return "$";
  if (upper === "EUR") return "\u20AC";
  if (upper === "GBP") return "\xA3";
  if (upper === "JPY") return "\xA5";
  return "$";
}
export function formatAmount(amount, currency) {
  const symbol = getCurrencySymbol(currency);
  const isINR = currency?.toUpperCase() === "INR";
  try {
    const formatted = new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return `${symbol}${formatted}`;
  } catch (e) {
    return `${symbol}${amount.toFixed(2)}`;
  }
}
