'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'ms' ? 'en' : 'ms';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
      aria-label={`Switch to ${locale === 'ms' ? 'English' : 'Bahasa Melayu'}`}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{locale === 'ms' ? 'EN' : 'BM'}</span>
    </button>
  );
}
