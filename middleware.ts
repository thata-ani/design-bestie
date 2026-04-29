import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Whitelist ────────────────────────────────────────────────────────────────
// While in private beta, only these emails can access gated features.
// Remove this array (or leave empty) when you open to all users.
const ALLOWED_EMAILS: string[] = [
  // Add your email here e.g. 'you@gmail.com'
  // Team members can be added here too
]

// Routes that require auth
const PROTECTED_API_ROUTES = [
  '/api/analyse',
  '/api/stress',
  '/api/roast',
  '/api/stakeholder',
  '/api/brief',
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove
  const { data: { user } } = await supabase.auth.getUser()

  const isProtectedRoute = PROTECTED_API_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Not logged in at all
    if (!user) {
      return NextResponse.json(
        { error: 'auth_required', message: 'Please sign in to continue.' },
        { status: 401 }
      )
    }

    // Private beta whitelist check (only active when ALLOWED_EMAILS has entries)
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json(
        { error: 'not_allowed', message: 'Design Besti is in private beta. Stay tuned.' },
        { status: 403 }
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/api/analyse/:path*',
    '/api/stress/:path*',
    '/api/roast/:path*',
    '/api/stakeholder/:path*',
    '/api/brief/:path*',
    // Also run on all page routes so session stays fresh
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
