import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';

/**
 * Example admin-only route
 * This demonstrates how to use role-based access control for admin routes
 */
export async function GET(request: NextRequest) {
  // Check admin authentication
  const { error, user } = requireAdmin(request);

  // If there's an error (not authenticated or not admin), return it immediately
  if (error) {
    return error;
  }

  // User is authenticated as admin, proceed with the request
  return NextResponse.json(
    {
      success: true,
      message: 'Admin access granted',
      user: {
        userId: user!.userId,
        email: user!.email,
        role: user!.role,
      },
    },
    { status: 200 }
  );
}
