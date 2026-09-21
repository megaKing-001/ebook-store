"use client";

import { useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";

export default function AccessPage({ params }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/access/${params.token}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load this content.");
        return json;
      })
      .then((json) => {
        setData(json);
        setState("ready");
      })
      .catch((err) => {
        setError(err.message);
        setState("error");
      });
  }, [params.token]);

  if (state === "loading") {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-stone">Loading…</div>;
  }

  if (state === "error") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="text-left">
          <BackButton fallbackHref="/library" />
        </div>
        <h1 className="font-serif text-2xl mb-3">Can&apos;t open this</h1>
        <p className="text-charcoal/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <BackButton fallbackHref="/library" />
      <h1 className="font-serif text-2xl mb-1">{data.title}</h1>

      {data.isFree && data.regularPrice && (
        <p className="text-sm text-brass mb-6">
          You have complimentary access. This normally costs {data.regularPrice}.
        </p>
      )}
      {!data.isFree && (
        <p className="text-xs text-stone mb-4">
          Lost this link later? Find it again anytime in{" "}
          <a href="/library" className="underline">
            My Library
          </a>
          .
        </p>
      )}

      {data.modules ? (
        <ul className="space-y-2 mt-2">
          {data.modules.map((mod, i) => (
            <li key={i}>
              <a
                href={mod.accessUrl}
                className="flex items-center justify-between border border-charcoal/15 px-4 py-3 hover:bg-parchmentDark transition-colors"
              >
                <span>{mod.title}</span>
                <span className="text-xs uppercase tracking-wide text-brass">{mod.type}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <>
          {data.type === "ebook" && <PdfReader signedUrl={data.signedUrl} watermark={data.watermark} />}
          {data.type === "video" && <ProtectedVideo signedUrl={data.signedUrl} watermark={data.watermark} />}
          {data.type === "audio" && <ProtectedAudio signedUrl={data.signedUrl} />}
        </>
      )}

      {data.bonusUrl && (
        <div className="mt-10 rule pt-6">
          <p className="text-sm text-stone mb-2">A bonus comes with this:</p>
          <a href={data.bonusUrl} className="inline-block bg-ink text-parchment px-5 py-2.5 text-sm">
            Open your bonus
          </a>
        </div>
      )}
    </div>
  );
}

function ProtectedVideo({ signedUrl, watermark }) {
  return (
    <div className="relative">
      <video
        src={signedUrl}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="w-full bg-black"
      />
      {watermark && (
        <div
          className="absolute top-2 right-3 text-white/70 text-xs pointer-events-none"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
        >
          {watermark}
        </div>
      )}
    </div>
  );
}

function ProtectedAudio({ signedUrl }) {
  return (
    <audio
      src={signedUrl}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      className="w-full"
    />
  );
}

function PdfReader({ signedUrl, watermark }) {
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjsLib = await import("pdfjs-dist/build/pdf");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ url: signedUrl, disableRange: true, disableStream: true });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setRenderError(err.message || "Could not display this ebook.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [signedUrl]);

  useEffect(() => {
    if (!pdfRef.current) return;
    let cancelled = false;

    async function renderPage() {
      try {
        const page = await pdfRef.current.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (watermark) stampWatermark(ctx, canvas.width, canvas.height, watermark);
      } catch (err) {
        if (!cancelled) setRenderError(err.message || "Could not display this page.");
      }
    }

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, numPages, watermark]);

  function goPrev() {
    setCurrentPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setCurrentPage((p) => Math.min(numPages || p, p + 1));
  }

  return (
    <div>
      {loading && <p className="text-stone text-sm">Loading…</p>}
      {renderError && <p className="text-sm text-burgundy">{renderError}</p>}

      <div className="select-none" style={{ userSelect: "none" }} onContextMenu={(e) => e.preventDefault()}>
        <canvas
          ref={canvasRef}
          key={currentPage}
          className="w-full h-auto shadow-sm mb-4 transition-opacity duration-300"
        />
      </div>

      {numPages && (
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={goPrev}
            disabled={currentPage <= 1}
            className="px-4 py-2 text-sm border border-charcoal/25 disabled:opacity-40"
          >
            ‹ Prev
          </button>
          <span className="text-xs text-stone">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage >= numPages}
            className="px-4 py-2 text-sm border border-charcoal/25 disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

function stampWatermark(ctx, width, height, text) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#16213E";
  ctx.font = `${Math.max(14, Math.round(width / 28))}px sans-serif`;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);

  const stepX = width * 0.6;
  const stepY = height * 0.22;
  for (let y = -height; y < height; y += stepY) {
    for (let x = -width; x < width; x += stepX) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}
