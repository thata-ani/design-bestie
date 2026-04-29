import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect back to wherever the user was going, or home
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to home with error flag
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}
