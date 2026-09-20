import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyTransaction } from "@/lib/paystack";
import { createAccessToken } from "@/lib/accessToken";

export async function GET(request) {
  try {
    const reference = new URL(request.url).searchParams.get("reference");
    if (!reference) {
      return NextResponse.json({ error: "Missing reference." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const transaction = await verifyTransaction(reference);

    if (transaction.status !== "success") {
      return NextResponse.json({ status: transaction.status }, { status: 200 });
    }

    const slug = transaction.metadata?.slug;
    const { data: book, error: bookError } = await supabaseAdmin
      .from("ebooks")
      .select("*")
      .eq("slug", slug)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: "Unknown ebook on this transaction." }, { status: 404 });
    }

    if (transaction.amount !== book.price || transaction.currency !== book.currency) {
      return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });
    }

    const email = transaction.customer?.email || "";
    const phone = transaction.metadata?.phone || "";

    await supabaseAdmin
      .from("orders")
      .upsert(
        {
          reference,
          slug: book.slug,
          email,
          phone,
          amount: transaction.amount,
          currency: transaction.currency,
          status: "success"
        },
        { onConflict: "reference" }
      );

    const accessToken = createAccessToken({ slug: book.slug, kind: "paid", watermark: email, ttlMinutes: null });

    return NextResponse.json({
      status: "success",
      book: { title: book.title, slug: book.slug },
      accessUrl: `/access/${accessToken}`
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 500 });
  }
}
