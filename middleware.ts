import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Extract JWT token from Authorization header or cookie
 * Duplicated here (not imported from lib/middleware) because Next.js Edge
 * middleware runs in the Edge runtime and must avoid Node.js-only imports.
 */
function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    return authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }

  // 2. Cookie fallback
  return request.cookies.get('auth-token')?.value ?? null;
}

/**
 * Route protection configuration
 *
 * - /api/admin/*        → ADMIN role required
 * - /api/orders/*       → authenticated (CUSTOMER or ADMIN)
 * - /api/cart/*         → authenticated (CUSTOMER or ADMIN)
 * - /api/wishlist/*     → authenticated (CUSTOMER or ADMIN)
 * - /api/auth/*         → public
 * - /api/products/*     → public
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes – no auth needed ──────────────────────────────────────
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/products/')) {
    return NextResponse.next();
  }

  // ── Admin routes – ADMIN role required ──────────────────────────────────
  if (pathname.startsWith('/api/admin/')) {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Forward user info to the route handler via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Protected routes – any authenticated user ────────────────────────────
  if (
    pathname.startsWith('/api/orders/') ||
    pathname.startsWith('/api/cart/') ||
    pathname.startsWith('/api/wishlist/')
  ) {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Forward user info to the route handler via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // All other routes pass through
  return NextResponse.next();
}

/**
 * Matcher configuration – only run middleware on API routes.
 * Static files, _next internals, and page routes are excluded.
 */
export const config = {
  matcher: ['/api/:path*'],
};
