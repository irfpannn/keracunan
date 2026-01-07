'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type QuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5';

const QUESTIONS: QuestionKey[] = ['q1', 'q2', 'q3', 'q4', 'q5'];

const CORRECT_ANSWERS: Record<QuestionKey, string> = {
  q1: 'c',
  q2: 'c',
  q3: 'b',
  q4: 'c',
  q5: 'c',
};

export default function QuizPage() {
  const t = useTranslations('quiz');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestionKey = QUESTIONS[currentQuestionIndex];
  const correctAnswer = CORRECT_ANSWERS[currentQuestionKey];

  const handleStart = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setGameState('finished');
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / QUESTIONS.length) * 100;
    if (percentage === 100) return t('perfectScore');
    if (percentage >= 80) return t('goodScore');
    if (percentage >= 60) return t('passScore');
    return t('failScore');
  };

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header (Back & Title) */}
        <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`${localePath}/interaktif`}>
                <ArrowLeft className="w-4 h-4" />
                {tCommon('back')}
            </Link>
            </Button>
            {gameState !== 'start' && (
                 <div className="flex justify-between items-center mt-2">
                    <h1 className="text-xl font-bold text-muted-foreground">{t('title')}</h1>
                    <div className="text-sm font-medium bg-secondary px-3 py-1 rounded-full">
                        {gameState === 'playing' 
                            ? `${currentQuestionIndex + 1} / ${QUESTIONS.length}`
                            : tCommon('score')
                        }
                    </div>
                 </div>
            )}
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Trophy className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
                {t('subtitle')}
              </p>
              <Button size="lg" onClick={handleStart} className="min-w-[200px] gap-2 text-lg">
                {t('start')} <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2">
                <CardContent className="p-6 md:p-8">
                  {/* Question */}
                  <h2 className="text-2xl font-bold mb-8 leading-snug">
                    {t(`questions.${currentQuestionKey}.question` as any)}
                  </h2>

                  {/* Options */}
                  <div className="grid gap-4 mb-8">
                    {['a', 'b', 'c', 'd'].map((option) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = option === correctAnswer;
                        
                        let variantClass = "hover:border-primary hover:bg-muted/50";
                        if (isAnswered) {
                            if (isCorrect) variantClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                            else if (isSelected) variantClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                            else variantClass = "opacity-50";
                        } else if (isSelected) {
                            variantClass = "border-primary bg-primary/5";
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                disabled={isAnswered}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                                    variantClass
                                )}
                            >
                                <span className="font-medium text-lg">
                                    {t(`questions.${currentQuestionKey}.options.${option}` as any)}
                                </span>
                                {isAnswered && isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                                {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                            </button>
                        );
                    })}
                  </div>

                  {/* Feedback Area */}
                  <AnimatePresence>
                    {isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                        >
                            <div className="bg-muted p-4 rounded-lg mb-6">
                                <p className="font-medium flex items-start gap-2">
                                    <span className="shrink-0 mt-1">💡</span> 
                                    {t(`questions.${currentQuestionKey}.explanation` as any)}
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <Button size="lg" onClick={handleNext} className="gap-2">
                                    {t('next')} <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mb-8 relative inline-block">
                <Trophy className={cn("w-32 h-32 mx-auto mb-4", score === QUESTIONS.length ? "text-yellow-500" : "text-muted-foreground")} />
                {score === QUESTIONS.length && (
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-background"
                    >
                        A+
                    </motion.div>
                )}
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {t('score', { score, total: QUESTIONS.length })}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {getScoreMessage()}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleStart} variant="outline" size="lg" className="min-w-[160px] gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t('retry')}
                </Button>
                <Button asChild size="lg" className="min-w-[160px]">
                  <Link href={`${localePath}/interaktif`}>
                    {t('backToMenu')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
