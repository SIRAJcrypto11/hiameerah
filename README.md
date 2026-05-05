# Hiameerah E-Commerce Website

Brand hijab dan modest fashion Indonesia yang terinspirasi dari keindahan dan budaya Indonesia. Lahir 25 Desember 2019.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Database**: PostgreSQL + Prisma ORM
- **Payment**: Midtrans
- **Email**: SendGrid/Resend
- **Storage**: AWS S3 / Cloudflare R2
- **Deployment**: Vercel

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components (Atomic Design)
│   ├── atoms/            # Basic building blocks
│   ├── molecules/        # Simple combinations
│   ├── organisms/        # Complex components
│   ├── templates/        # Page layouts
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript types
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🎨 Design System

### Brand Colors

- **Primary**: Soft pink palette (#e36080)
- **Secondary**: Cream/beige tones (#ba9179)
- **Accent**: Lavender and mint green
- **Neutral**: Cream backgrounds

### Typography

- **Display**: Playfair Display (headings)
- **Body**: Inter (content)

### Design Principles

1. **Soft & Feminine**: Rounded corners, gentle shadows, pastel colors
2. **Indonesian Heritage**: Subtle cultural elements, rafflesia inspiration
3. **Generous Spacing**: Minimum 24px between sections
4. **Smooth Animations**: 200-400ms transitions, 60fps performance

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 9+
- PostgreSQL 15+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file with database and API keys

5. Run database migrations:

```bash
pnpm prisma migrate dev
```

6. Start development server:

```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## 🧪 Testing

Testing framework will be added in subsequent tasks.

## 📦 Deployment

The application is optimized for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## 🎯 Key Features

- ✅ Interactive product catalog with hover effects
- ✅ Hero slideshow with smooth transitions
- ✅ Advanced filtering and sorting
- ✅ Quick view modal
- ✅ Shopping cart with persistent storage
- ✅ Wishlist functionality
- ✅ Product search with autocomplete
- ✅ Responsive design (mobile-first)
- ✅ SEO optimized
- ✅ Accessibility compliant (WCAG 2.1 AA)
- ✅ Performance optimized (Lighthouse 85+)
- ✅ Integrated payment gateway (Midtrans)
- ✅ Admin panel for content management

## 📄 License

Private - All rights reserved by Hiameerah

## 🤝 Contributing

This is a private project. For internal development only.

---

Built with ❤️ for Hiameerah
