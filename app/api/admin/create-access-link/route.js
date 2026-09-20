import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createAccessToken } from "@/lib/accessToken";

export async function POST(request) {
  try {
    const { password, slug, label } = await request.json();

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: book, error } = await supabaseAdmin.from("ebooks").select("slug, title").eq("slug", slug).single();

    if (error || !book) {
      return NextResponse.json({ error: "Unknown book/course slug." }, { status: 404 });
    }

    const watermark = label ? `Complimentary access — ${label}` : "Complimentary access — not for resale";
    const token = createAccessToken({ slug: book.slug, kind: "free", watermark, ttlMinutes: null });

    return NextResponse.json({ url: `/access/${token}`, title: book.title });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
