import { useTranslations } from 'next-intl';
import { ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-foreground text-muted pt-10 pb-24 md:pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-background">
                Keracunan Makanan
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
              {t('disclaimer')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-background font-semibold text-sm mb-3">Pautan Pantas</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/belajar/5-kunci" className="hover:text-primary transition-colors">
                  5 Kunci Keselamatan
                </a>
              </li>
              <li>
                <a href="/bantuan/gejala" className="hover:text-primary transition-colors">
                  Semak Gejala
                </a>
              </li>
              <li>
                <a href="/interaktif" className="hover:text-primary transition-colors">
                  Permainan Interaktif
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="text-background font-semibold text-sm mb-3">Kecemasan</h4>
            <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-3">
              <p className="text-destructive font-bold text-xl">999</p>
              <p className="text-xs text-muted-foreground">
                Talian kecemasan 24 jam
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-muted-foreground/20 pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {t('source')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-destructive" /> for Malaysia
          </p>
        </div>
      </div>
    </footer>
  );
}
