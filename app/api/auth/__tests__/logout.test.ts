import { describe, it, expect } from 'vitest';
import { POST } from '../logout/route';

describe('POST /api/auth/logout', () => {
  it('should return success response', async () => {
    const request = new Request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logout successful');
  });

  it('should handle logout for any user', async () => {
    // Since logout is stateless with JWT, it should always succeed
    const request = new Request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer some-token',
      },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
