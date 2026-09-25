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
      const res = await fetch(
        `/api/access/${params.token}`,
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error ||
            "Could not load this content."
        );
      }

      setData(json);
      setError("");
      setState("ready");

      return json;
    } catch (err) {
      setError(
        err.message ||
          "Could not load this content."
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
          You have complimentary access. This
          normally costs {data.regularPrice}.
        </p>
      )}

      {!data.isFree && (
        <p className="mb-4 text-xs text-stone">
          Lost this link later? Find it again
          anytime in{" "}
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
    } catch (err) {
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
    } catch (err) {
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
   * Get a fresh Supabase signed URL.
   */
  const refreshSignedUrl = useCallback(
    async () => {
      if (refreshAttemptedRef.current) {
        return false;
      }

      refreshAttemptedRef.current = true;
      setRefreshing(true);
      setRenderError("");

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
              "Could not refresh the ebook."
          );
        }

        setCurrentSignedUrl(
          json.signedUrl
        );

        setLoading(true);
        setRefreshing(false);

        return true;
      } catch (err) {
        setRenderError(
          err.message ||
            "Could not refresh the ebook."
        );

        setLoading(false);
        setRefreshing(false);

        return false;
      }
    },
    [accessToken]
  );


  /*
   * Load the PDF.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setRenderError("");

      try {
        const pdfjsLib =
          await import(
            "pdfjs-dist/build/pdf"
          );

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask =
          pdfjsLib.getDocument({
            url: currentSignedUrl,
            disableRange: true,
            disableStream: true,
          });

        const pdf =
          await loadingTask.promise;

        if (cancelled) return;

        pdfRef.current = pdf;

        setNumPages(pdf.numPages);

        setLoading(false);
        setRefreshing(false);

        /*
         * The new URL worked.
         * Allow another refresh in the future
         * if another signed URL expires.
         */
        refreshAttemptedRef.current =
          false;
      } catch (err) {
        if (cancelled) return;

        /*
         * The signed URL may have expired.
         * Request one fresh URL and try once more.
         */
        if (!refreshAttemptedRef.current) {
          const refreshed =
            await refreshSignedUrl();

          if (refreshed) {
            return;
          }
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
  }, [
    currentSignedUrl,
    refreshSignedUrl,
  ]);


  /*
   * Render the current PDF page.
   */
  useEffect(() => {
    if (!pdfRef.current) return;

    let cancelled = false;

    async function renderPage() {
      try {
        setRenderError("");

        const page =
          await pdfRef.current.getPage(
            currentPage
          );

        const viewport =
          page.getViewport({
            scale: 1.6,
          });

        const canvas =
          canvasRef.current;

        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx =
          canvas.getContext("2d");

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
    currentSignedUrl,
  ]);


  function goPrev() {
    setCurrentPage((p) =>
      Math.max(1, p - 1)
    );
  }

  function goNext() {
    setCurrentPage((p) =>
      Math.min(
        numPages || p,
        p + 1
      )
    );
  }


  async function manualRefresh() {
    /*
     * Allow a manual retry even if the
     * automatic refresh has already happened.
     */
    refreshAttemptedRef.current = false;

    await refreshSignedUrl();
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
            className="mt-3 rounded-full bg-burgundy px-4 py-2 text-xs font-semibold text-white"
          >
            Refresh ebook
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
