import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { slug, imageBase64, mimeType, challengerName } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch battle
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    if (battle.status !== 'waiting') {
      return NextResponse.json({ error: "Battle already started" }, { status: 400 });
    }

    // Determine file extension
    const ext = mimeType?.includes('png') ? 'png' : 'jpg';

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload challenger image
    const filePath = `${slug}/challenger.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('battle-images')
      .upload(filePath, buffer, {
        contentType: mimeType || 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('battle-images')
      .getPublicUrl(filePath);

    const challenger_image_url = urlData.publicUrl;

    // Update battle
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        challenger_id: user?.id || null,
        challenger_image_url,
        challenger_name: challengerName || 'Anonymous',
        status: 'in_progress',
      })
      .eq('slug', slug);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: "Failed to join battle" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Battle join error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to join battle" }, { status: 500 });
  }
}
