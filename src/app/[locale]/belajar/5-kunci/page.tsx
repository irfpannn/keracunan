'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronDown,
  HandMetal,
  Utensils,
  Flame,
  Thermometer,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';
import { cn } from '@/lib/utils';

const keyIcons = {
  clean: HandMetal,
  separate: Utensils,
  cook: Flame,
  temperature: Thermometer,
  safe: Droplets,
};

export default function FiveKeysPage() {
  const t = useTranslations('fiveKeys');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const keys = ['clean', 'separate', 'cook', 'temperature', 'safe'] as const;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`${localePath}/belajar`}>
              <ArrowLeft className="w-4 h-4" />
              {tCommon('back')}
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {/* Visual Overview */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {keys.map((key, index) => {
            const Icon = keyIcons[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Accordion */}
        <Accordion type="multiple" className="space-y-3">
          {keys.map((key, index) => {
            const Icon = keyIcons[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <AccordionItem value={key} className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground">
                            {index + 1}
                          </span>
                          <span className="font-semibold">{t(`keys.${key}.title`)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{t(`keys.${key}.description`)}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="bg-muted rounded-lg p-4 ml-13">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {locale === 'ms' ? 'Tips Penting:' : 'Important Tips:'}
                      </h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {(t.raw(`keys.${key}.tips`) as string[]).map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>

        {/* CTA */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            {locale === 'ms' 
              ? 'Ingat 5 kunci ini untuk menjaga keselamatan makanan!'
              : 'Remember these 5 keys to keep your food safe!'}
          </p>
          <Button asChild>
            <Link href={`${localePath}/interaktif/kuiz`}>
              {locale === 'ms' ? 'Uji Pengetahuan Anda' : 'Test Your Knowledge'}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
