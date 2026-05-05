import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hiameerah - Hijab & Modest Fashion Indonesia',
  description:
    'Brand hijab dan modest fashion Indonesia yang terinspirasi dari keindahan dan budaya Indonesia. Lahir 25 Desember 2019.',
  keywords: ['hijab', 'modest fashion', 'fashion indonesia', 'hijab indonesia', 'busana muslim'],
  authors: [{ name: 'Hiameerah' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://hiameerah.com',
    siteName: 'Hiameerah',
    title: 'Hiameerah - Hijab & Modest Fashion Indonesia',
    description:
      'Brand hijab dan modest fashion Indonesia yang terinspirasi dari keindahan dan budaya Indonesia.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
