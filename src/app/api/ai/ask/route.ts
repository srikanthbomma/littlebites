import { NextRequest, NextResponse } from "next/server";
import { getChildFoodData } from "@/lib/food-data";
import { answerQuestion, buildSuggestions, DISCLAIMER } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const childId = Number(body.childId);
  const question = String(body.question ?? "").trim();
  if (!Number.isFinite(childId) || !question) {
    return NextResponse.json({ error: "childId and question required" }, { status: 400 });
  }
  const data = await getChildFoodData(childId);
  const suggestions = buildSuggestions(data.baby, data.tried, data.catalog, data.allergenStates, data.recipes);
  const answer = answerQuestion(
    question,
    {
      baby: data.baby,
      tried: data.tried,
      catalog: data.catalog,
      allergenStates: data.allergenStates,
      suggestions,
    },
    body.lastKey ? String(body.lastKey) : null
  );
  return NextResponse.json({ answer, disclaimer: DISCLAIMER, baby: data.baby });
}
