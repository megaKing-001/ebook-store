import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request) {
  try {
    const { slug, email } = await request.json();

    if (!slug || !email) {
      return NextResponse.json({ error: "Missing slug or email." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: book, error } = await supabaseAdmin.from("ebooks").select("*").eq("slug", slug).single();

    if (error || !book) {
      return NextResponse.json({ error: "Unknown ebook." }, { status: 404 });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;

    const transaction = await initializeTransaction({
      email,
      amount: book.price,
      currency: book.currency,
      slug: book.slug,
      callbackUrl: `${origin}/success`
    });

    return NextResponse.json({ authorizationUrl: transaction.authorization_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
