import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  Stethoscope, 
  ShieldCheck, 
  Refrigerator, 
  Eye, 
  ArrowRight,
  AlertTriangle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const features = [
    {
      icon: Stethoscope,
      title: t('features.symptomChecker.title'),
      description: t('features.symptomChecker.description'),
      href: `${localePath}/bantuan/gejala`,
      variant: 'destructive' as const,
    },
    {
      icon: ShieldCheck,
      title: t('features.fiveKeys.title'),
      description: t('features.fiveKeys.description'),
      href: `${localePath}/belajar/5-kunci`,
      variant: 'default' as const,
    },
    {
      icon: Refrigerator,
      title: t('features.fridgeGame.title'),
      description: t('features.fridgeGame.description'),
      href: `${localePath}/interaktif/susun-peti-sejuk`,
      variant: 'secondary' as const,
    },
    {
      icon: Eye,
      title: t('features.foodInspector.title'),
      description: t('features.foodInspector.description'),
      href: `${localePath}/interaktif/lihat-hidu-rasa`,
      variant: 'outline' as const,
    },
    {
      icon: MapPin,
      title: t('features.bessLocator.title'),
      description: t('features.bessLocator.description'),
      href: `${localePath}/bantuan/bess`,
      variant: 'default' as const,
    },
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent to-background py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {locale === 'ms' ? 'Panduan Berdasarkan KKM' : 'KKM Based Guide'}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" asChild>
                <Link href={`${localePath}/bantuan/gejala`}>
                  {t('hero.cta.checkSymptoms')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`${localePath}/belajar`}>
                  {t('hero.cta.learnMore')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              {locale === 'ms' ? 'Apa Yang Anda Boleh Belajar?' : 'What Can You Learn?'}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {locale === 'ms' 
                ? 'Pelajari cara menjaga keselamatan makanan melalui aktiviti interaktif.'
                : 'Learn how to maintain food safety through interactive activities.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-6 bg-destructive text-destructive-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">
                  {locale === 'ms' ? 'Gejala Teruk?' : 'Severe Symptoms?'}
                </h3>
                <p className="text-sm opacity-90">
                  {locale === 'ms' ? 'Jangan tunggu - dapatkan bantuan segera!' : "Don't wait - get help immediately!"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">999</div>
                <div className="text-xs opacity-90">{locale === 'ms' ? 'Kecemasan' : 'Emergency'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Keys Preview */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">{t('fiveKeys.title')}</h2>
              <p className="text-muted-foreground">{t('fiveKeys.subtitle')}</p>
            </div>

            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {['clean', 'separate', 'cook', 'temperature', 'safe'].map((key, index) => (
                <Card key={key} className="p-3 text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-2">
                    {index + 1}
                  </div>
                  <p className="text-[10px] md:text-xs font-medium leading-tight">
                    {t(`fiveKeys.keys.${key}.title`)}
                  </p>
                </Card>
              ))}
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href={`${localePath}/belajar/5-kunci`}>
                {t('common.learnMore')}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
