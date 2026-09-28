"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
      setError(
        err.message || "Could not load this content."
      );
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

        <p className="text-charcoal/80">
          {error}
        </p>

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
          You have complimentary access. This normally
          costs {data.regularPrice}.
        </p>
      )}

      {!data.isFree && (
        <p className="mb-4 text-xs text-stone">
          Lost this link later? Find it again anytime in{" "}
          <a
            href="/library"
            className="underline"
          >
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
              accessToken={params.token}
            />
          )}

          {data.type === "video" && (
            <ProtectedVideo
              signedUrl={data.signedUrl}
              watermark={data.watermark}
              accessToken={params.token}
            />
          )}

          {data.type === "audio" && (
            <ProtectedAudio
              signedUrl={data.signedUrl}
              accessToken={params.token}
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


/* =====================================================
   VIDEO
===================================================== */

function ProtectedVideo({
  signedUrl,
  watermark,
  accessToken,
}) {
  const [currentUrl, setCurrentUrl] =
    useState(signedUrl);

  const [refreshing, setRefreshing] =
    useState(false);

  const retryRef = useRef(false);

  const refreshUrl = useCallback(async () => {
    if (retryRef.current) return;

    retryRef.current = true;
    setRefreshing(true);

    try {
      const res = await fetch(
        `/api/access/${accessToken}`,
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok || !json.signedUrl) {
        throw new Error(
          json.error ||
            "Could not refresh the video."
        );
      }

      setCurrentUrl(json.signedUrl);
      setRefreshing(false);
    } catch {
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    retryRef.current = false;
  }, [signedUrl]);

  return (
    <div className="relative">
      {refreshing && (
        <div className="mb-3 rounded-xl border border-brass/20 bg-brass/5 px-4 py-3">
          <p className="text-sm text-brass">
            Refreshing your secure video link…
          </p>
        </div>
      )}

      <video
        key={currentUrl}
        src={currentUrl}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onError={refreshUrl}
        onContextMenu={(e) =>
          e.preventDefault()
        }
        className="w-full bg-black"
      />

      {watermark && (
        <div
          className="pointer-events-none absolute right-3 top-2 text-xs text-white/70"
          style={{
            textShadow:
              "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {watermark}
        </div>
      )}
    </div>
  );
}


/* =====================================================
   AUDIO
===================================================== */

function ProtectedAudio({
  signedUrl,
  accessToken,
}) {
  const [currentUrl, setCurrentUrl] =
    useState(signedUrl);

  const [refreshing, setRefreshing] =
    useState(false);

  const retryRef = useRef(false);

  const refreshUrl = useCallback(async () => {
    if (retryRef.current) return;

    retryRef.current = true;
    setRefreshing(true);

    try {
      const res = await fetch(
        `/api/access/${accessToken}`,
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok || !json.signedUrl) {
        throw new Error(
          json.error ||
            "Could not refresh the audio."
        );
      }

      setCurrentUrl(json.signedUrl);
      setRefreshing(false);
    } catch {
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    retryRef.current = false;
  }, [signedUrl]);

  return (
    <div>
      {refreshing && (
        <div className="mb-3 rounded-xl border border-brass/20 bg-brass/5 px-4 py-3">
          <p className="text-sm text-brass">
            Refreshing your secure audio link…
          </p>
        </div>
      )}

      <audio
        key={currentUrl}
        src={currentUrl}
        controls
        controlsList="nodownload"
        onError={refreshUrl}
        onContextMenu={(e) =>
          e.preventDefault()
        }
        className="w-full"
      />
    </div>
  );
}


/* =====================================================
   PDF READER
===================================================== */

function PdfReader({
  signedUrl,
  watermark,
  accessToken,
}) {
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const loadingTaskRef = useRef(null);
  const mountedRef = useRef(true);
  const refreshAttemptedRef = useRef(false);

  const [currentSignedUrl, setCurrentSignedUrl] =
    useState(signedUrl);

  const [numPages, setNumPages] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [renderError, setRenderError] =
    useState("");

  /*
   * Cleanup when the reader is removed.
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch {
          // Ignore cleanup errors.
        }

        loadingTaskRef.current = null;
      }

      if (pdfRef.current) {
        try {
          pdfRef.current.destroy();
        } catch {
          // Ignore cleanup errors.
        }

        pdfRef.current = null;
      }
    };
  }, []);

  /*
   * Request a fresh signed URL.
   */
  const refreshSignedUrl = useCallback(
    async (allowRetry = false) => {
      if (
        !allowRetry &&
        refreshAttemptedRef.current
      ) {
        return false;
      }

      refreshAttemptedRef.current = true;

      if (mountedRef.current) {
        setRefreshing(true);
        setRenderError("");
      }

      try {
        const res = await fetch(
          `/api/access/${accessToken}`,
          {
            cache: "no-store",
          }
        );

        const json = await res.json();

        if (
          !res.ok ||
          !json.signedUrl
        ) {
          throw new Error(
            json.error ||
              "Could not refresh the ebook."
          );
        }

        if (!mountedRef.current) {
          return false;
        }

        /*
         * Replace the URL and force the PDF
         * loader to start cleanly.
         */
        setCurrentSignedUrl(
          json.signedUrl
        );

        setCurrentPage(1);
        setNumPages(null);
        setLoading(true);
        setRefreshing(false);

        return true;
      } catch (err) {
        if (mountedRef.current) {
          setRenderError(
            err.message ||
              "Could not refresh the ebook."
          );

          setLoading(false);
          setRefreshing(false);
        }

        return false;
      }
    },
    [accessToken]
  );

  /*
   * Load PDF from the current signed URL.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentSignedUrl) {
        setRenderError(
          "No ebook file was returned."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setRenderError("");

      /*
       * Destroy any previous PDF instance
       * before loading a new URL.
       */
      if (loadingTaskRef.current) {
        try {
          await loadingTaskRef.current.destroy();
        } catch {
          // Ignore cleanup errors.
        }

        loadingTaskRef.current = null;
      }

      if (pdfRef.current) {
        try {
          await pdfRef.current.destroy();
        } catch {
          // Ignore cleanup errors.
        }

        pdfRef.current = null;
      }

      try {
        const pdfjsLib =
          await import(
            "pdfjs-dist/build/pdf"
          );

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask =
          pdfjsLib.getDocument({
            url: currentSignedUrl,
            disableRange: true,
            disableStream: true,
          });

        loadingTaskRef.current =
          loadingTask;

        const pdf =
          await loadingTask.promise;

        if (
          cancelled ||
          !mountedRef.current
        ) {
          try {
            await pdf.destroy();
          } catch {
            // Ignore cleanup errors.
          }

          return;
        }

        pdfRef.current = pdf;

        setNumPages(pdf.numPages);

        setCurrentPage((page) =>
          Math.min(
            Math.max(page, 1),
            pdf.numPages
          )
        );

        setLoading(false);
        setRefreshing(false);

        /*
         * The current URL worked.
         * A future failure is allowed to
         * trigger another refresh.
         */
        refreshAttemptedRef.current =
          false;
      } catch (err) {
        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        /*
         * Only automatically refresh once
         * for a failed signed URL.
         */
        if (
          !refreshAttemptedRef.current
        ) {
          const refreshed =
            await refreshSignedUrl();

          if (refreshed) {
            return;
          }
        }

        setRenderError(
          err?.message ||
            "Could not display this ebook."
        );

        setLoading(false);
        setRefreshing(false);
      } finally {
        if (
          loadingTaskRef.current ===
          loadingTask
        ) {
          loadingTaskRef.current =
            null;
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    currentSignedUrl,
    refreshSignedUrl,
  ]);

  /*
   * Render the selected page.
   */
  useEffect(() => {
    if (
      !pdfRef.current ||
      !canvasRef.current ||
      !numPages
    ) {
      return;
    }

    let cancelled = false;

    async function renderPage() {
      try {
        setRenderError("");

        const pdf =
          pdfRef.current;

        const page =
          await pdf.getPage(
            currentPage
          );

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        const viewport =
          page.getViewport({
            scale: 1.6,
          });

        const canvas =
          canvasRef.current;

        if (!canvas) return;

        canvas.width =
          viewport.width;

        canvas.height =
          viewport.height;

        const ctx =
          canvas.getContext("2d");

        if (!ctx) {
          throw new Error(
            "Could not create the ebook reader canvas."
          );
        }

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        if (watermark) {
          stampWatermark(
            ctx,
            canvas.width,
            canvas.height,
            watermark
          );
        }

        setLoading(false);
        setRefreshing(false);
      } catch (err) {
        if (
          !cancelled &&
          mountedRef.current
        ) {
          setRenderError(
            err?.message ||
              "Could not display this page."
          );

          setLoading(false);
          setRefreshing(false);
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
    currentSignedUrl,
  ]);

  function goPrev() {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  }

  function goNext() {
    setCurrentPage((page) =>
      Math.min(
        numPages || page,
        page + 1
      )
    );
  }

  async function manualRefresh() {
    refreshAttemptedRef.current =
      false;

    await refreshSignedUrl(true);
  }

  return (
    <div>
      {loading && !refreshing && (
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
            onClick={manualRefresh}
            disabled={refreshing}
            className="mt-3 rounded-full bg-burgundy px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {refreshing
              ? "Refreshing…"
              : "Refresh ebook"}
          </button>
        </div>
      )}

      <div
        className="select-none"
        style={{
          userSelect: "none",
        }}
        onContextMenu={(e) =>
          e.preventDefault()
        }
      >
        <canvas
          ref={canvasRef}
          key={`${currentSignedUrl}-${currentPage}`}
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
            Page {currentPage} of{" "}
            {numPages}
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={
              currentPage >= numPages
            }
            className="border border-charcoal/25 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}


/* =====================================================
   WATERMARK
===================================================== */

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
      ctx.fillText(
        text,
        x,
        y
      );
    }
  }

  ctx.restore();
}
