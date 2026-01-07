import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Stethoscope, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

export default function HelpPage() {
  const t = useTranslations();
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const helpItems = [
    {
      icon: Stethoscope,
      title: locale === 'ms' ? 'Semak Gejala' : 'Symptom Checker',
      description: locale === 'ms' ? 'Jawab beberapa soalan untuk ketahui tindakan seterusnya' : 'Answer a few questions to know your next steps',
      href: `${localePath}/bantuan/gejala`,
    },
    {
      icon: MapPin,
      title: locale === 'ms' ? 'Cari Klinik' : 'Find Clinic',
      description: locale === 'ms' ? 'Cari klinik kesihatan kerajaan berhampiran anda' : 'Find government health clinics near you',
      href: `${localePath}/bantuan/klinik`,
    },
    {
      icon: Phone,
      title: locale === 'ms' ? 'Talian Kecemasan' : 'Emergency Hotline',
      description: locale === 'ms' ? 'Nombor penting untuk situasi kecemasan' : 'Important numbers for emergency situations',
      href: `${localePath}/bantuan/kecemasan`,
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{t('nav.help')}</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {locale === 'ms'
              ? 'Dapatkan bantuan dan panduan untuk menangani keracunan makanan'
              : 'Get help and guidance for dealing with food poisoning'}
          </p>
        </div>

        {/* Emergency Banner */}
        <Card className="bg-destructive text-destructive-foreground mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">{locale === 'ms' ? 'Kecemasan?' : 'Emergency?'}</h2>
              <p className="text-sm opacity-90">
                {locale === 'ms' ? 'Untuk gejala teruk, hubungi segera:' : 'For severe symptoms, call immediately:'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">999</div>
              <div className="text-xs opacity-90">24/7</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {helpItems.map((item, index) => (
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
