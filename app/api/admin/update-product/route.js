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
    if (!slug) {
      return NextResponse.json({ error: "Missing slug." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const title = String(formData.get("title") || "").trim();
    const subtitle = String(formData.get("subtitle") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const type = String(formData.get("type") || "ebook").trim();
    const priceNaira = Number(formData.get("price"));
    const compareAtNairaRaw = formData.get("compareAtPrice");
    const compareAtNaira = compareAtNairaRaw ? Number(compareAtNairaRaw) : null;
    const description = String(formData.get("description") || "").trim();
    const longDescription = String(formData.get("long_description") || "").trim();
    const pagesRaw = formData.get("pages");
    const pages = pagesRaw ? Number(pagesRaw) : null;
    const bonusType = String(formData.get("bonusType") || "").trim() || null;
    const bonusTitle = String(formData.get("bonusTitle") || "").trim() || null;

    const update = {
      title,
      subtitle: subtitle || null,
      author,
      type,
      price: Math.round(priceNaira * 100),
      compare_at_price: compareAtNaira ? Math.round(compareAtNaira * 100) : null,
      description: description || null,
      long_description: longDescription || null,
      pages: pages || null,
      bonus_type: bonusType,
      bonus_title: bonusTitle
    };

    const coverFile = formData.get("cover");
    if (coverFile && coverFile.size > 0) {
      const ext = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${slug}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("covers")
        .upload(path, coverFile, { upsert: true, contentType: coverFile.type });
      if (upErr) return NextResponse.json({ error: `Cover upload failed: ${upErr.message}` }, { status: 500 });
      const { data: pub } = supabaseAdmin.storage.from("covers").getPublicUrl(path);
      update.cover = pub.publicUrl;
    }

    const mainFile = formData.get("mainFile");
    if (mainFile && mainFile.size > 0) {
      const ext = (mainFile.name.split(".").pop() || "bin").toLowerCase();
      const path = `${slug}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("ebook-files")
        .upload(path, mainFile, { upsert: true, contentType: mainFile.type });
      if (upErr) return NextResponse.json({ error: `File upload failed: ${upErr.message}` }, { status: 500 });
      update.file_path = path;
    }

    const bonusFile = formData.get("bonusFile");
    if (bonusFile && bonusFile.size > 0 && bonusType) {
      const ext = (bonusFile.name.split(".").pop() || "bin").toLowerCase();
      const path = `${slug}-bonus.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("ebook-files")
        .upload(path, bonusFile, { upsert: true, contentType: bonusFile.type });
      if (upErr) return NextResponse.json({ error: `Bonus upload failed: ${upErr.message}` }, { status: 500 });
      update.bonus_file_path = path;
    }

    const introVideo = formData.get("introVideo");
    if (introVideo && introVideo.size > 0) {
      const ext = (introVideo.name.split(".").pop() || "mp4").toLowerCase();
      const path = `${slug}-intro.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("covers")
        .upload(path, introVideo, { upsert: true, contentType: introVideo.type });
      if (upErr) return NextResponse.json({ error: `Intro video upload failed: ${upErr.message}` }, { status: 500 });
      const { data: pub } = supabaseAdmin.storage.from("covers").getPublicUrl(path);
      update.intro_video_path = pub.publicUrl;
    }

    const { error: updateError } = await supabaseAdmin.from("ebooks").update(update).eq("slug", slug);
    if (updateError) {
      return NextResponse.json({ error: `Could not save: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
