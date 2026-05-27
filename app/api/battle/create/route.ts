import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, creatorName } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique slug
    const slug = Math.random().toString(36).slice(2, 10);

    // Determine file extension
    const ext = mimeType?.includes('png') ? 'png' : 'jpg';

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase storage
    const filePath = `${slug}/creator.${ext}`;
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

    const creator_image_url = urlData.publicUrl;

    // Insert battle record
    const { data: battleData, error: insertError } = await supabase
      .from('battles')
      .insert({
        slug,
        creator_id: user.id,
        creator_image_url,
        creator_name: creatorName || 'Anonymous',
        status: 'waiting',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: "Failed to create battle" }, { status: 500 });
    }

    return NextResponse.json({ slug });

  } catch (error) {
    console.error("Battle create error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create battle" }, { status: 500 });
  }
}
