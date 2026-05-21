"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Thermometer,
  Droplets,
  Activity,
  Flame,
  Frown,
  Stethoscope,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
  Info,
  ShieldCheck,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Badge,
} from "@/components/ui";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Severity = "mild" | "moderate" | "severe";

interface Symptom {
  id: string;
  icon: React.ElementType;
  severity: number;
}

const symptoms: Symptom[] = [
  { id: "vomiting", icon: Droplets, severity: 2 },
  { id: "diarrhea", icon: Droplets, severity: 2 },
  { id: "fever", icon: Thermometer, severity: 2 },
  { id: "stomachPain", icon: Flame, severity: 1 },
  { id: "nausea", icon: Frown, severity: 1 },
  { id: "headache", icon: Activity, severity: 1 },
  { id: "bloodyStool", icon: AlertTriangle, severity: 3 },
  { id: "dehydration", icon: Droplets, severity: 3 },
];

const durationOptions = [
  { value: "short" },
  { value: "medium" },
  { value: "long" },
];

export default function SymptomChecker() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [showFirstAid, setShowFirstAid] = useState(false);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const calculateSeverity = (): Severity => {
    if (selectedSymptoms.length === 0) return "mild";

    const hasSevereSymptom = selectedSymptoms.some(
      (s) => symptoms.find((sym) => sym.id === s)?.severity === 3
    );

    if (hasSevereSymptom) return "severe";

    const totalSeverity = selectedSymptoms.reduce((acc, s) => {
      const symptom = symptoms.find((sym) => sym.id === s);
      return acc + (symptom?.severity || 0);
    }, 0);

    if (totalSeverity >= 6 || (duration === "long" && totalSeverity >= 4)) {
      return "severe";
    }
    if (totalSeverity >= 3 || duration === "medium") {
      return "moderate";
    }
    return "mild";
  };

  const severity = calculateSeverity();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleRestart = () => {
    setStep(0);
    setSelectedSymptoms([]);
    setDuration("");
    setShowFirstAid(false);
  };

  const getDurationLabel = (value: string) => {
    if (!value) return "";
    return t(`symptoms.duration.${value}`);
  };

  // Safe checks for arrays in translation files
  // If array translation fails, we use high-quality fallback arrays.
  const getListTranslation = (key: string, fallback: string[]): string[] => {
    try {
      // next-intl allows reading arrays if structured properly, but in some versions
      // t.raw or t.values is needed. Let's try raw read or default values
      const val = t.raw(key);
      if (Array.isArray(val)) return val;
      return fallback;
    } catch {
      return fallback;
    }
  };

  const fallbackMildTips = [
    locale === "ms" 
      ? "Hidrasi: Minum air bersih, sup kosong, atau Garam Penghidratan Oral (ORS) sedikit demi sedikit tetapi kerap."
      : "Hydrate: Drink small, frequent sips of water, clear broths, or Oral Rehydration Salts (ORS).",
    locale === "ms"
      ? "Berehat: Biarkan badan anda pulih dengan berehat sepuasnya."
      : "Rest: Allow your body to recover by resting as much as possible.",
    locale === "ms"
      ? "Diet mudah: Makan makanan lembut seperti bubur, roti bakar, nasi, atau pisang (diet BRAT) setelah muntah reda."
      : "Bland diet: Eat small portions of plain foods like porridge, toast, rice, or bananas (BRAT diet) once vomiting stops.",
    locale === "ms"
      ? "Elakkan: Jauhi makanan berminyak, pedas, produk tenusu, kafein, dan minuman beralkohol."
      : "Avoid: Stay away from oily, spicy, dairy, caffeine, and alcoholic foods or drinks."
  ];

  const fallbackModerateTips = [
    locale === "ms"
      ? "Dapatkan rawatan: Lawati klinik swasta berhampiran atau Klinik Kesihatan kerajaan."
      : "Seek care: Visit a nearby general practitioner or government health clinic (Klinik Kesihatan).",
    locale === "ms"
      ? "Hidrasi berterusan: Teruskan minum air atau ORS untuk menggantikan cecair yang hilang."
      : "Hydrate constantly: Continue sipping water or ORS to replace lost fluids.",
    locale === "ms"
      ? "Pantau keadaan: Jejaki gejala anda. Jika bertambah buruk, sila ke kecemasan dengan segera."
      : "Monitor: Keep track of your symptoms. If they worsen, proceed to emergency immediately."
  ];

  const fallbackSevereTips = [
    locale === "ms"
      ? "Pergi segera: Terus ke Jabatan Kecemasan hospital terdekat atau hubungi 999."
      : "Go immediately: Head directly to the nearest hospital Emergency Department or call 999.",
    locale === "ms"
      ? "JANGAN paksa muntah: Ini boleh menyebabkan kerengsaan lanjut atau tersedak."
      : "Do NOT induce vomiting: This can cause further irritation or choking.",
    locale === "ms"
      ? "Hidrasi dengan berhati-hati: Hirup sedikit cecair jika mampu, tetapi utamakan bantuan perubatan."
      : "Rehydrate cautiously: Sip small amounts of fluids if possible, but prioritize getting medical help."
  ];

  const mildTips = getListTranslation("symptomChecker.advice.mildTips", fallbackMildTips);
  const moderateTips = getListTranslation("symptomChecker.advice.moderateTips", fallbackModerateTips);
  const severeTips = getListTranslation("symptomChecker.advice.severeTips", fallbackSevereTips);

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case "severe":
        return {
          bg: "bg-red-500/10 border-red-500/30",
          text: "text-red-600 dark:text-red-400",
          title: t("symptomChecker.results.severe.title"),
          desc: t("symptomChecker.results.severe.description"),
          action: t("symptomChecker.results.severe.action"),
          badge: "bg-red-600 hover:bg-red-600 text-white",
          iconColor: "text-red-500",
          icon: XCircle,
        };
      case "moderate":
        return {
          bg: "bg-amber-500/10 border-amber-500/30",
          text: "text-amber-600 dark:text-amber-400",
          title: t("symptomChecker.results.moderate.title"),
          desc: t("symptomChecker.results.moderate.description"),
          action: t("symptomChecker.results.moderate.action"),
          badge: "bg-amber-500 hover:bg-amber-500 text-white",
          iconColor: "text-amber-500",
          icon: AlertTriangle,
        };
      case "mild":
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30",
          text: "text-emerald-600 dark:text-emerald-400",
          title: t("symptomChecker.results.mild.title"),
          desc: t("symptomChecker.results.mild.description"),
          action: t("symptomChecker.results.mild.action"),
          badge: "bg-emerald-600 hover:bg-emerald-600 text-white",
          iconColor: "text-emerald-500",
          icon: CheckCircle2,
        };
    }
  };

  const currentStyle = getSeverityStyle(severity);
  const ResultIcon = currentStyle.icon;

  const hasSevereSymptomSelected = selectedSymptoms.some(
    (s) => symptoms.find((sym) => sym.id === s)?.severity === 3
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("symptomChecker.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("symptomChecker.subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      {step > 0 && step < 3 && (
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>{step === 1 ? (locale === "ms" ? "Langkah 1: Gejala" : "Step 1: Symptoms") : (locale === "ms" ? "Langkah 2: Tempoh" : "Step 2: Duration")}</span>
            <span>{step === 1 ? "50%" : "100%"}</span>
          </div>
          <Progress value={step === 1 ? 50 : 100} className="h-2" />
        </div>
      )}

      {/* Main card */}
      <Card className="border border-border/50 shadow-xl shadow-primary/5 bg-card/75 backdrop-blur-md overflow-hidden">
        <AnimatePresence mode="wait">
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <CardHeader className="space-y-3 pb-4">
                <Badge variant="outline" className="w-fit border-primary/20 text-primary">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {locale === "ms" ? "Berdasarkan Garis Panduan KKM" : "KKM Guidelines Based"}
                </Badge>
                <CardTitle className="text-2xl font-bold">
                  {t("symptomChecker.intro.title")}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {t("symptomChecker.intro.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {t("symptomChecker.intro.disclaimer")}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button size="lg" onClick={handleNext} className="w-full shadow-lg shadow-primary/20 group">
                  {t("symptomChecker.intro.start")}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 1: SELECT SYMPTOMS */}
          {step === 1 && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {t("symptomChecker.symptoms.title")}
                </CardTitle>
                <CardDescription>
                  {t("symptomChecker.symptoms.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Symptom Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {symptoms.map((symptom) => {
                    const IconComponent = symptom.icon;
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleSymptom(symptom.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border transition-all text-left group",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/60 bg-transparent hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          )}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {t(`symptoms.symptomList.${symptom.id}`)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {symptom.severity === 3 
                              ? (locale === "ms" ? "Gejala Kritikal" : "Critical Symptom") 
                              : symptom.severity === 2 
                              ? (locale === "ms" ? "Gejala Sederhana" : "Moderate Symptom") 
                              : (locale === "ms" ? "Gejala Ringan" : "Mild Symptom")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Severe Symptoms warning */}
                {hasSevereSymptomSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-medium"
                  >
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <p>{t("symptomChecker.symptoms.severeWarning")}</p>
                  </motion.div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-3 pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.back")}
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={selectedSymptoms.length === 0}
                  className="flex-1"
                >
                  {t("common.next")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 2: SELECT DURATION */}
          {step === 2 && (
            <motion.div
              key="duration"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {t("symptomChecker.duration.title")}
                </CardTitle>
                <CardDescription>
                  {t("symptomChecker.duration.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  {durationOptions.map((option) => {
                    const isSelected = duration === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDuration(option.value)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/60 bg-transparent hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          )}
                        >
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {getDurationLabel(option.value)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-3 pt-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.back")}
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!duration}
                  className="flex-1 shadow-lg shadow-primary/15"
                >
                  {locale === "ms" ? "Lihat Keputusan" : "Show Results"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 3: RESULTS SCREEN */}
          {step === 3 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Severity Banner */}
              <div className={cn("p-6 border-b text-center relative overflow-hidden flex flex-col items-center", currentStyle.bg)}>
                <div className="inline-flex p-3 rounded-full bg-white dark:bg-black/20 shadow-md mb-3 animate-pulse">
                  <ResultIcon className={cn("w-10 h-10", currentStyle.iconColor)} />
                </div>
                <Badge className={cn("mb-2 uppercase text-[10px] tracking-wider", currentStyle.badge)}>
                  {t("symptomChecker.results.severityLabel")}: {severity}
                </Badge>
                <h2 className="text-2xl font-bold mb-1">{currentStyle.title}</h2>
                <p className="text-sm font-semibold max-w-md opacity-90">{currentStyle.action}</p>
              </div>

              <CardContent className="space-y-6 pt-6">
                {/* Severity Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {currentStyle.desc}
                </p>

                {/* Specific Advice Tips List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-primary" />
                    {t("symptomChecker.advice.title")}
                  </h3>
                  <ul className="space-y-2.5">
                    {(severity === "severe" ? severeTips : severity === "moderate" ? moderateTips : mildTips).map((tip, idx) => (
                      <li key={idx} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* First Aid Expandable box (for Moderate/Severe) */}
                {(severity === "severe" || severity === "moderate") && (
                  <div className="border border-border/80 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowFirstAid(!showFirstAid)}
                      className="w-full flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                    >
                      <span className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                        {t("emergency.firstAid.title")}
                      </span>
                      {showFirstAid ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    <AnimatePresence>
                      {showFirstAid && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border/50 bg-card"
                        >
                          <ul className="p-4 space-y-2 text-sm text-muted-foreground">
                            {getListTranslation("emergency.firstAid.steps", [
                              "Stay hydrated: Drink small sips of water or ORS.",
                              "Do not force vomiting.",
                              "Rest on your side.",
                              "Keep a food sample if possible."
                            ]).map((step, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Call-to-action Section */}
                <div className="flex flex-col gap-2 pt-2">
                  {severity === "severe" ? (
                    <Button 
                      variant="destructive" 
                      size="lg" 
                      asChild 
                      className="w-full font-bold shadow-lg shadow-destructive/25 text-white"
                    >
                      <a href="tel:999">
                        <Phone className="w-5 h-5 mr-2" />
                        {t("symptomChecker.actions.call999")}
                      </a>
                    </Button>
                  ) : null}

                  {severity === "severe" || severity === "moderate" ? (
                    <Button variant="outline" size="lg" onClick={() => router.push("/bantuan/klinik")} className="w-full">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      {t("symptomChecker.actions.findClinic")}
                    </Button>
                  ) : null}
                </div>

                {/* Report Section */}
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">
                      {t("symptomChecker.actions.reportIncident")}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal">
                      {t("symptomChecker.actions.reportIncidentDesc")}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push("/reports/new?tab=symptom")}
                    className="w-full md:w-auto shrink-0"
                  >
                    {locale === "ms" ? "Hantar Laporan" : "Submit Report"}
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/40 bg-muted/10 flex justify-center py-4">
                <Button variant="ghost" onClick={handleRestart} className="text-muted-foreground hover:text-foreground">
                  {t("symptomChecker.actions.startOver")}
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
