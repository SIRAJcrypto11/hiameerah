# Vercel Deployment Guide

## ✅ Status

Proyek ini sudah siap untuk di-deploy ke Vercel!

## 🚀 Quick Deploy

### 1. Import Project ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub account
3. Klik "Add New..." → "Project"
4. Pilih repository: `SIRAJcrypto11/hiameerah`
5. Klik "Import"

### 2. Configure Project

Vercel akan auto-detect Next.js. Pastikan settings berikut:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install` (auto-detected)

### 3. Add Environment Variables

Klik "Environment Variables" dan tambahkan:

#### Database (Required)

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Recommended Database Options:**

- **Vercel Postgres** (Easiest): Klik "Add" → "Storage" → "Postgres"
- **Supabase** (Free): https://supabase.com
- **Neon** (Free): https://neon.tech
- **Railway**: https://railway.app

#### NextAuth (Required)

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

Generate secret:

```bash
openssl rand -base64 32
```

#### Midtrans Payment (Optional - untuk production)

```
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false
```

#### Email Service (Optional)

```
EMAIL_FROM=noreply@hiameerah.com
SENDGRID_API_KEY=your-sendgrid-key
```

atau

```
RESEND_API_KEY=your-resend-key
```

#### File Storage (Optional)

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=hiameerah-images
AWS_REGION=ap-southeast-1
```

#### Analytics (Optional)

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=your-sentry-dsn
```

### 4. Deploy!

Klik "Deploy" dan tunggu beberapa menit.

## 📊 After Deployment

### Setup Database

Setelah deploy berhasil, setup database production:

```bash
# Set DATABASE_URL ke production
export DATABASE_URL="your-production-database-url"

# Run migrations
pnpm prisma migrate deploy

# (Optional) Seed initial data
pnpm prisma:seed
```

### Verify Deployment

1. Buka URL deployment Anda
2. Pastikan homepage load dengan baik
3. Check browser console untuk errors

## 🔄 Automatic Deployments

Setiap push ke branch `main` akan otomatis trigger deployment baru di Vercel!

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Vercel akan otomatis deploy!
```

## 🐛 Troubleshooting

### Build Failed

**Error: "Cannot find module '@prisma/client'"**

- Solution: Sudah fixed dengan `prisma generate` di build script

**Error: "Database connection failed"**

- Solution: Pastikan DATABASE_URL sudah dikonfigurasi di Vercel

**Error: "ESLint warnings"**

- Solution: Sudah fixed dengan ESLint config update

### Runtime Errors

**Error: "Prisma Client not initialized"**

- Solution: Run `pnpm prisma generate` locally dan push

**Error: "Environment variable not found"**

- Solution: Tambahkan environment variable di Vercel dashboard

## 📝 Environment Variables Checklist

### Minimum Required (untuk basic deployment)

- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `NEXTAUTH_URL` - Your Vercel URL
- [x] `NEXTAUTH_SECRET` - Random secret key

### Recommended (untuk full functionality)

- [ ] `MIDTRANS_SERVER_KEY` - Payment gateway
- [ ] `MIDTRANS_CLIENT_KEY` - Payment gateway
- [ ] `SENDGRID_API_KEY` atau `RESEND_API_KEY` - Email service
- [ ] `AWS_ACCESS_KEY_ID` - File storage
- [ ] `AWS_SECRET_ACCESS_KEY` - File storage
- [ ] `AWS_S3_BUCKET` - File storage

### Optional (untuk analytics)

- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics
- [ ] `SENTRY_DSN` - Error tracking

## 🎯 Next Steps

1. ✅ Deploy ke Vercel
2. ✅ Setup database production
3. ✅ Configure environment variables
4. ⏭️ Setup custom domain (optional)
5. ⏭️ Configure email service
6. ⏭️ Setup payment gateway
7. ⏭️ Add monitoring & analytics

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## 🆘 Need Help?

- Vercel Support: https://vercel.com/support
- Next.js Discord: https://nextjs.org/discord
- Prisma Discord: https://pris.ly/discord

---

**Status**: ✅ Ready for deployment!  
**Last Updated**: 2025-01-XX
