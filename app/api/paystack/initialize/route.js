import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { initializeTransaction } from "@/lib/paystack";
import { createAccessToken } from "@/lib/accessToken";

export async function POST(request) {
  try {
    const { slug, email, phone } = await request.json();

    if (!slug || !email) {
      return NextResponse.json({ error: "Missing slug or email." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: book, error } = await supabaseAdmin.from("ebooks").select("*").eq("slug", slug).single();

    if (error || !book) {
      return NextResponse.json({ error: "Unknown ebook." }, { status: 404 });
    }

    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("email")
      .eq("slug", slug)
      .ilike("email", email.trim())
      .eq("status", "success")
      .limit(1)
      .maybeSingle();

    if (existingOrder) {
      const accessToken = createAccessToken({ slug: book.slug, kind: "paid", watermark: existingOrder.email, ttlMinutes: null });
      return NextResponse.json({ alreadyOwned: true, accessUrl: `/access/${accessToken}` });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;

    const transaction = await initializeTransaction({
      email,
      amount: book.price,
      currency: book.currency,
      slug: book.slug,
      phone,
      callbackUrl: `${origin}/success`
    });

    return NextResponse.json({ authorizationUrl: transaction.authorization_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
