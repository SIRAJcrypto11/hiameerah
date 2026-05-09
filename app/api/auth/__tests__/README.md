# Authentication API Tests

## Overview

This directory contains unit tests for the authentication API endpoints.

## Test Files

- `register.test.ts` - Tests for user registration endpoint
- `login.test.ts` - Tests for user login endpoint
- `logout.test.ts` - Tests for user logout endpoint

## Running Tests

### Prerequisites

The tests require a running PostgreSQL database. Ensure your database is configured and running:

```bash
# Test database connection
pnpm db:test

# If using Docker
docker-compose up -d postgres
```

### Run Tests

```bash
# Run all authentication tests
pnpm test -- app/api/auth/__tests__

# Run specific test file
pnpm test -- app/api/auth/__tests__/register.test.ts --run
pnpm test -- app/api/auth/__tests__/login.test.ts --run
pnpm test -- app/api/auth/__tests__/logout.test.ts --run

# Run with coverage
pnpm test:coverage -- app/api/auth/__tests__/
```

## Manual Testing

You can also test the endpoints manually using curl or a tool like Postman:

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 3. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Test Coverage

The tests cover:

### Registration Tests

- ✅ Successful user registration
- ✅ Missing required fields validation
- ✅ Invalid email format validation
- ✅ Password too short validation
- ✅ Password missing uppercase letter validation
- ✅ Password missing lowercase letter validation
- ✅ Password missing number validation
- ✅ Duplicate user prevention

### Login Tests

- ✅ Successful login with valid credentials
- ✅ Missing email validation
- ✅ Missing password validation
- ✅ Invalid email format validation
- ✅ Non-existent user handling
- ✅ Incorrect password handling
- ✅ Password not exposed in response

### Logout Tests

- ✅ Successful logout response
- ✅ Logout works for any user (stateless)

## Troubleshooting

### Database Connection Errors

If you see Prisma connection errors:

1. Check if PostgreSQL is running:

   ```bash
   # Windows
   Get-Service postgresql*

   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `.env`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/hiameerah"
   ```

3. Test the connection:

   ```bash
   pnpm db:test
   ```

4. Run migrations if needed:
   ```bash
   pnpm prisma:migrate
   ```

### Mock Issues

The tests use vi.mock() to mock Prisma client. If mocks aren't working:

1. Clear vitest cache:

   ```bash
   pnpm vitest --clearCache
   ```

2. Ensure vitest.config.ts is properly configured

## Notes

- Tests use mocked Prisma client to avoid database dependencies
- Auth utility tests (lib/**tests**/auth.test.ts) don't require database
- JWT tokens expire after 7 days by default
- Passwords are hashed with bcrypt (10 salt rounds)
