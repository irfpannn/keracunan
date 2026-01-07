import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ShieldCheck, Bug, Utensils, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

export default function LearnPage() {
  const t = useTranslations();
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const learnItems = [
    {
      icon: ShieldCheck,
      title: locale === 'ms' ? '5 Kunci Keselamatan Makanan' : '5 Keys to Food Safety',
      description: locale === 'ms' ? 'Langkah penting untuk memastikan makanan anda selamat' : 'Essential steps to keep your food safe',
      href: `${localePath}/belajar/5-kunci`,
    },
    {
      icon: Bug,
      title: locale === 'ms' ? 'Kenali Bakteria' : 'Meet the Bacteria',
      description: locale === 'ms' ? 'Ketahui musuh tersembunyi dalam makanan anda' : 'Know the hidden enemies in your food',
      href: `${localePath}/belajar/bakteria`,
    },
    {
      icon: Utensils,
      title: locale === 'ms' ? 'Makanan Berisiko Tinggi' : 'High-Risk Foods',
      description: locale === 'ms' ? 'Makanan yang memerlukan pengendalian khas' : 'Foods that require special handling',
      href: `${localePath}/belajar/makanan-berisiko`,
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{t('nav.learn')}</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {locale === 'ms'
              ? 'Pelajari tentang keselamatan makanan dan cara mencegah keracunan makanan'
              : 'Learn about food safety and how to prevent food poisoning'}
          </p>
        </div>

        <div className="space-y-3">
          {learnItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
