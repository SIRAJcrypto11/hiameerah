import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  extractToken,
  authenticateRequest,
  requireAuth,
  requireRole,
  requireAdmin,
  requireCustomer,
  requireAuthenticated,
} from '../middleware';
import * as auth from '../auth';

// Mock the auth module
vi.mock('../auth', () => ({
  verifyToken: vi.fn(),
}));

// Mock Prisma to prevent the global afterEach cleanup from failing
// (middleware tests don't use the database)
vi.mock('../prisma', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
    orderItem: { deleteMany: vi.fn() },
    payment: { deleteMany: vi.fn() },
    order: { deleteMany: vi.fn() },
    cartItem: { deleteMany: vi.fn() },
    wishlistItem: { deleteMany: vi.fn() },
    review: { deleteMany: vi.fn() },
    productVariant: { deleteMany: vi.fn() },
    productImage: { deleteMany: vi.fn() },
    product: { deleteMany: vi.fn() },
    address: { deleteMany: vi.fn() },
    user: { deleteMany: vi.fn() },
    collection: { deleteMany: vi.fn() },
    category: { deleteMany: vi.fn() },
    heroBanner: { deleteMany: vi.fn() },
    blogPost: { deleteMany: vi.fn() },
  },
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractToken', () => {
    it('should extract token from Bearer authorization header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer test-token-123',
        },
      });

      const token = extractToken(request);
      expect(token).toBe('test-token-123');
    });

    it('should return token as-is if not in Bearer format', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'test-token-123',
        },
      });

      const token = extractToken(request);
      expect(token).toBe('test-token-123');
    });

    it('should return null if authorization header is missing and no cookie', () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const token = extractToken(request);
      expect(token).toBeNull();
    });

    it('should extract token from auth-token cookie when no Authorization header', () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      // Mock the cookies API since happy-dom (browser environment) strips
      // the 'cookie' header as a forbidden header per the Fetch spec
      vi.spyOn(request.cookies, 'get').mockReturnValue({
        name: 'auth-token',
        value: 'cookie-token-456',
      });

      const token = extractToken(request);
      expect(token).toBe('cookie-token-456');
    });

    it('should prefer Authorization header over cookie', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer header-token',
        },
      });
      vi.spyOn(request.cookies, 'get').mockReturnValue({
        name: 'auth-token',
        value: 'cookie-token',
      });

      const token = extractToken(request);
      expect(token).toBe('header-token');
    });
  });

  describe('authenticateRequest', () => {
    it('should return success with user data for valid token', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const result = authenticateRequest(request);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('should return error if token is missing', () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const result = authenticateRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication token is required');
      expect(result.status).toBe(401);
    });

    it('should return error if token is invalid', () => {
      vi.mocked(auth.verifyToken).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const result = authenticateRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
      expect(result.status).toBe(401);
    });
  });

  describe('requireAuth', () => {
    it('should return null for valid authentication', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const response = requireAuth(request);

      expect(response).toBeNull();
    });

    it('should return 401 response for missing token', () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const response = requireAuth(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 response for invalid token', () => {
      vi.mocked(auth.verifyToken).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const response = requireAuth(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with correct role', () => {
      const mockUser = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      const result = requireRole(request, ['ADMIN']);

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should deny access for user with incorrect role', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer user-token',
        },
      });

      const result = requireRole(request, ['ADMIN']);

      expect(result.error).not.toBeNull();
      expect(result.error?.status).toBe(403);
      expect(result.user).toBeNull();
    });

    it('should allow access for multiple allowed roles', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer user-token',
        },
      });

      const result = requireRole(request, ['CUSTOMER', 'ADMIN']);

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should return 401 for missing token', () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const result = requireRole(request, ['ADMIN']);

      expect(result.error).not.toBeNull();
      expect(result.error?.status).toBe(401);
      expect(result.user).toBeNull();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', () => {
      const mockUser = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      const result = requireAdmin(request);

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should deny access for customer user', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer user-token',
        },
      });

      const result = requireAdmin(request);

      expect(result.error).not.toBeNull();
      expect(result.error?.status).toBe(403);
      expect(result.user).toBeNull();
    });
  });

  describe('requireCustomer', () => {
    it('should allow access for customer user', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/customer/test', {
        headers: {
          authorization: 'Bearer user-token',
        },
      });

      const result = requireCustomer(request);

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should deny access for admin user', () => {
      const mockUser = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/customer/test', {
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      const result = requireCustomer(request);

      expect(result.error).not.toBeNull();
      expect(result.error?.status).toBe(403);
      expect(result.user).toBeNull();
    });
  });

  describe('requireAuthenticated', () => {
    it('should allow access for customer user', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer user-token',
        },
      });

      const result = requireAuthenticated(request);

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should allow access for admin user', () => {
      const mockUser = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
      };

      vi.mocked(auth.verifyToken).mockReturnValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      const result = requireAuthenticated(request);

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should deny access for unauthenticated user', () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const result = requireAuthenticated(request);

      expect(result.error).not.toBeNull();
      expect(result.error?.status).toBe(401);
      expect(result.user).toBeNull();
    });
  });
});
