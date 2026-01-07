'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Define types for our game items and zones
type FoodItem = {
  id: string;
  type: string;
  correctZone: 'top' | 'middle' | 'bottom' | 'drawer';
  icon: string;
};

type Zone = {
  id: 'top' | 'middle' | 'bottom' | 'drawer';
  label: string;
};

// Initial items with their correct zones
const INITIAL_ITEMS: FoodItem[] = [
  { id: 'milk', type: 'milk', correctZone: 'top', icon: '🥛' },
  { id: 'yogurt', type: 'yogurt', correctZone: 'top', icon: '🥣' },
  { id: 'leftovers', type: 'leftovers', correctZone: 'top', icon: '🥡' },
  { id: 'eggs', type: 'eggs', correctZone: 'middle', icon: '🥚' },
  { id: 'cookedMeat', type: 'cookedMeat', correctZone: 'middle', icon: '🍖' },
  { id: 'rawMeat', type: 'rawMeat', correctZone: 'bottom', icon: '🥩' },
  { id: 'rawChicken', type: 'rawChicken', correctZone: 'bottom', icon: '🍗' },
  { id: 'fish', type: 'fish', correctZone: 'bottom', icon: '🐟' },
  { id: 'vegetables', type: 'vegetables', correctZone: 'drawer', icon: '🥦' },
  { id: 'fruits', type: 'fruits', correctZone: 'drawer', icon: '🍎' },
];

export default function FridgeGamePage() {
  const t = useTranslations('fridgeGame');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;

  // Game State
  const [items, setItems] = useState<FoodItem[]>([]);
  const [placedItems, setPlacedItems] = useState<{ [key: string]: string[] }>({
    top: [],
    middle: [],
    bottom: [],
    drawer: [],
  });
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null } | null>(null);
  
  // Ref for Zone Elements to calculate collision
  const zoneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeZone, setActiveZone] = useState<string | null>(null);
  
  // Track dragging state and position for scroll handling
  const isDraggingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize game
  useEffect(() => {
    resetGame();
    
    // Add scroll listener to update collision while scrolling
    const handleScroll = () => {
      if (isDraggingRef.current && lastPointRef.current) {
        const hoveredZone = checkCollision(lastPointRef.current);
        setActiveZone(hoveredZone);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resetGame = () => {
    setItems([...INITIAL_ITEMS].sort(() => Math.random() - 0.5));
    setPlacedItems({ top: [], middle: [], bottom: [], drawer: [] });
    setScore(0);
    setIsComplete(false);
    setFeedback(null);
    setActiveZone(null);
  };

  const zones: Zone[] = [
    { id: 'top', label: t('zones.top') },
    { id: 'middle', label: t('zones.middle') },
    { id: 'bottom', label: t('zones.bottom') },
    { id: 'drawer', label: t('zones.drawer') },
  ];

  const checkCollision = (point: { x: number; y: number }) => {
    for (const zone of zones) {
      const element = zoneRefs.current[zone.id];
      if (element) {
        const rect = element.getBoundingClientRect();
        if (
          point.x >= rect.left &&
          point.x <= rect.right &&
          point.y >= rect.top &&
          point.y <= rect.bottom
        ) {
          return zone.id;
        }
      }
    }
    return null;
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDrag = (info: any) => {
    const point = info.point;
    lastPointRef.current = point;
    const hoveredZone = checkCollision(point);
    setActiveZone(hoveredZone);
  };

  const handleDragEnd = (item: FoodItem, info: any) => {
    isDraggingRef.current = false;
    lastPointRef.current = null;
    
    const point = info.point;
    const droppedZoneId = checkCollision(point);
    setActiveZone(null);

    // ... existing logic ...
    if (droppedZoneId) {
      if (item.correctZone === droppedZoneId) {
        // Correct placement
        setPlacedItems(prev => ({
          ...prev,
          [droppedZoneId]: [...prev[droppedZoneId], item.id]
        }));
        setItems(prev => prev.filter(i => i.id !== item.id));
        setScore(prev => prev + 1);
        setFeedback({ 
          message: t('feedback.correct', { item: t(`items.${item.type}`) }), 
          type: 'success' 
        });

        // Check win condition
        if (score + 1 === INITIAL_ITEMS.length) {
          setIsComplete(true);
          setFeedback({ message: t('feedback.success'), type: 'success' });
        }
      } else {
        // Incorrect placement
        setFeedback({ 
          message: t('feedback.incorrect', { item: t(`items.${item.type}`) }), 
          type: 'error' 
        });
      }
    }

    // Clear feedback after 2 seconds
    setTimeout(() => {
        setFeedback(null); 
    }, 2000);
  };

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
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
          
          <div className="flex items-center gap-4">
            <div className="text-right">
               <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {tCommon('score')}
              </div>
              <div className="text-3xl font-bold text-primary">
                {score}/{INITIAL_ITEMS.length}
              </div>
            </div>
            <Button onClick={resetGame} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items Pool (Sidebar) */}
          <div className="lg:col-span-4 order-2 lg:order-1">
             <Card className="p-4 bg-background/50 backdrop-blur z-10 relative">
                <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground tracking-wider">
                  {locale === 'ms' ? 'Item Untuk Disusun' : 'Items to Sort'}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                  {!isComplete ? (
                    items.map((item) => (
                    <motion.div
                      key={item.id}
                      drag
                      dragSnapToOrigin
                      dragMomentum={false}
                      dragElastic={0}
                      whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
                      onDragStart={handleDragStart}
                      onDrag={(e, info) => handleDrag(info)}
                      onDragEnd={(e, info) => handleDragEnd(item, info)}
                      className="cursor-grab active:cursor-grabbing bg-card border shadow-sm p-3 rounded-xl flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition-all z-20 touch-none"
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-xs font-medium text-center leading-tight">
                        {t(`items.${item.type}`)}
                      </span>
                    </motion.div>
                  ))
                  ) : (
                    <div className="col-span-2 space-y-4">
                      <div className="text-center text-green-600 dark:text-green-400">
                         <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                         <p className="font-bold text-lg">{t('feedback.success')}</p>
                      </div>
                      
                      <div className="space-y-3 text-sm text-left bg-muted/50 p-3 rounded-lg max-h-[400px] overflow-y-auto custom-scrollbar">
                         <h4 className="font-bold underline decoration-primary/50 underline-offset-4">{t('education.title')}</h4>
                         <ul className="space-y-2 list-disc pl-4 text-muted-foreground">
                           <li><span className="font-semibold text-foreground">{t('zones.top')}:</span> {t('education.top').split(': ')[1]}</li>
                           <li><span className="font-semibold text-foreground">{t('zones.middle')}:</span> {t('education.middle').split(': ')[1]}</li>
                           <li><span className="font-semibold text-foreground">{t('zones.bottom')}:</span> {t('education.bottom').split(': ')[1]}</li>
                           <li><span className="font-semibold text-foreground">{t('zones.drawer')}:</span> {t('education.drawer').split(': ')[1]}</li>
                         </ul>
                      </div>
                    </div>
                  )}
                  
                  {items.length === 0 && !isComplete && (
                    <div className="col-span-2 py-10 text-center text-muted-foreground">
                      <p>{tCommon('loading')}...</p>
                    </div>
                  )}
                </div>
             </Card>

             {/* Feedback Area */}
             <div className="mt-4 h-16">
               {feedback && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg flex items-center gap-3 text-sm font-medium",
                      feedback.type === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    )}
                 >
                   {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                   {feedback.message}
                 </motion.div>
               )}
             </div>
          </div>

          {/* Fridge (Drop Zones) */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-8 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative min-h-[600px] flex flex-col transform-gpu">
              {/* Top Handle Decor */}
              <div className="absolute top-1/2 -right-4 w-4 h-32 bg-slate-300 rounded-l-lg -translate-y-1/2 opacity-50" />

              {zones.map((zone, index) => (
                <div 
                  key={zone.id}
                  ref={(el) => {
                    zoneRefs.current[zone.id] = el;
                  }}
                  className={cn(
                    "flex-1 border-b-2 border-slate-100 dark:border-slate-700/50 p-4 relative group transition-all duration-200",
                    index === zones.length - 1 ? "flex-[1.5] border-b-0" : "",
                    activeZone === zone.id 
                      ? "bg-primary/5 dark:bg-primary/20 ring-inset ring-2 ring-primary/20" 
                      : (index === zones.length - 1 ? "bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-700/30")
                  )}
                >
                  <div className={cn(
                    "absolute top-2 left-4 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors",
                    activeZone === zone.id ? "bg-primary text-primary-foreground" : "text-slate-400 bg-white/50 dark:bg-black/20"
                  )}>
                    {zone.label}
                  </div>
                  
                  {/* Placed Items Grid */}
                  <div className="flex flex-wrap content-end h-full gap-2 pt-8 px-4 pb-2">
                    {placedItems[zone.id].map(itemId => {
                      const item = INITIAL_ITEMS.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                         <motion.div
                           layoutId={item.id}
                           key={item.id}
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="bg-card shadow-sm border p-2 rounded-lg flex items-center gap-2 text-xs font-medium"
                         >
                           <span>{item.icon}</span>
                           <span className="hidden sm:inline">{t(`items.${item.type}`)}</span>
                         </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground italic">
                {locale === 'ms' 
                  ? 'Petua: Makanan mentah harus sentiasa di bawah makanan yang dimasak!'
                  : 'Tip: Raw food should always be below cooked food!'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
