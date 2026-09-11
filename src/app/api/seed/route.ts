import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";
import { db } from "@/db";
import { foods, guides, recipes } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const res = await ensureDatabaseSeeded();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: res.error,
          hint: "Check your DATABASE_URL in environment variables (e.g. on Vercel or in .env)",
        },
        { status: 500 }
      );
    }

    const [fCount] = await db.select({ count: sql<number>`count(*)` }).from(foods);
    const [gCount] = await db.select({ count: sql<number>`count(*)` }).from(guides);
    const [rCount] = await db.select({ count: sql<number>`count(*)` }).from(recipes);

    const host = process.env.DATABASE_URL
      ? process.env.DATABASE_URL.split("@")[1]?.split("/")[0] || "configured"
      : "unknown";

    return NextResponse.json({
      success: true,
      message: "Database initialized and seeded successfully!",
      connectedTo: host,
      counts: {
        foods: Number(fCount?.count ?? 0),
        guides: Number(gCount?.count ?? 0),
        recipes: Number(rCount?.count ?? 0),
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
