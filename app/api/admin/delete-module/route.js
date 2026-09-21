import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { password, id } = await request.json();
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: mod } = await supabaseAdmin.from("course_modules").select("file_path").eq("id", id).single();

    const { error } = await supabaseAdmin.from("course_modules").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Could not delete module." }, { status: 500 });
    }

    if (mod?.file_path) {
      await supabaseAdmin.storage.from("ebook-files").remove([mod.file_path]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
