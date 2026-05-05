# Quick Start: Database Migration

## TL;DR - Run This When Database is Ready

```bash
# 1. Start the database (choose one):
docker-compose up -d postgres          # Docker (recommended)
# OR ensure your local PostgreSQL is running

# 2. Run the migration (choose one):
pnpm prisma:migrate:initial           # Automated with checks (recommended)
# OR
pnpm prisma migrate dev --name initial_schema   # Direct Prisma command

# 3. Verify it worked:
pnpm prisma:studio                    # Open database GUI
```

## What This Does

Creates **15 database tables** for:

- Products, variants, and images
- Users and addresses
- Shopping cart and wishlist
- Orders and payments
- Content (banners, blog, reviews)

## If Something Goes Wrong

### Database won't connect?

```bash
# Check if Docker is running:
docker ps

# If not, start Docker Desktop, then:
docker-compose up -d postgres
```

### Wrong credentials?

Check `.env` file - should be:

```
DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
```

### Need more help?

- 📖 Read: `TASK-2.3-MIGRATION-INSTRUCTIONS.md` (detailed guide)
- 📖 Read: `DATABASE_SETUP.md` (database setup)
- 📖 Read: `TASK-2.3-COMPLETION.md` (what was done)

## After Migration Succeeds

✅ All database tables are created  
✅ Prisma Client is generated  
✅ Ready to start building features

**Next**: Task 2.4 - Write unit tests for database models

---

**Current Status**: Migration prepared, waiting for database to be available.
