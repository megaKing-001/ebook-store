"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref = "/" }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-sm text-stone hover:text-charcoal transition-colors mb-6 inline-flex items-center gap-1"
    >
      <span aria-hidden="true">‹</span> Back
    </button>
  );
}
