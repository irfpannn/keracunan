'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Eye, Wind, Utensils, ThumbsUp, Trash2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type GameItem = {
  id: string;
  type: 'milk' | 'bread' | 'chicken' | 'soup';
  isSafe: boolean;
  icon: string;
};

const ITEMS: GameItem[] = [
  { id: '1', type: 'milk', isSafe: false, icon: '🥛' },
  { id: '2', type: 'bread', isSafe: false, icon: '🍞' },
  { id: '3', type: 'chicken', isSafe: false, icon: '🍗' },
  { id: '4', type: 'soup', isSafe: true, icon: '🍲' },
];

export default function LookSmellTastePage() {
  const t = useTranslations('foodInspectorGame');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [clues, setClues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const currentItem = ITEMS[currentItemIndex];

  const handleAction = (action: 'look' | 'smell' | 'taste') => {
    if (feedback?.type === 'success' || feedback?.type === 'error') return; // Prevent action if already decided

    let clueKey = '';
    let warning = null;

    if (action === 'look') clueKey = `items.${currentItem.type}.look`;
    if (action === 'smell') clueKey = `items.${currentItem.type}.smell`;
    if (action === 'taste') {
        if (!currentItem.isSafe) {
            warning = t('feedback.riskyTaste');
            setFeedback({ type: 'warning', message: warning });
        }
        clueKey = `items.${currentItem.type}.taste`;
    }

    const clueText = t(clueKey as any);
    
    if (!clues.includes(clueText)) {
      setClues((prev) => [...prev, clueText]);
    }
  };

  const handleDecision = (decision: 'eat' | 'throw') => {
    if (feedback?.type === 'success' || feedback?.type === 'error') return;

    let result: 'success' | 'error' = 'error';
    let message = '';

    if (decision === 'eat') {
        if (currentItem.isSafe) {
            result = 'success';
            message = t('feedback.safe');
            setScore(s => s + 1);
        } else {
            result = 'error';
            message = t('feedback.unsafeEaten');
        }
    } else { // throw
        if (!currentItem.isSafe) {
            result = 'success';
            message = t('feedback.unsafe');
            setScore(s => s + 1);
        } else {
            result = 'error';
            message = t('feedback.safeThrown');
        }
    }

    setFeedback({ type: result, message });
  };

  const nextItem = () => {
    if (currentItemIndex + 1 < ITEMS.length) {
        setCurrentItemIndex(prev => prev + 1);
        setClues([]);
        setFeedback(null);
    } else {
        setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentItemIndex(0);
    setClues([]);
    setFeedback(null);
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href={`${localePath}/interaktif`}>
                    <ArrowLeft className="w-4 h-4" />
                    {tCommon('back')}
                </Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            {!isGameOver && (
                 <div className="text-right">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        {tCommon('score')}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                        {score}/{ITEMS.length}
                    </div>
                </div>
            )}
        </div>

        {/* Game Content */}
        <AnimatePresence mode='wait'>
            {!isGameOver ? (
                <motion.div
                    key="game"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Item Display */}
                    <div className="flex flex-col items-center justify-center bg-card border rounded-2xl p-8 shadow-sm min-h-[300px]">
                        <motion.div 
                            key={currentItem.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-9xl mb-6 filter drop-shadow-lg"
                        >
                            {currentItem.icon}
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">{t(`items.${currentItem.type}.name` as any)}</h2>
                        <p className="text-center text-muted-foreground mb-6">
                            {t('instructions')}
                        </p>

                        <div className="flex gap-4 w-full max-w-xs">
                             <Button 
                                variant="outline" 
                                className="flex-1 gap-2"
                                onClick={() => handleAction('look')}
                             >
                                <Eye className="w-4 h-4" />
                                {t('actions.look')}
                             </Button>
                             <Button 
                                variant="outline" 
                                className="flex-1 gap-2"
                                onClick={() => handleAction('smell')}
                             >
                                <Wind className="w-4 h-4" />
                                {t('actions.smell')}
                             </Button>
                             <Button 
                                variant="outline" 
                                className={cn("flex-1 gap-2", !currentItem.isSafe && "border-destructive/50 hover:bg-destructive/10 hover:text-destructive")}
                                onClick={() => handleAction('taste')}
                             >
                                <Utensils className="w-4 h-4" />
                                {t('actions.taste')}
                             </Button>
                        </div>
                    </div>

                    {/* Feedback & Controls */}
                    <div className="flex flex-col gap-6">
                         {/* Clues Area */}
                         <Card className="flex-1 bg-background/50 backdrop-blur">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Observations
                                </h3>
                                {clues.length > 0 ? (
                                    <ul className="space-y-3">
                                        {clues.map((clue, idx) => (
                                            <motion.li 
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-start gap-2 bg-muted p-3 rounded-lg text-sm"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                {clue}
                                            </motion.li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic py-8 text-center">
                                        No observations yet. Use the actions to inspect the food.
                                    </p>
                                )}
                            </CardContent>
                         </Card>

                         {/* Decision & Feedback */}
                         <div className="space-y-4">
                            {feedback ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "p-4 rounded-xl border flex items-start gap-3",
                                        feedback.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900",
                                        feedback.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900",
                                        feedback.type === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900"
                                    )}
                                >
                                    {feedback.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
                                    {feedback.type === 'error' && <XCircle className="w-5 h-5 shrink-0" />}
                                    {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                                    <div>
                                        <p className="font-medium">{feedback.message}</p>
                                        {(feedback.type === 'success' || feedback.type === 'error') && (
                                            <Button size="sm" onClick={nextItem} className="mt-3">
                                                {t('feedback.next')}
                                            </Button>
                                        )}
                                        {feedback.type === 'warning' && (
                                            <Button size="sm" variant="outline" onClick={() => setFeedback(null)} className="mt-3">
                                                {tCommon('close')}
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Button 
                                        size="lg" 
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleDecision('eat')}
                                    >
                                        <div className="flex flex-col items-center">
                                             <Utensils className="w-2 h-2 mb-0" />
                                             <span>{t('actions.eat')}</span>
                                        </div>
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => handleDecision('throw')}
                                    >
                                        <div className="flex flex-col items-center">
                                             <Trash2 className="w-6 h-6 mb-0" />
                                             <span>{t('actions.throw')}</span>
                                        </div>
                                    </Button>
                                </div>
                            )}
                         </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 max-w-md mx-auto"
                >
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <ThumbsUp className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{t('feedback.safe')}</h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        {t('title')} Complete!<br/>
                        Final Score: <span className="text-primary font-bold">{score}/{ITEMS.length}</span>
                    </p>
                    <Button onClick={restartGame} size="lg" className="min-w-[200px] gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {tCommon('tryAgain')}
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
