# Database Architecture

## Overview

This document describes the database architecture for the Hiameerah e-commerce website.

## Connection Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Application Layer (API Routes)            │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         Prisma Client (lib/prisma.ts)           │ │ │
│  │  │                                                  │ │ │
│  │  │  • Singleton instance                           │ │ │
│  │  │  • Connection pooling                           │ │ │
│  │  │  • Environment-based logging                    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ DATABASE_URL
                            │ (from .env)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Database Instance                     │ │
│  │                                                        │ │
│  │  • PostgreSQL 15+                                     │ │
│  │  • Database: hiameerah                                │ │
│  │  • User: hiameerah_user                               │ │
│  │  • Port: 5432                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Persistent Storage Volume                 │ │
│  │                                                        │ │
│  │  • Tables (created via migrations)                    │ │
│  │  • Indexes                                            │ │
│  │  • Constraints                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Options

### Development (Docker)

```
┌──────────────────────┐
│   Developer Machine  │
│                      │
│  ┌────────────────┐  │
│  │  Next.js App   │  │
│  │  (localhost:   │  │
│  │   3000)        │  │
│  └────────┬───────┘  │
│           │          │
│  ┌────────▼───────┐  │
│  │  PostgreSQL    │  │
│  │  (Docker)      │  │
│  │  (localhost:   │  │
│  │   5432)        │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Production (Vercel + Cloud Database)

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Next.js Application (Serverless)          │ │
│  │                                                    │ │
│  │  • Edge Functions                                 │ │
│  │  • API Routes                                     │ │
│  │  • Server Components                              │ │
│  └────────────────────┬───────────────────────────────┘ │
└───────────────────────┼─────────────────────────────────┘
                        │
                        │ Secure Connection
                        │ (SSL/TLS)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Cloud Database Provider                     │
│         (Vercel Postgres / Supabase / AWS RDS)          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            Managed PostgreSQL Instance             │ │
│  │                                                    │ │
│  │  • Automatic backups                              │ │
│  │  • High availability                              │ │
│  │  • Automatic scaling                              │ │
│  │  • SSL/TLS encryption                             │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Connection Flow

### 1. Application Startup

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Development
  // log: ['error'],                // Production
});

// Singleton pattern prevents multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 2. Database Query

```typescript
// API Route Example
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
  });

  return Response.json(products);
}
```

### 3. Connection Pooling

Prisma automatically manages connection pooling:

- **Development**: 10 connections (default)
- **Production**: Configurable based on serverless limits
- **Connection timeout**: 10 seconds (default)
- **Pool timeout**: 10 seconds (default)

## Environment Configuration

### Development (.env)

```env
DATABASE_URL="postgresql://hiameerah_user:hiameerah_password@localhost:5432/hiameerah"
```

### Production (.env.production)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&connection_limit=10"
```

### Connection String Parameters

| Parameter          | Description               | Example                        |
| ------------------ | ------------------------- | ------------------------------ |
| `sslmode`          | SSL/TLS mode              | `require`, `prefer`, `disable` |
| `connection_limit` | Max connections           | `10` (serverless)              |
| `pool_timeout`     | Pool timeout (seconds)    | `10`                           |
| `connect_timeout`  | Connect timeout (seconds) | `10`                           |
| `schema`           | Database schema           | `public` (default)             |

## Security Layers

### 1. Network Security

```
┌─────────────────────────────────────────────────────────┐
│                    Firewall Rules                        │
│                                                          │
│  • Allow connections only from application servers      │
│  • Block direct public access                           │
│  • IP whitelisting for admin access                     │
└─────────────────────────────────────────────────────────┘
```

### 2. Authentication

```
┌─────────────────────────────────────────────────────────┐
│                Database Authentication                   │
│                                                          │
│  • Username/password authentication                     │
│  • Strong password requirements                         │
│  • Separate users for different environments            │
│  • Principle of least privilege                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Encryption

```
┌─────────────────────────────────────────────────────────┐
│                  Data Encryption                         │
│                                                          │
│  • SSL/TLS for data in transit                          │
│  • Encrypted storage for data at rest                   │
│  • Encrypted backups                                    │
└─────────────────────────────────────────────────────────┘
```

## Monitoring and Maintenance

### Health Checks

```typescript
// Health check endpoint
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

### Metrics to Monitor

1. **Connection Pool**
   - Active connections
   - Idle connections
   - Connection wait time

2. **Query Performance**
   - Query execution time
   - Slow queries (>1s)
   - Query errors

3. **Database Health**
   - CPU usage
   - Memory usage
   - Disk space
   - Connection count

## Backup Strategy

### Development

- Docker volume persistence
- Manual backups as needed

### Production

```
┌─────────────────────────────────────────────────────────┐
│                   Backup Schedule                        │
│                                                          │
│  • Automated daily backups                              │
│  • Point-in-time recovery (PITR)                        │
│  • 30-day retention period                              │
│  • Encrypted backup storage                             │
│  • Regular restore testing                              │
└─────────────────────────────────────────────────────────┘
```

## Scaling Considerations

### Vertical Scaling

- Increase database instance size
- More CPU and RAM
- Faster storage (SSD)

### Horizontal Scaling

- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Caching layer (Redis)

### Future Optimizations

1. **Caching Layer**

   ```
   Application → Redis Cache → PostgreSQL
   ```

2. **Read Replicas**

   ```
   Application → Primary DB (writes)
                ↓
                Read Replica 1 (reads)
                Read Replica 2 (reads)
   ```

3. **Connection Pooler**
   ```
   Application → PgBouncer → PostgreSQL
   ```

## Database Schema (Coming in Task 2.2)

The complete database schema will include:

- **Product Models**: Product, ProductImage, ProductVariant
- **Category Models**: Category, Collection
- **User Models**: User, Address
- **Order Models**: Order, OrderItem, Payment
- **Cart Models**: CartItem
- **Wishlist Models**: WishlistItem
- **Content Models**: HeroBanner, BlogPost, Review

See `design.md` for the complete schema specification.

## Resources

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [Next.js Database Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
