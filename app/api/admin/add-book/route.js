import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const password = formData.get("password");
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const slug = String(formData.get("slug") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const subtitle = String(formData.get("subtitle") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const priceNaira = Number(formData.get("price"));
    const currency = String(formData.get("currency") || "NGN").trim();
    const description = String(formData.get("description") || "").trim();
    const longDescription = String(formData.get("long_description") || "").trim();
    const pagesRaw = formData.get("pages");
    const pages = pagesRaw ? Number(pagesRaw) : null;

    const coverFile = formData.get("cover");
    const pdfFile = formData.get("pdf");

    if (!slug || !title || !author || !priceNaira || !coverFile || !pdfFile) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const coverExt = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
    const coverPath = `${slug}.${coverExt}`;
    const { error: coverError } = await supabaseAdmin.storage
      .from("covers")
      .upload(coverPath, coverFile, { upsert: true, contentType: coverFile.type });

    if (coverError) {
      return NextResponse.json({ error: `Cover upload failed: ${coverError.message}` }, { status: 500 });
    }

    const { data: coverPublic } = supabaseAdmin.storage.from("covers").getPublicUrl(coverPath);

    const pdfPath = `${slug}.pdf`;
    const { error: pdfError } = await supabaseAdmin.storage
      .from("ebook-files")
      .upload(pdfPath, pdfFile, { upsert: true, contentType: "application/pdf" });

    if (pdfError) {
      return NextResponse.json({ error: `PDF upload failed: ${pdfError.message}` }, { status: 500 });
    }

    const priceMinorUnits = Math.round(priceNaira * 100);

    const { error: insertError } = await supabaseAdmin.from("ebooks").insert({
      slug,
      title,
      subtitle: subtitle || null,
      author,
      price: priceMinorUnits,
      currency,
      cover: coverPublic.publicUrl,
      description: description || null,
      long_description: longDescription || null,
      pages: pages || null,
      file_path: pdfPath
    });

    if (insertError) {
      return NextResponse.json({ error: `Could not save the book: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
