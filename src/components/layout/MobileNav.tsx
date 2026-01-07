'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Home, BookOpen, Gamepad2, LifeBuoy } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const navItems = [
    { href: `${localePath}/`, label: t('home'), icon: Home },
    { href: `${localePath}/belajar`, label: t('learn'), icon: BookOpen },
    { href: `${localePath}/interaktif`, label: t('interactive'), icon: Gamepad2 },
    { href: `${localePath}/bantuan`, label: t('help'), icon: LifeBuoy },
  ];

  const isActive = (href: string) => {
    if (href === `${localePath}/` || href === '/') {
      return pathname === href || pathname === `${localePath}`;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                active && 'bg-accent'
              )}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
