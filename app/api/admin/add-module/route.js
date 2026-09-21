import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const password = formData.get("password");
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const slug = String(formData.get("slug") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const type = String(formData.get("type") || "video").trim();
    const file = formData.get("file");

    if (!slug || !title || !file) {
      return NextResponse.json({ error: "Missing title or file." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { count } = await supabaseAdmin
      .from("course_modules")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);

    const moduleId = crypto.randomUUID();
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const filePath = `${slug}-module-${moduleId}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("ebook-files")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { error: insertError } = await supabaseAdmin.from("course_modules").insert({
      id: moduleId,
      slug,
      title,
      type,
      file_path: filePath,
      position: count || 0
    });

    if (insertError) {
      return NextResponse.json({ error: `Could not save: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
