import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const supabase = await createClient();

    // Fetch battle
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    // Fetch all messages
    const { data: messages, error: messagesError } = await supabase
      .from('battle_messages')
      .select('*')
      .eq('battle_id', battle.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Messages error:', messagesError);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    // Build conversation summary
    const conversation = messages
      ?.map((m: any) => `${m.role}: ${m.content}`)
      .join('\n\n') || '';

    const prompt = `You are a boxing judge. Based on these design roasts and defenses, pick a winner. Format: WINNER: [creator/challenger]\nREASON: [one sentence why]\n\nConversation:\n${conversation}`;

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

    const verdict = data.content?.[0]?.text || "WINNER: creator\nREASON: Default winner";

    // Parse winner
    const winnerMatch = verdict.match(/WINNER:\s*(creator|challenger)/i);
    const reasonMatch = verdict.match(/REASON:\s*(.+)/i);
    const winner = winnerMatch?.[1].toLowerCase() || 'creator';
    const reason = reasonMatch?.[1] || 'No reason provided';

    // Update battle
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'completed',
        winner,
      })
      .eq('slug', slug);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    // Insert verdict message
    const { error: verdictError } = await supabase
      .from('battle_messages')
      .insert({
        battle_id: battle.id,
        role: 'ai',
        content: verdict,
      });

    if (verdictError) {
      console.error('Verdict insert error:', verdictError);
    }

    return NextResponse.json({ winner, reason });

  } catch (error) {
    console.error("Battle verdict error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate verdict" }, { status: 500 });
  }
}
