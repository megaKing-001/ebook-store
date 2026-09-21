import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createAccessToken } from "@/lib/accessToken";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: "Enter the email you paid with." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("slug, created_at, email, ebooks(title, type)")
      .ilike("email", cleanEmail)
      .eq("status", "success")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Could not look up your purchases." }, { status: 500 });
    }

    const seen = new Set();
    const items = [];
    for (const order of orders || []) {
      if (!order.ebooks || seen.has(order.slug)) continue;
      seen.add(order.slug);

      const token = createAccessToken({ slug: order.slug, kind: "paid", watermark: order.email, ttlMinutes: null });
      items.push({
        slug: order.slug,
        title: order.ebooks.title,
        type: order.ebooks.type,
        accessUrl: `/access/${token}`
      });
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
