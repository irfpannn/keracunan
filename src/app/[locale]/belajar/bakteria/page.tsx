'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Bug, MapPin, Clock, Activity } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardTitle, CardDescription, Badge } from '@/components/ui';

export default function BacteriaPage() {
  const t = useTranslations('bacteria');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const bacteriaList = ['salmonella', 'ecoli', 'vibrio', 'staphylococcus'] as const;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`${localePath}/belajar`}>
              <ArrowLeft className="w-4 h-4" />
              {tCommon('back')}
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Bacteria Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bacteriaList.map((bacteria, index) => (
            <motion.div
              key={bacteria}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-t-4 border-t-destructive">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="mb-2">
                      {t(`cards.${bacteria}.name`)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-destructive">
                    {t(`cards.${bacteria}.nickname`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground block mb-0.5">
                        {locale === 'ms' ? 'Habitat' : 'Habitat'}
                      </span>
                      <p className="text-sm">{t(`cards.${bacteria}.habitat`)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground block mb-0.5">
                        {locale === 'ms' ? 'Gejala' : 'Symptoms'}
                      </span>
                      <p className="text-sm">{t(`cards.${bacteria}.symptoms`)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground block mb-0.5">
                        {locale === 'ms' ? 'Tempoh' : 'Onset Time'}
                      </span>
                      <p className="text-sm">{t(`cards.${bacteria}.onset`)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
