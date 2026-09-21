import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAccessToken, createAccessToken } from "@/lib/accessToken";
import { formatPrice } from "@/lib/format";

const FILE_LINK_TTL_SECONDS = 60 * 5;

export async function GET(request, { params }) {
  const payload = verifyAccessToken(params.token);
  if (!payload) {
    return json({ error: "This access link is invalid or has expired." }, 403);
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: book, error } = await supabaseAdmin.from("ebooks").select("*").eq("slug", payload.slug).single();

  if (error || !book) {
    return json({ error: "This item is no longer available." }, 404);
  }

  if (payload.moduleId) {
    const { data: mod, error: modError } = await supabaseAdmin
      .from("course_modules")
      .select("*")
      .eq("id", payload.moduleId)
      .eq("slug", payload.slug)
      .single();

    if (modError || !mod) {
      return json({ error: "This module is no longer available." }, 404);
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("ebook-files")
      .createSignedUrl(mod.file_path, FILE_LINK_TTL_SECONDS);

    if (signError || !signed) {
      return json({ error: `File not found: ${mod.file_path}` }, 500);
    }

    return json({
      title: `${book.title} — ${mod.title}`,
      type: mod.type,
      signedUrl: signed.signedUrl,
      isFree: payload.kind === "free",
      watermark: payload.watermark || "",
      regularPrice: null,
      bonusUrl: null,
      modules: null
    });
  }

  const isBonus = payload.bonus;

  if (!isBonus) {
    const { data: modules } = await supabaseAdmin
      .from("course_modules")
      .select("*")
      .eq("slug", payload.slug)
      .order("position", { ascending: true });

    if (modules && modules.length > 0) {
      let bonusToken = null;
      if (book.bonus_file_path) {
        bonusToken = createAccessToken({
          slug: book.slug,
          kind: payload.kind,
          isBonus: true,
          watermark: payload.watermark,
          ttlMinutes: null
        });
      }

      return json({
        title: book.title,
        type: null,
        signedUrl: null,
        isFree: payload.kind === "free",
        watermark: payload.watermark || "",
        regularPrice: formatPrice(book.price, book.currency),
        bonusUrl: bonusToken ? `/access/${bonusToken}` : null,
        modules: modules.map((m) => ({
          title: m.title,
          type: m.type,
          accessUrl: `/access/${createAccessToken({
            slug: book.slug,
            kind: payload.kind,
            moduleId: m.id,
            watermark: payload.watermark,
            ttlMinutes: null
          })}`
        }))
      });
    }
  }

  const filePath = isBonus ? book.bonus_file_path : book.file_path;
  const type = isBonus ? book.bonus_type : book.type;
  const title = isBonus ? book.bonus_title || `Bonus: ${book.title}` : book.title;

  if (!filePath) {
    return json({ error: "Nothing to show here." }, 404);
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from("ebook-files")
    .createSignedUrl(filePath, FILE_LINK_TTL_SECONDS);

  if (signError || !signed) {
    return json({ error: `File not found: ${filePath}` }, 500);
  }

  let bonusToken = null;
  if (!isBonus && book.bonus_file_path) {
    bonusToken = createAccessToken({
      slug: book.slug,
      kind: payload.kind,
      isBonus: true,
      watermark: payload.watermark,
      ttlMinutes: null
    });
  }

  return json({
    title,
    type,
    signedUrl: signed.signedUrl,
    isFree: payload.kind === "free",
    watermark: payload.watermark || "",
    regularPrice: !isBonus ? formatPrice(book.price, book.currency) : null,
    bonusUrl: bonusToken ? `/access/${bonusToken}` : null,
    modules: null
  });
}

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
  });
}
