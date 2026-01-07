'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Phone,
  Clock,
  Thermometer,
  Droplets,
  Activity
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Progress } from '@/components/ui';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Severity = 'mild' | 'moderate' | 'severe' | null;

interface Symptom {
  id: string;
  icon: React.ElementType;
  severity: number;
}

const symptoms: Symptom[] = [
  { id: 'vomiting', icon: Droplets, severity: 2 },
  { id: 'diarrhea', icon: Droplets, severity: 2 },
  { id: 'fever', icon: Thermometer, severity: 2 },
  { id: 'stomachPain', icon: Activity, severity: 1 },
  { id: 'nausea', icon: Activity, severity: 1 },
  { id: 'headache', icon: Activity, severity: 1 },
  { id: 'bloodyStool', icon: AlertTriangle, severity: 3 },
  { id: 'dehydration', icon: Droplets, severity: 3 },
];

export default function SymptomCheckerPage() {
  const t = useTranslations();
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const [step, setStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [result, setResult] = useState<Severity>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const calculateSeverity = (): Severity => {
    if (selectedSymptoms.length === 0) return 'mild';
    
    const hasSevereSymptom = selectedSymptoms.some(s => 
      symptoms.find(sym => sym.id === s)?.severity === 3
    );
    
    if (hasSevereSymptom) return 'severe';
    
    const totalSeverity = selectedSymptoms.reduce((acc, s) => {
      const symptom = symptoms.find(sym => sym.id === s);
      return acc + (symptom?.severity || 0);
    }, 0);
    
    if (totalSeverity >= 6 || (duration === 'long' && totalSeverity >= 4)) {
      return 'severe';
    }
    if (totalSeverity >= 3 || duration === 'medium') {
      return 'moderate';
    }
    return 'mild';
  };

  const handleNext = () => {
    if (step === 0) setStep(1);
    else if (step === 1) {
      setResult(calculateSeverity());
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      if (step === 2) setResult(null);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setSelectedSymptoms([]);
    setDuration('');
    setResult(null);
  };

  const resultConfig = {
    mild: { icon: CheckCircle2, className: 'text-green-600 bg-green-50 border-green-200' },
    moderate: { icon: AlertTriangle, className: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    severe: { icon: XCircle, className: 'text-red-600 bg-red-50 border-red-200' },
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`${localePath}/bantuan`}>
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{t('symptoms.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('symptoms.subtitle')}</p>
        </div>

        {/* Progress */}
        <Progress value={(step + 1) * 33.33} className="mb-6" />

        <AnimatePresence mode="wait">
          {/* Step 0: Symptoms */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === 'ms' ? 'Pilih gejala anda:' : 'Select your symptoms:'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map((symptom) => {
                      const Icon = symptom.icon;
                      const isSelected = selectedSymptoms.includes(symptom.id);
                      return (
                        <button
                          key={symptom.id}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm',
                            isSelected 
                              ? 'border-primary bg-accent' 
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="font-medium">{t(`symptoms.symptomList.${symptom.id}`)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={handleNext} className="w-full" disabled={selectedSymptoms.length === 0}>
                    {t('common.next')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 1: Duration */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('symptoms.questions.duration')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { value: 'short', label: locale === 'ms' ? 'Kurang dari 6 jam' : 'Less than 6 hours' },
                      { value: 'medium', label: locale === 'ms' ? '6 - 24 jam' : '6 - 24 hours' },
                      { value: 'long', label: locale === 'ms' ? 'Lebih dari 24 jam' : 'More than 24 hours' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDuration(option.value)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          duration === option.value ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Clock className={cn('w-4 h-4', duration === option.value ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="w-4 h-4" /> {t('common.back')}
                    </Button>
                    <Button onClick={handleNext} disabled={!duration}>
                      {locale === 'ms' ? 'Lihat Keputusan' : 'See Results'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && result && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={cn('border-2', resultConfig[result].className)}>
                <CardContent className="pt-6 text-center space-y-4">
                  <div className={cn('w-16 h-16 rounded-full mx-auto flex items-center justify-center', resultConfig[result].className)}>
                    {(() => {
                      const Icon = resultConfig[result].icon;
                      return <Icon className="w-8 h-8" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t(`symptoms.results.${result}.title`)}</h2>
                    <p className="text-muted-foreground mt-1">{t(`symptoms.results.${result}.advice`)}</p>
                  </div>

                  {result === 'severe' && (
                    <div className="bg-red-100 rounded-lg p-4 flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-full">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold text-red-600">999</div>
                        <div className="text-xs text-muted-foreground">
                          {locale === 'ms' ? 'Talian Kecemasan' : 'Emergency Hotline'}
                        </div>
                      </div>
                    </div>
                  )}

                  {result === 'mild' && (
                    <div className="bg-green-100 rounded-lg p-4 text-left">
                      <h4 className="font-semibold text-green-700 mb-2">
                        {locale === 'ms' ? 'Tips Rawatan Rumah:' : 'Home Care Tips:'}
                      </h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• {locale === 'ms' ? 'Minum banyak air' : 'Drink plenty of water'}</li>
                        <li>• {locale === 'ms' ? 'Rehat yang cukup' : 'Get adequate rest'}</li>
                        <li>• {locale === 'ms' ? 'Makan makanan ringan' : 'Eat light foods'}</li>
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" onClick={handleRestart}>{t('common.restart')}</Button>
                    <Button asChild><Link href={`${localePath}/`}>{locale === 'ms' ? 'Kembali' : 'Home'}</Link></Button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-xs text-muted-foreground mt-4">
                ⚠️ {locale === 'ms' ? 'Panduan umum sahaja. Dapatkan nasihat perubatan profesional.' : 'General guide only. Seek professional medical advice.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
