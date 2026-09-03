export function formatPrice(amountInMinorUnits, currency) {
  const amount = amountInMinorUnits / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 0
  }).format(amount);
}
