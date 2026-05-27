import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { slug, target } = await req.json();

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

    // Get target image URL
    const imageUrl = target === 'creator' ? battle.creator_image_url : battle.challenger_image_url;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/png';

    const prompt = "You are a brutally funny design critic. Roast this UI design in 3-4 sentences. Be savage but specific — reference actual elements you can see. No generic feedback. End with a punchline.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Claude error" }, { status: 500 });
    }

    const roast = data.content?.[0]?.text || "Failed to generate roast";

    // Insert roast into messages
    const { error: insertError } = await supabase
      .from('battle_messages')
      .insert({
        battle_id: battle.id,
        role: 'ai',
        content: roast,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
    }

    return NextResponse.json({ roast });

  } catch (error) {
    console.error("Battle roast error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate roast" }, { status: 500 });
  }
}
