import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyTransaction } from "@/lib/paystack";

const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60 * 24;

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

    await supabaseAdmin
      .from("orders")
      .upsert(
        {
          reference,
          slug: book.slug,
          email,
          amount: transaction.amount,
          currency: transaction.currency,
          status: "success"
        },
        { onConflict: "reference" }
      );

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("ebook-files")
      .createSignedUrl(book.file_path, DOWNLOAD_LINK_TTL_SECONDS);

    if (signError || !signed) {
      return NextResponse.json(
        { error: `Payment succeeded, but the file couldn't be found in storage: ${book.file_path}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      book: { title: book.title, slug: book.slug },
      downloadUrl: signed.signedUrl
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 500 });
  }
}
