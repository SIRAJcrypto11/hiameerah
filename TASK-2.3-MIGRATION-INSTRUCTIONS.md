# Task 2.3: Database Migration Instructions

## Status: Ready to Execute (Database Required)

This document provides instructions for creating and running the initial database migration for the Hiameerah e-commerce website.

## Prerequisites

Before running the migration, ensure:

1. **PostgreSQL database is running** - Choose one of these options:
   - **Docker (Recommended)**: Start Docker Desktop, then run `docker-compose up -d postgres`
   - **Local PostgreSQL**: Ensure PostgreSQL service is running
   - **Cloud Database**: Have your connection string ready

2. **Database credentials are configured** - The `.env` file has been updated with the correct credentials:
   ```
   DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
   ```

## Migration Commands

### Step 1: Start the Database (if using Docker)

```bash
# Start Docker Desktop first, then run:
docker-compose up -d postgres

# Verify the database is running:
docker ps
```

### Step 2: Generate and Run the Migration

```bash
# This command will:
# 1. Read the Prisma schema from prisma/schema.prisma
# 2. Generate SQL migration files in prisma/migrations/
# 3. Apply the migration to create all database tables
# 4. Generate the Prisma Client

pnpm prisma migrate dev --name initial_schema
```

### Step 3: Verify the Migration

```bash
# Open Prisma Studio to view the database tables:
pnpm prisma:studio

# Or test the database connection:
pnpm db:test
```

## What This Migration Creates

The initial migration will create the following database tables:

### Product Tables

- `Product` - Main product information
- `ProductImage` - Product images with ordering
- `ProductVariant` - Size/color variants with stock
- `Category` - Product categories (Hijab, Busana, Aksesoris)
- `Collection` - Product collections (themes)

### User Tables

- `User` - User accounts with authentication
- `Address` - User shipping addresses

### Shopping Tables

- `CartItem` - Shopping cart items
- `WishlistItem` - Wishlist items

### Order Tables

- `Order` - Customer orders
- `OrderItem` - Order line items
- `Payment` - Payment transactions

### Content Tables

- `HeroBanner` - Homepage slideshow banners
- `BlogPost` - Blog articles
- `Review` - Product reviews

### Enums

- `UserRole` - CUSTOMER, ADMIN
- `OrderStatus` - PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- `PaymentStatus` - PENDING, PAID, FAILED, REFUNDED

## Database Schema Features

The schema includes:

✅ **Relationships**: Proper foreign keys and cascading deletes
✅ **Indexes**: Optimized for common queries (slug, email, orderNumber, etc.)
✅ **Constraints**: Unique constraints for data integrity
✅ **Defaults**: Sensible default values (timestamps, booleans, etc.)
✅ **Data Types**: Appropriate types (Decimal for prices, Text for long content)

## Troubleshooting

### Error: Can't reach database server

**Problem**: PostgreSQL is not running or connection details are incorrect.

**Solutions**:

1. Start Docker: `docker-compose up -d postgres`
2. Check Docker status: `docker ps`
3. Verify DATABASE_URL in `.env` matches your setup
4. For local PostgreSQL, ensure the service is running

### Error: Database does not exist

**Problem**: The database hasn't been created yet.

**Solutions**:

1. For Docker: The database is created automatically
2. For local PostgreSQL:
   ```bash
   psql -U postgres
   CREATE DATABASE hiameerah;
   CREATE USER hiameerah_user WITH ENCRYPTED PASSWORD 'hiameerah_password';
   GRANT ALL PRIVILEGES ON DATABASE hiameerah TO hiameerah_user;
   \q
   ```

### Error: Authentication failed

**Problem**: Username or password is incorrect.

**Solutions**:

1. Check DATABASE_URL in `.env`
2. Verify credentials match your PostgreSQL setup
3. For Docker, use: `hiameerah_user` / `hiameerah_password`

## Alternative: Push Schema Without Migration

If you want to quickly sync the schema without creating migration files (development only):

```bash
pnpm prisma:push
```

⚠️ **Warning**: This bypasses migration history and should only be used in development.

## Next Steps

After successfully running the migration:

1. ✅ Task 2.1: Configure PostgreSQL database connection (Completed)
2. ✅ Task 2.2: Implement Prisma schema (Completed)
3. ✅ Task 2.3: Create database migrations (Ready to execute)
4. ⏭️ Task 2.4: Write unit tests for database models (Next)

## Migration Files Location

Once you run the migration command, the migration files will be created in:

```
prisma/migrations/
└── [timestamp]_initial_schema/
    └── migration.sql
```

This SQL file contains all the CREATE TABLE statements and will be version-controlled in Git.

## Verification Checklist

After running the migration, verify:

- [ ] All tables are created in the database
- [ ] Prisma Client is generated successfully
- [ ] No errors in the migration output
- [ ] Can connect to database using Prisma Studio
- [ ] Database test script runs successfully

## Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Ready to proceed?** Once your database is running, execute the migration command above.
