import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

/**
 * Extended NextRequest with authenticated user data
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Authentication middleware result
 */
export interface AuthMiddlewareResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
  status?: number;
}

/**
 * Extract JWT token from Authorization header or cookie
 * @param request - Next.js request object
 * @returns Token string or null if not found
 */
export function extractToken(request: NextRequest): string | null {
  // 1. Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    // Return the header value as-is if not in Bearer format
    return authHeader;
  }

  // 2. Try NextRequest cookies API
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 3. Fall back to manually parsing the cookie header
  // (handles environments where NextRequest.cookies may not be populated)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Verify JWT token and return user data
 * @param request - Next.js request object
 * @returns Authentication result with user data or error
 */
export function authenticateRequest(request: NextRequest): AuthMiddlewareResult {
  const token = extractToken(request);

  if (!token) {
    return {
      success: false,
      error: 'Authentication token is required',
      status: 401,
    };
  }

  const user = verifyToken(token);

  if (!user) {
    return {
      success: false,
      error: 'Invalid or expired token',
      status: 401,
    };
  }

  return {
    success: true,
    user,
  };
}

/**
 * Middleware to verify JWT token
 * Returns 401 if token is missing or invalid
 * @param request - Next.js request object
 * @returns NextResponse with error or null if authenticated
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const authResult = authenticateRequest(request);

  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: authResult.error,
      },
      { status: authResult.status || 401 }
    );
  }

  return null;
}

/**
 * Middleware to verify user has required role
 * Returns 403 if user doesn't have the required role
 * @param request - Next.js request object
 * @param allowedRoles - Array of allowed roles
 * @returns NextResponse with error or user data if authorized
 */
export function requireRole(
  request: NextRequest,
  allowedRoles: Array<'CUSTOMER' | 'ADMIN'>
): { error: NextResponse | null; user: JWTPayload | null } {
  const authResult = authenticateRequest(request);

  if (!authResult.success) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.status || 401 }
      ),
      user: null,
    };
  }

  const user = authResult.user!;

  if (!allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: 403 }
      ),
      user: null,
    };
  }

  return {
    error: null,
    user,
  };
}

/**
 * Middleware to require ADMIN role
 * Convenience wrapper around requireRole for admin-only routes
 * @param request - Next.js request object
 * @returns NextResponse with error or user data if authorized
 */
export function requireAdmin(request: NextRequest): {
  error: NextResponse | null;
  user: JWTPayload | null;
} {
  return requireRole(request, ['ADMIN']);
}

/**
 * Middleware to require CUSTOMER role
 * Convenience wrapper around requireRole for customer-only routes
 * @param request - Next.js request object
 * @returns NextResponse with error or user data if authorized
 */
export function requireCustomer(request: NextRequest): {
  error: NextResponse | null;
  user: JWTPayload | null;
} {
  return requireRole(request, ['CUSTOMER']);
}

/**
 * Middleware to allow both CUSTOMER and ADMIN roles
 * @param request - Next.js request object
 * @returns NextResponse with error or user data if authorized
 */
export function requireAuthenticated(request: NextRequest): {
  error: NextResponse | null;
  user: JWTPayload | null;
} {
  return requireRole(request, ['CUSTOMER', 'ADMIN']);
}
