'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Fish, Egg, Milk, Drumstick } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';

export default function HighRiskFoodsPage() {
  const t = useTranslations('highRiskFoods');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const categories = ['meat', 'seafood', 'eggs', 'dairy'] as const;

  const icons = {
    meat: Drumstick,
    seafood: Fish,
    eggs: Egg,
    dairy: Milk,
  };

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
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const Icon = icons[category];
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">
                      {t(`categories.${category}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-muted/50">
                        {locale === 'ms' ? 'Risiko' : 'Risk'}
                      </Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(`categories.${category}.description`)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-100 dark:border-green-900/50">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                        {locale === 'ms' ? 'Cara Pencegahan' : 'Prevention'}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        {t(`categories.${category}.prevention`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
