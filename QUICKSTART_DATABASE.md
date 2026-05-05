# Quick Start: Database Setup

This is a quick guide to get your database up and running in under 5 minutes.

## Option 1: Using Docker (Recommended)

### Prerequisites

- Docker and Docker Compose installed

### Steps

1. **Start the database**

   ```bash
   docker-compose up -d
   ```

2. **Update your .env file**

   The `.env` file is already created. Update the DATABASE_URL:

   ```env
   DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
   ```

3. **Verify connection**

   ```bash
   pnpm prisma:generate
   ```

4. **You're done!** 🎉

### Useful Docker Commands

```bash
# Stop the database
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart the database
docker-compose restart postgres

# Remove everything (including data)
docker-compose down -v
```

## Option 2: Local PostgreSQL

### Prerequisites

- PostgreSQL 15+ installed

### Steps

1. **Create database and user**

   ```bash
   psql -U postgres
   ```

   Then run:

   ```sql
   CREATE DATABASE hiameerah;
   CREATE USER hiameerah_user WITH ENCRYPTED PASSWORD 'hiameerah_password';
   GRANT ALL PRIVILEGES ON DATABASE hiameerah TO hiameerah_user;
   \q
   ```

2. **Update your .env file**

   ```env
   DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
   ```

3. **Verify connection**

   ```bash
   pnpm prisma:generate
   ```

4. **You're done!** 🎉

## Option 3: Cloud Database (Vercel Postgres, Supabase, etc.)

1. **Create a database** on your preferred cloud provider

2. **Copy the connection string** provided by the service

3. **Update your .env file**

   ```env
   DATABASE_URL="your-connection-string-here"
   ```

   Note: Most cloud providers require SSL:

   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

4. **Verify connection**

   ```bash
   pnpm prisma:generate
   ```

5. **You're done!** 🎉

## Next Steps

After setting up the database:

1. **Task 2.2**: Implement the complete Prisma schema
2. **Task 2.3**: Run database migrations
3. **Task 2.4**: Write tests for database models

## Troubleshooting

### "Connection refused"

- **Docker**: Run `docker-compose ps` to check if the container is running
- **Local**: Run `pg_isready` to check if PostgreSQL is running

### "Authentication failed"

- Double-check the username and password in your DATABASE_URL
- Ensure they match what you set during database creation

### "Port 5432 already in use"

- Another PostgreSQL instance might be running
- Stop it or change the port in docker-compose.yml

### Need more help?

See the detailed [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide.

## Prisma Commands Reference

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create a migration
pnpm prisma:migrate

# Push schema without migration (dev only)
pnpm prisma:push

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Seed the database
pnpm prisma:seed
```

## Environment Variables

Your `.env` file contains all necessary environment variables. Key ones for database:

- `DATABASE_URL`: PostgreSQL connection string (required)
- `REDIS_URL`: Redis connection string (optional, for caching)

**Important**: Never commit your `.env` file to version control!
