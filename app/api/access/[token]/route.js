import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAccessToken, createAccessToken } from "@/lib/accessToken";
import { formatPrice } from "@/lib/format";

const FILE_LINK_TTL_SECONDS = 60 * 5; // the underlying file link is only valid 5 minutes at a time

export async function GET(request, { params }) {
  const payload = verifyAccessToken(params.token);
  if (!payload) {
    return NextResponse.json({ error: "This access link is invalid or has expired." }, { status: 403 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: book, error } = await supabaseAdmin.from("ebooks").select("*").eq("slug", payload.slug).single();

  if (error || !book) {
    return NextResponse.json({ error: "This item is no longer available." }, { status: 404 });
  }

  const isBonus = payload.bonus;
  const filePath = isBonus ? book.bonus_file_path : book.file_path;
  const type = isBonus ? book.bonus_type : book.type;
  const title = isBonus ? book.bonus_title || `Bonus: ${book.title}` : book.title;

  if (!filePath) {
    return NextResponse.json({ error: "Nothing to show here." }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from("ebook-files")
    .createSignedUrl(filePath, FILE_LINK_TTL_SECONDS);

  if (signError || !signed) {
    return NextResponse.json({ error: `File not found: ${filePath}` }, { status: 500 });
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

  return NextResponse.json({
    title,
    type,
    signedUrl: signed.signedUrl,
    isFree: payload.kind === "free",
    watermark: payload.watermark || "",
    regularPrice: !isBonus ? formatPrice(book.price, book.currency) : null,
    bonusUrl: bonusToken ? `/access/${bonusToken}` : null
  });
}
