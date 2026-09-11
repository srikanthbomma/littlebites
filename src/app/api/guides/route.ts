import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { guides } from "@/db/schema";

export async function GET() {
  const rows = await db
    .select({
      id: guides.id,
      title: guides.title,
      slug: guides.slug,
      excerpt: guides.excerpt,
      category: guides.category,
      readMinutes: guides.readMinutes,
      emoji: guides.emoji,
      imageUrl: guides.imageUrl,
    })
    .from(guides)
    .orderBy(asc(guides.id));
  return NextResponse.json(rows);
}
