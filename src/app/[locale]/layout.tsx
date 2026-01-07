import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { Header, Footer, MobileNav } from '@/components/layout';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'siteTitle' });
  const tDesc = await getTranslations({ locale, namespace: 'siteDescription' });

  return {
    title: {
      default: locale === 'ms' ? 'Keracunan Makanan - Panduan Keselamatan' : 'Food Poisoning - Safety Guide',
      template: '%s | Keracunan Makanan',
    },
    description: locale === 'ms' 
      ? 'Panduan lengkap keselamatan makanan daripada Kementerian Kesihatan Malaysia'
      : 'Complete food safety guide from the Ministry of Health Malaysia',
    keywords: ['keracunan makanan', 'food poisoning', 'keselamatan makanan', 'food safety', 'KKM', 'Malaysia'],
    authors: [{ name: 'Ministry of Health Malaysia' }],
    openGraph: {
      type: 'website',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
      siteName: 'Keracunan Makanan',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as 'ms' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1 pt-20 pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
