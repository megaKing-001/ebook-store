const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set in your environment variables.");
  }
  return key;
}

export async function initializeTransaction({ email, amount, currency, slug, callbackUrl }) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      amount,
      currency,
      callback_url: callbackUrl,
      metadata: { slug }
    })
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Could not start the Paystack transaction.");
  }
  return data.data;
}

export async function verifyTransaction(reference) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` }
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Could not verify the transaction.");
  }
  return data.data;
}
