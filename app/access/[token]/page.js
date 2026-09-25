"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";

export default function AccessPage({ params }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadAccess = useCallback(async () => {
    try {
      const res = await fetch(`/api/access/${params.token}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error || "Could not load this content."
        );
      }

      setData(json);
      setError("");
      setState("ready");

      return json;
    } catch (err) {
      setError(err.message);
      setState("error");
      throw err;
    }
  }, [params.token]);

  useEffect(() => {
    loadAccess().catch(() => {});
  }, [loadAccess]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center text-stone">
        Loading…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="text-left">
          <BackButton fallbackHref="/library" />
        </div>

        <h1 className="mb-3 font-serif text-2xl">
          Can&apos;t open this
        </h1>

        <p className="text-charcoal/80">{error}</p>

        <button
          type="button"
          onClick={() => {
            setState("loading");
            loadAccess().catch(() => {});
          }}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <BackButton fallbackHref="/library" />

      <h1 className="mb-1 font-serif text-2xl">
        {data.title}
      </h1>

      {data.isFree && data.regularPrice && (
        <p className="mb-6 text-sm text-brass">
          You have complimentary access. This normally costs{" "}
          {data.regularPrice}.
        </p>
      )}

      {!data.isFree && (
        <p className="mb-4 text-xs text-stone">
          Lost this link later? Find it again anytime in{" "}
          <a href="/library" className="underline">
            My Library
          </a>
          .
        </p>
      )}

      {data.modules ? (
        <ul className="mt-2 space-y-2">
          {data.modules.map((mod, i) => (
            <li key={i}>
              <a
                href={mod.accessUrl}
                className="flex items-center justify-between border border-charcoal/15 px-4 py-3 transition-colors hover:bg-parchmentDark"
              >
                <span>{mod.title}</span>
                <span className="text-xs uppercase tracking-wide text-brass">
                  {mod.type}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <>
          {data.type === "ebook" && (
            <PdfReader
              signedUrl={data.signedUrl}
              watermark={data.watermark}
              refreshAccess={loadAccess}
            />
          )}

          {data.type === "video" && (
            <ProtectedVideo
              signedUrl={data.signedUrl}
              watermark={data.watermark}
              refreshAccess={loadAccess}
            />
          )}

          {data.type === "audio" && (
            <ProtectedAudio
              signedUrl={data.signedUrl}
              refreshAccess={loadAccess}
            />
          )}
        </>
      )}

      {data.bonusUrl && (
        <div className="mt-10 border-t border-charcoal/10 pt-6">
          <p className="mb-2 text-sm text-stone">
            A bonus comes with this:
          </p>

          <a
            href={data.bonusUrl}
            className="inline-block bg-ink px-5 py-2.5 text-sm text-parchment"
          >
            Open your bonus
          </a>
        </div>
      )}
    </div>
  );
}


/* -----------------------------
   VIDEO
----------------------------- */

function ProtectedVideo({
  signedUrl,
  watermark,
  refreshAccess,
}) {
  const retriedRef = useRef(false);

  async function handleError() {
    if (retriedRef.current) return;

    retriedRef.current = true;

    try {
      await refreshAccess();
    } catch {}
  }

  useEffect(() => {
    retriedRef.current = false;
  }, [signedUrl]);

  return (
    <div className="relative">
      <video
        key={signedUrl}
        src={signedUrl}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onError={handleError}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full bg-black"
      />

      {watermark && (
        <div
          className="pointer-events-none absolute right-3 top-2 text-xs text-white/70"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {watermark}
        </div>
      )}
    </div>
  );
}


/* -----------------------------
   AUDIO
----------------------------- */

function ProtectedAudio({
  signedUrl,
  refreshAccess,
}) {
  const retriedRef = useRef(false);

  async function handleError() {
    if (retriedRef.current) return;

    retriedRef.current = true;

    try {
      await refreshAccess();
    } catch {}
  }

  useEffect(() => {
    retriedRef.current = false;
  }, [signedUrl]);

  return (
    <audio
      key={signedUrl}
      src={signedUrl}
      controls
      controlsList="nodownload"
      onError={handleError}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full"
    />
  );
}


/* -----------------------------
   PDF READER
----------------------------- */

function PdfReader({
  signedUrl,
  watermark,
  refreshAccess,
}) {
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const retriedRef = useRef(false);

  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [renderError, setRenderError] = useState("");

  /*
   * Load the PDF.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setRenderError("");

      try {
        const pdfjsLib = await import(
          "pdfjs-dist/build/pdf"
        );

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({
          url: signedUrl,
          disableRange: true,
          disableStream: true,
        });

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);

        retriedRef.current = false;
      } catch (err) {
        if (cancelled) return;

        /*
         * The Supabase signed URL may have expired.
         * Ask our server for a fresh one.
         */
        if (!retriedRef.current) {
          retriedRef.current = true;
          setRefreshing(true);

          try {
            await refreshAccess();
            return;
          } catch {}
        }

        setRenderError(
          err.message ||
            "Could not display this ebook."
        );

        setLoading(false);
        setRefreshing(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [signedUrl, refreshAccess]);


  /*
   * Render the current page.
   */
  useEffect(() => {
    if (!pdfRef.current) return;

    let cancelled = false;

    async function renderPage() {
      try {
        setRenderError("");

        const page = await pdfRef.current.getPage(
          currentPage
        );

        const viewport = page.getViewport({
          scale: 1.6,
        });

        const canvas = canvasRef.current;

        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        if (watermark) {
          stampWatermark(
            ctx,
            canvas.width,
            canvas.height,
            watermark
          );
        }

        if (!cancelled) {
          setRefreshing(false);
        }
      } catch (err) {
        if (!cancelled) {
          setRenderError(
            err.message ||
              "Could not display this page."
          );
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    numPages,
    watermark,
    signedUrl,
  ]);


  function goPrev() {
    setCurrentPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    setCurrentPage((p) =>
      Math.min(numPages || p, p + 1)
    );
  }

  return (
    <div>
      {loading && (
        <p className="text-sm text-stone">
          Loading ebook…
        </p>
      )}

      {refreshing && (
        <div className="mb-4 rounded-xl border border-brass/20 bg-brass/5 px-4 py-3">
          <p className="text-sm text-brass">
            Refreshing your secure reading link…
          </p>
        </div>
      )}

      {renderError && (
        <div className="mb-4 rounded-xl border border-burgundy/20 bg-burgundy/5 px-4 py-3">
          <p className="text-sm text-burgundy">
            {renderError}
          </p>

          <button
            type="button"
            onClick={async () => {
              setRefreshing(true);

              try {
                await refreshAccess();
              } catch {
                setRefreshing(false);
              }
            }}
            className="mt-3 rounded-full bg-burgundy px-4 py-2 text-xs font-semibold text-white"
          >
            Refresh ebook
          </button>
        </div>
      )}

      <div
        className="select-none"
        style={{ userSelect: "none" }}
        onContextMenu={(e) =>
          e.preventDefault()
        }
      >
        <canvas
          ref={canvasRef}
          key={`${signedUrl}-${currentPage}`}
          className="mb-4 h-auto w-full shadow-sm transition-opacity duration-300"
        />
      </div>

      {numPages && (
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentPage <= 1}
            className="border border-charcoal/25 px-4 py-2 text-sm disabled:opacity-40"
          >
            ‹ Prev
          </button>

          <span className="text-xs text-stone">
            Page {currentPage} of {numPages}
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={currentPage >= numPages}
            className="border border-charcoal/25 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}


/* -----------------------------
   WATERMARK
----------------------------- */

function stampWatermark(
  ctx,
  width,
  height,
  text
) {
  ctx.save();

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#16213E";

  ctx.font = `${Math.max(
    14,
    Math.round(width / 28)
  )}px sans-serif`;

  ctx.translate(
    width / 2,
    height / 2
  );

  ctx.rotate(-Math.PI / 6);

  const stepX = width * 0.6;
  const stepY = height * 0.22;

  for (
    let y = -height;
    y < height;
    y += stepY
  ) {
    for (
      let x = -width;
      x < width;
      x += stepX
    ) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}
