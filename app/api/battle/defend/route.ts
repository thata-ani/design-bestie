import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { slug, defense, role } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch battle
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    // Insert defense message
    const { error: insertError } = await supabase
      .from('battle_messages')
      .insert({
        battle_id: battle.id,
        role,
        content: defense,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
    }

    // Generate AI response
    const prompt = `You are a savage design critic. The designer just defended their work saying: "${defense}". Respond in 2 sentences — either destroy their defense or grudgingly accept one point.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Claude error" }, { status: 500 });
    }

    const aiResponse = data.content?.[0]?.text || "No response";

    // Insert AI response
    const { error: aiInsertError } = await supabase
      .from('battle_messages')
      .insert({
        battle_id: battle.id,
        role: 'ai',
        content: aiResponse,
      });

    if (aiInsertError) {
      console.error('AI insert error:', aiInsertError);
    }

    return NextResponse.json({ aiResponse });

  } catch (error) {
    console.error("Battle defend error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to defend" }, { status: 500 });
  }
}
