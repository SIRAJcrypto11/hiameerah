# Task 3.1 Completion: User Authentication API Routes

## Implementation Summary

Task 3.1 has been successfully implemented. The following authentication API routes have been created with password hashing and JWT token generation:

### Files Created

1. **`lib/auth.ts`** - Authentication utility functions
   - `hashPassword()` - Hash passwords using bcrypt with 10 salt rounds
   - `comparePassword()` - Compare plain text password with hashed password
   - `generateToken()` - Generate JWT tokens with 7-day expiration
   - `verifyToken()` - Verify and decode JWT tokens
   - `isValidEmail()` - Validate email format
   - `validatePassword()` - Validate password strength (min 8 chars, uppercase, lowercase, number)

2. **`app/api/auth/register/route.ts`** - Registration endpoint
   - POST `/api/auth/register`
   - Validates email format and password strength
   - Checks for existing users
   - Hashes password using bcrypt
   - Creates new user in database
   - Returns JWT token and user data (excluding password)

3. **`app/api/auth/login/route.ts`** - Login endpoint
   - POST `/api/auth/login`
   - Validates email format
   - Verifies user credentials
   - Compares password using bcrypt
   - Returns JWT token and user data (excluding password)

4. **`app/api/auth/logout/route.ts`** - Logout endpoint
   - POST `/api/auth/logout`
   - Returns success response (JWT logout is client-side)
   - Can be extended for token blacklisting if needed

### Test Files Created

1. **`app/api/auth/__tests__/register.test.ts`** - Registration endpoint tests (8 tests)
2. **`app/api/auth/__tests__/login.test.ts`** - Login endpoint tests (7 tests)
3. **`app/api/auth/__tests__/logout.test.ts`** - Logout endpoint tests (2 tests)
4. **`lib/__tests__/auth.test.ts`** - Auth utility function tests (15 tests)

**Total: 32 unit tests**

### Dependencies Installed

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation and verification
- `@types/jsonwebtoken` - TypeScript types for jsonwebtoken

### Environment Variables

Added to `.env.example`:

```
JWT_SECRET="your-jwt-secret-key-change-in-production"
```

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "Password123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**

- 400: Missing required fields, invalid email, weak password
- 409: User already exists
- 500: Server error

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CUSTOMER"
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**

- 400: Missing required fields, invalid email
- 401: Invalid credentials
- 500: Server error

### 3. Logout User

**Endpoint:** `POST /api/auth/logout`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure token generation with 7-day expiration
3. **Input Validation**: Email format and password strength validation
4. **No Password Exposure**: Passwords are never returned in API responses
5. **Consistent Error Messages**: Generic error messages for authentication failures to prevent user enumeration

## Running Tests

### Prerequisites

1. Ensure PostgreSQL database is running:

   ```bash
   # Check if database is accessible
   pnpm db:test
   ```

2. If database is not running, start it:

   ```bash
   # Using Docker (if configured)
   docker-compose up -d postgres

   # Or start PostgreSQL service manually
   ```

### Run All Authentication Tests

```bash
# Run all tests
pnpm test

# Run specific test files
pnpm test -- app/api/auth/__tests__/register.test.ts --run
pnpm test -- app/api/auth/__tests__/login.test.ts --run
pnpm test -- app/api/auth/__tests__/logout.test.ts --run
pnpm test -- lib/__tests__/auth.test.ts --run
```

### Test Coverage

```bash
pnpm test:coverage
```

## Testing Without Database

The tests are currently configured to use the actual database connection. To run tests without a database:

1. The tests use mocked Prisma client for API route tests
2. Auth utility tests don't require database connection
3. Database connection errors in test output are from the vitest.setup.ts file attempting to connect

## Next Steps

1. **Task 3.2**: Create authentication middleware for JWT verification and role-based access control
2. **Task 3.3**: Additional integration tests for authentication flow

## Notes

- JWT tokens are stateless and stored client-side (localStorage/cookies)
- Logout is primarily handled client-side by removing the token
- The logout endpoint can be extended to implement token blacklisting using Redis if needed
- All passwords are hashed before storage - never stored in plain text
- User role defaults to 'CUSTOMER' on registration
- Admin users must be created manually or through a separate admin creation endpoint

## Requirements Satisfied

✅ **Requirement 25.1**: Admin Panel authentication requiring username and password

- Registration endpoint with password hashing
- Login endpoint with JWT token generation
- Logout endpoint
- Password validation (min 8 chars, uppercase, lowercase, number)
- Email validation
- Secure token generation and verification
