import { NextRequest, NextResponse } from 'next/server';

/**
 * Logout endpoint
 * Since we're using JWT tokens (stateless authentication), logout is handled client-side
 * by removing the token from storage. This endpoint exists for consistency and can be
 * extended in the future if we implement token blacklisting or session management.
 */
export async function POST(_request: NextRequest) {
  try {
    // In a JWT-based authentication system, logout is primarily handled on the client side
    // by removing the token from localStorage/cookies
    // This endpoint can be extended to:
    // 1. Blacklist the token (requires Redis or similar)
    // 2. Log the logout event
    // 3. Clear any server-side sessions if implemented

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
