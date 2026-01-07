'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const localePath = locale === 'ms' ? '' : `/${locale}`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: `${localePath}/`, label: t('home') },
    { href: `${localePath}/belajar`, label: t('learn') },
    { href: `${localePath}/interaktif`, label: t('interactive') },
    { href: `${localePath}/bantuan`, label: t('help') },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={`${localePath}/`} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-lg font-bold text-foreground">
              Keracunan
            </span>
            <span className="text-lg font-bold text-primary">
              Makanan
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className="text-muted-foreground hover:text-primary hover:bg-accent"
            >
              <Link href={link.href}>
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t border-border animate-slide-down">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className="justify-start w-full text-foreground hover:text-primary hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href={link.href}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
