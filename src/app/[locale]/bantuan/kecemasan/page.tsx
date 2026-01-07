'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Phone, AlertTriangle, HeartPulse, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyPage() {
  const t = useTranslations('emergency');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const [callDetails, setCallDetails] = useState<{ number: string; name: string } | null>(null);

  const confirmCall = (number: string, name: string) => {
    setCallDetails({ number, name });
  };

  const executeCall = () => {
    if (callDetails) {
        window.location.href = `tel:${callDetails.number}`;
        setCallDetails(null);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-destructive/5">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Link href={`${localePath}/bantuan`}>
                    <ArrowLeft className="w-4 h-4" />
                    {tCommon('back')}
                </Link>
            </Button>
            <div className="flex items-center gap-3 text-destructive">
                <ShieldAlert className="w-10 h-10" />
                <h1 className="text-3xl font-bold">{t('title')}</h1>
            </div>
            <p className="text-xl text-muted-foreground mt-2">{t('subtitle')}</p>
        </div>

        {/* Emergency Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card className="border-destructive shadow-lg overflow-hidden bg-white">
                <div className="bg-destructive p-4 text-destructive-foreground text-center">
                    <h2 className="text-lg font-bold uppercase tracking-wider">{t('call999')}</h2>
                </div>
                <CardContent className="p-8 flex flex-col items-center">
                    <div className="text-6xl font-black text-destructive mb-2">999</div>
                    <p className="text-muted-foreground text-center mb-6">
                        {locale === 'ms' ? 'Ambulans & Polis' : 'Ambulance & Police'}
                    </p>
                    <Button 
                        size="lg" 
                        className="w-full bg-destructive hover:bg-destructive/90 text-white gap-2" 
                        onClick={() => confirmCall('999', '999')}
                    >
                        <Phone className="w-5 h-5" /> {t('call')}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-blue-500 shadow-lg overflow-hidden bg-white">
                <div className="bg-blue-600 p-4 text-white text-center">
                    <h2 className="text-lg font-bold uppercase tracking-wider">{t('poisonCentre')}</h2>
                </div>
                <CardContent className="p-8 flex flex-col items-center">
                    <div className="text-3xl md:text-4xl font-black text-blue-600 mb-2 whitespace-nowrap">
                        1-800-88-8099
                    </div>
                    <p className="text-muted-foreground text-center mb-6">
                        {locale === 'ms' ? '24 Jam (Isnin-Jumaat)' : '24 Hours (Mon-Fri)'}
                    </p>
                    <Button 
                        size="lg" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        onClick={() => confirmCall('1800888099', t('poisonCentre'))}
                    >
                        <Phone className="w-5 h-5" /> {t('call')}
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={!!callDetails} onOpenChange={(open) => !open && setCallDetails(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('confirmMessage', { number: callDetails?.name })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setCallDetails(null)}>
                        {t('cancel')}
                    </Button>
                    <Button 
                        variant="default" 
                        className={callDetails?.number === '999' ? "bg-destructive hover:bg-destructive/90" : "bg-blue-600 hover:bg-blue-700"}
                        onClick={executeCall}
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        {t('dial')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Severe Symptoms Warning */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mb-10">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-orange-800 text-lg mb-2">{t('severeSymptoms')}</h3>
                    <ul className="list-disc list-inside space-y-1 text-orange-900/80">
                        {['0', '1', '2', '3', '4'].map((idx) => (
                            <li key={idx}>{(t as any)(`symptomsList.${idx}`)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* First Aid Steps */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-rose-500" />
                    {t('firstAid.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {['0', '1', '2', '3'].map((idx) => (
                         <div key={idx} className="flex gap-4 p-4 rounded-lg bg-secondary/30">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                                {Number(idx) + 1}
                            </div>
                            <p className="mt-1 font-medium text-foreground/90">
                                {(t as any)(`firstAid.steps.${idx}`)}
                            </p>
                         </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
