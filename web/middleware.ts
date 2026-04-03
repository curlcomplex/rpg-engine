import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { SessionData } from '@/lib/auth';
import { sessionOptions } from '@/lib/auth';

const publicPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes for auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Read session (read-only in middleware -- cannot save/destroy)
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // API key gate: authenticated users without an API key are redirected to settings
  // Exempt: /settings (to avoid redirect loop), /api/settings/ (so the key can be saved)
  if (
    !session.hasApiKey &&
    !pathname.startsWith('/settings') &&
    !pathname.startsWith('/api/settings/')
  ) {
    return NextResponse.redirect(new URL('/settings?setup=api-key', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
