# Database Setup Guide

This guide explains how to set up and configure the PostgreSQL database for the Hiameerah e-commerce website.

## Prerequisites

- PostgreSQL 15+ installed on your system
- Node.js 20+ and pnpm installed
- Basic knowledge of PostgreSQL and command line

## Installation Options

### Option 1: Local PostgreSQL Installation

#### macOS (using Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows

Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Option 2: Docker (Recommended for Development)

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: hiameerah-db
    restart: always
    environment:
      POSTGRES_USER: hiameerah_user
      POSTGRES_PASSWORD: hiameerah_password
      POSTGRES_DB: hiameerah
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start the database:

```bash
docker-compose up -d
```

### Option 3: Cloud Database (Production)

For production, consider using:

- **Vercel Postgres**: Integrated with Vercel hosting
- **Supabase**: Free tier available with PostgreSQL
- **Railway**: Easy PostgreSQL deployment
- **AWS RDS**: Enterprise-grade PostgreSQL
- **DigitalOcean Managed Databases**: Simple and affordable

## Database Configuration

### 1. Create Database and User (Local Installation)

Connect to PostgreSQL:

```bash
psql -U postgres
```

Create database and user:

```sql
CREATE DATABASE hiameerah;
CREATE USER hiameerah_user WITH ENCRYPTED PASSWORD 'hiameerah_password';
GRANT ALL PRIVILEGES ON DATABASE hiameerah TO hiameerah_user;
\q
```

### 2. Configure Environment Variables

The `.env` file has been created with the following database configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hiameerah"
```

**Update the DATABASE_URL** with your actual credentials:

For local installation:

```env
DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
```

For Docker:

```env
DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
```

For cloud services, use the connection string provided by your provider.

### 3. Connection String Format

The PostgreSQL connection string format is:

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

Example with SSL (required for most cloud providers):

```
postgresql://user:password@host:5432/database?sslmode=require
```

## Prisma Setup

### 1. Prisma Client

A Prisma client utility has been created at `lib/prisma.ts`. This file:

- Creates a singleton Prisma client instance
- Prevents connection exhaustion in development
- Configures logging based on environment
- Follows Next.js best practices

### 2. Available Prisma Commands

The following npm scripts are available:

```bash
# Generate Prisma Client (run after schema changes)
pnpm prisma:generate

# Create and apply migrations
pnpm prisma:migrate

# Push schema changes without migrations (development only)
pnpm prisma:push

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Seed the database with initial data
pnpm prisma:seed
```

### 3. Prisma Configuration Files

- `prisma/schema.prisma`: Database schema definition
- `prisma.config.ts`: Prisma configuration (datasource URL, migrations path)
- `lib/prisma.ts`: Prisma client singleton instance

## Next Steps

After completing this task (2.1), the next tasks are:

1. **Task 2.2**: Implement complete Prisma schema with all models
2. **Task 2.3**: Create and run database migrations
3. **Task 2.4**: Write unit tests for database models

## Verification

To verify the database connection is working:

1. Ensure PostgreSQL is running
2. Update `.env` with correct credentials
3. Run: `pnpm prisma:generate`
4. The command should complete without errors

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running: `pg_isready` (local) or `docker ps` (Docker)
- Check if port 5432 is available: `lsof -i :5432` (macOS/Linux)
- Verify credentials in `.env` file

### Authentication Failed

- Double-check username and password in DATABASE_URL
- Ensure user has proper permissions on the database

### SSL/TLS Errors (Cloud Databases)

- Add `?sslmode=require` to the connection string
- Some providers require additional SSL parameters

### Prisma Client Not Found

- Run `pnpm prisma:generate` to generate the client
- Ensure `@prisma/client` is installed: `pnpm add @prisma/client`

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - Especially for production databases
3. **Enable SSL/TLS** - Required for production databases
4. **Restrict database access** - Use firewall rules and IP whitelisting
5. **Regular backups** - Set up automated backups for production
6. **Monitor connections** - Watch for connection pool exhaustion
7. **Use environment-specific credentials** - Different credentials for dev/staging/production

## Database Schema

The complete database schema will be implemented in Task 2.2. It includes:

- Product models (Product, ProductImage, ProductVariant)
- Category and Collection models
- User and authentication models
- Order and payment models
- Cart and wishlist models
- Content models (HeroBanner, BlogPost, Review)

See `design.md` for the complete schema specification.

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js with Prisma](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
