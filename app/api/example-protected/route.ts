import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/middleware';

/**
 * Example protected route that requires authentication
 * This demonstrates how to use the authentication middleware
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const { error, user } = requireAuthenticated(request);

  // If there's an error, return it immediately
  if (error) {
    return error;
  }

  // User is authenticated, proceed with the request
  return NextResponse.json(
    {
      success: true,
      message: 'Access granted',
      user: {
        userId: user!.userId,
        email: user!.email,
        role: user!.role,
      },
    },
    { status: 200 }
  );
}
