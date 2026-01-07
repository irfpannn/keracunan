import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Refrigerator, Eye, Brain, Gamepad2, ArrowRight } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

export default function InteractivePage() {
  const t = useTranslations();
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const games = [
    {
      icon: Refrigerator,
      title: t('features.fridgeGame.title'),
      description: t('features.fridgeGame.description'),
      href: `${localePath}/interaktif/susun-peti-sejuk`,
      badge: locale === 'ms' ? 'Permainan' : 'Game',
    },
    {
      icon: Eye,
      title: t('features.foodInspector.title'),
      description: t('features.foodInspector.description'),
      href: `${localePath}/interaktif/lihat-hidu-rasa`,
      badge: locale === 'ms' ? 'Permainan' : 'Game',
    },
    {
      icon: Brain,
      title: locale === 'ms' ? 'Kuiz Keselamatan Makanan' : 'Food Safety Quiz',
      description: locale === 'ms' ? 'Uji pengetahuan anda tentang keselamatan makanan' : 'Test your knowledge about food safety',
      href: `${localePath}/interaktif/kuiz`,
      badge: locale === 'ms' ? 'Kuiz' : 'Quiz',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <Gamepad2 className="w-3 h-3 mr-1" />
            {locale === 'ms' ? 'Belajar Sambil Bermain' : 'Learn While Playing'}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold">{t('nav.interactive')}</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {locale === 'ms'
              ? 'Pelajari keselamatan makanan melalui permainan dan aktiviti interaktif'
              : 'Learn food safety through games and interactive activities'}
          </p>
        </div>

        <div className="space-y-3">
          {games.map((game, index) => (
            <Link key={index} href={game.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <game.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold">{game.title}</h3>
                      <Badge variant="outline" className="text-[10px]">{game.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{game.description}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <ArrowRight className="w-5 h-5 text-accent-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
