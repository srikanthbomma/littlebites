import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { children } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(children).orderBy(asc(children.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const [row] = await db
    .insert(children)
    .values({
      name,
      birthdate: body.birthdate ? String(body.birthdate) : null,
      avatarEmoji: String(body.avatarEmoji ?? "👶"),
      notes: String(body.notes ?? ""),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
