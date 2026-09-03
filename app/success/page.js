"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [state, setState] = useState("verifying");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setState("error");
      setError("No payment reference was found in the URL.");
      return;
    }

    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed.");
        return data;
      })
      .then((data) => {
        if (data.status === "success") {
          setResult(data);
          setState("success");
        } else {
          setState("pending");
        }
      })
      .catch((err) => {
        setError(err.message);
        setState("error");
      });
  }, [reference]);

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      {state === "verifying" && <p className="text-stone">Confirming your payment…</p>}

      {state === "success" && result && (
        <>
          <h1 className="font-serif text-2xl mb-3">Thank you</h1>
          <p className="text-charcoal/80 mb-8">
            Your copy of <span className="font-serif italic">{result.book.title}</span> is ready.
          </p>
          <a
            href={result.downloadUrl}
            className="inline-block bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors"
          >
            Download PDF
          </a>
          <p className="text-xs text-stone mt-4">This link expires in 24 hours for your security.</p>
        </>
      )}

      {state === "pending" && (
        <>
          <h1 className="font-serif text-2xl mb-3">Payment not yet confirmed</h1>
          <p className="text-charcoal/80">
            If you completed payment, this can take a moment. Refresh this page shortly, or contact us with your reference: {reference}.
          </p>
        </>
      )}

      {state === "error" && (
        <>
          <h1 className="font-serif text-2xl mb-3">Something went wrong</h1>
          <p className="text-charcoal/80 mb-6">{error}</p>
          <Link href="/shop" className="underline underline-offset-4">
            Back to shop
          </Link>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
