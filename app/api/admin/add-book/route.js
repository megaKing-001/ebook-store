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
    const type = String(formData.get("type") || "ebook").trim();
    const priceNaira = Number(formData.get("price"));
    const compareAtNairaRaw = formData.get("compareAtPrice");
    const compareAtNaira = compareAtNairaRaw ? Number(compareAtNairaRaw) : null;
    const currency = String(formData.get("currency") || "NGN").trim();
    const description = String(formData.get("description") || "").trim();
    const longDescription = String(formData.get("long_description") || "").trim();
    const pagesRaw = formData.get("pages");
    const pages = pagesRaw ? Number(pagesRaw) : null;

    const bonusType = String(formData.get("bonusType") || "").trim() || null;
    const bonusTitle = String(formData.get("bonusTitle") || "").trim() || null;

    const coverFile = formData.get("cover");
    const mainFile = formData.get("mainFile");
    const bonusFile = formData.get("bonusFile");
    const introVideo = formData.get("introVideo");

    if (!slug || !title || !author || !priceNaira || !coverFile || !mainFile) {
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

    const mainExt = (mainFile.name.split(".").pop() || "bin").toLowerCase();
    const mainPath = `${slug}.${mainExt}`;
    const { error: mainError } = await supabaseAdmin.storage
      .from("ebook-files")
      .upload(mainPath, mainFile, { upsert: true, contentType: mainFile.type });
    if (mainError) {
      return NextResponse.json({ error: `File upload failed: ${mainError.message}` }, { status: 500 });
    }

    let bonusFilePath = null;
    if (bonusFile && bonusType) {
      const bonusExt = (bonusFile.name.split(".").pop() || "bin").toLowerCase();
      bonusFilePath = `${slug}-bonus.${bonusExt}`;
      const { error: bonusError } = await supabaseAdmin.storage
        .from("ebook-files")
        .upload(bonusFilePath, bonusFile, { upsert: true, contentType: bonusFile.type });
      if (bonusError) {
        return NextResponse.json({ error: `Bonus upload failed: ${bonusError.message}` }, { status: 500 });
      }
    }

    let introVideoUrl = null;
    if (introVideo && introVideo.size > 0) {
      const introExt = (introVideo.name.split(".").pop() || "mp4").toLowerCase();
      const introPath = `${slug}-intro.${introExt}`;
      const { error: introError } = await supabaseAdmin.storage
        .from("covers")
        .upload(introPath, introVideo, { upsert: true, contentType: introVideo.type });
      if (introError) {
        return NextResponse.json({ error: `Intro video upload failed: ${introError.message}` }, { status: 500 });
      }
      const { data: introPublic } = supabaseAdmin.storage.from("covers").getPublicUrl(introPath);
      introVideoUrl = introPublic.publicUrl;
    }

    const priceMinorUnits = Math.round(priceNaira * 100);
    const compareAtMinorUnits = compareAtNaira ? Math.round(compareAtNaira * 100) : null;

    const { error: insertError } = await supabaseAdmin.from("ebooks").insert({
      slug,
      title,
      subtitle: subtitle || null,
      author,
      type,
      price: priceMinorUnits,
      compare_at_price: compareAtMinorUnits,
      currency,
      cover: coverPublic.publicUrl,
      description: description || null,
      long_description: longDescription || null,
      pages: pages || null,
      file_path: mainPath,
      bonus_type: bonusFilePath ? bonusType : null,
      bonus_file_path: bonusFilePath,
      bonus_title: bonusFilePath ? bonusTitle : null,
      intro_video_path: introVideoUrl
    });

    if (insertError) {
      return NextResponse.json({ error: `Could not save the product: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
