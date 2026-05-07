"use client";

import React from "react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  CalendarDays,
  FileText,
  Loader2,
  MapPin,
  Utensils,
  User,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/utils";
import { submitSymptomReport } from "@/lib/firebase/reports";

type Severity = "mild" | "moderate" | "severe" | null;

interface Symptom {
  id: string;
  icon: React.ElementType;
  severity: number;
}

const symptoms: Symptom[] = [
  { id: "vomiting", icon: Droplets, severity: 2 },
  { id: "diarrhea", icon: Droplets, severity: 2 },
  { id: "fever", icon: Thermometer, severity: 2 },
  { id: "stomachPain", icon: Activity, severity: 1 },
  { id: "nausea", icon: Activity, severity: 1 },
  { id: "headache", icon: Activity, severity: 1 },
  { id: "bloodyStool", icon: AlertTriangle, severity: 3 },
  { id: "dehydration", icon: Droplets, severity: 3 },
];

const durationOptions = [
  {
    value: "short",
    labelEn: "Less than 6 hours",
    labelMs: "Kurang dari 6 jam",
  },
  { value: "medium", labelEn: "6 - 24 hours", labelMs: "6 - 24 jam" },
  {
    value: "long",
    labelEn: "More than 24 hours",
    labelMs: "Lebih dari 24 jam",
  },
];

export default function SymptomReport() {
  const t = useTranslations();
  const locale = useLocale();

  const [step, setStep] = useState(0);
  const [reporterName, setReporterName] = useState("");
  const [symptomDate, setSymptomDate] = useState("");
  const [foodEaten, setFoodEaten] = useState("");
  const [eatenAt, setEatenAt] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [result, setResult] = useState<Severity>(null);
  const [reportId, setReportId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const labels = {
    reportDetails: locale === "ms" ? "Maklumat laporan" : "Report details",
    name: locale === "ms" ? "Nama" : "Name",
    namePlaceholder: locale === "ms" ? "Nama penuh anda" : "Your full name",
    symptomDate:
      locale === "ms" ? "Tarikh gejala dirasai" : "Date symptoms were felt",
    foodEaten:
      locale === "ms"
        ? "Makanan yang dimakan sebelum gejala"
        : "Food eaten before symptoms",
    foodEatenPlaceholder:
      locale === "ms"
        ? "cth., nasi lemak, ayam goreng..."
        : "e.g., nasi lemak, fried chicken...",
    eatenAt:
      locale === "ms"
        ? "Tempat anda makan sebelum gejala"
        : "Where you ate before symptoms",
    eatenAtPlaceholder:
      locale === "ms"
        ? "cth., nama kedai, alamat, rumah..."
        : "e.g., shop name, address, home...",
    remarks: locale === "ms" ? "Maklumat tambahan" : "Additional details",
    remarksPlaceholder:
      locale === "ms"
        ? "Kongsikan apa-apa butiran lain yang membantu..."
        : "Share any other helpful details...",
    fillRequired:
      locale === "ms"
        ? "Sila isi semua maklumat laporan yang diperlukan."
        : "Please fill in all required report details.",
    submitFailed:
      locale === "ms"
        ? "Gagal menghantar laporan. Sila cuba lagi."
        : "Failed to submit report. Please try again.",
    submitting:
      locale === "ms" ? "Menghantar laporan..." : "Submitting report...",
    submitted:
      locale === "ms"
        ? "Laporan gejala telah dihantar untuk semakan admin."
        : "Symptom report has been submitted for admin review.",
    reportId: locale === "ms" ? "ID Laporan" : "Report ID",
  };

  const inputClassName =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  const isReportDetailsValid =
    reporterName.trim() && symptomDate && foodEaten.trim() && eatenAt.trim();

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId],
    );
  };

  const calculateSeverity = (): Severity => {
    if (selectedSymptoms.length === 0) return "mild";

    const hasSevereSymptom = selectedSymptoms.some(
      (s) => symptoms.find((sym) => sym.id === s)?.severity === 3,
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

  const getDurationLabel = (value: string) => {
    const option = durationOptions.find((item) => item.value === value);
    if (!option) return value;
    return locale === "ms" ? option.labelMs : option.labelEn;
  };

  const buildRemarks = (severity: Exclude<Severity, null>) => {
    const symptomNames = selectedSymptoms.map((symptomId) =>
      t(`symptoms.symptomList.${symptomId}`),
    );

    return [
      `${locale === "ms" ? "Gejala" : "Symptoms"}: ${symptomNames.join(", ")}`,
      `${locale === "ms" ? "Tempoh" : "Duration"}: ${getDurationLabel(duration)}`,
      `${locale === "ms" ? "Tahap" : "Severity"}: ${severity}`,
      remarks.trim()
        ? `${locale === "ms" ? "Catatan" : "Notes"}: ${remarks.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const submitCurrentReport = async () => {
    const severity = calculateSeverity();
    if (!severity) return;

    setSubmitting(true);
    setError("");

    try {
      const id = await submitSymptomReport({
        reporterName: reporterName.trim(),
        symptomDate,
        foodEaten: foodEaten.trim(),
        eatenAt: eatenAt.trim(),
        symptoms: selectedSymptoms,
        symptomDuration: duration,
        symptomSeverity: severity,
        remarks: buildRemarks(severity),
      });

      setReportId(id);
      setResult(severity);
      setStep(3);
    } catch (err) {
      console.error("Failed to submit symptom report", err);
      setError(labels.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    setError("");

    if (step === 0) {
      if (!isReportDetailsValid) {
        setError(labels.fillRequired);
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      await submitCurrentReport();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      if (step === 3) setResult(null);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setReporterName("");
    setSymptomDate("");
    setFoodEaten("");
    setEatenAt("");
    setRemarks("");
    setSelectedSymptoms([]);
    setDuration("");
    setResult(null);
    setReportId("");
    setError("");
  };

  const resultConfig = {
    mild: {
      icon: CheckCircle2,
      className: "text-green-600 bg-green-50 border-green-200",
    },
    moderate: {
      icon: AlertTriangle,
      className: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    severe: {
      icon: XCircle,
      className: "text-red-600 bg-red-50 border-red-200",
    },
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("symptoms.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("symptoms.subtitle")}</p>
        </div>

        <Progress value={(step + 1) * 25} className="mb-6" />

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
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
                    {labels.reportDetails}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{labels.name}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder={labels.namePlaceholder}
                        className={cn(inputClassName, "pl-9")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {labels.symptomDate}
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={symptomDate}
                        onChange={(e) => setSymptomDate(e.target.value)}
                        className={cn(inputClassName, "pl-9")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {labels.foodEaten}
                    </label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        value={foodEaten}
                        onChange={(e) => setFoodEaten(e.target.value)}
                        placeholder={labels.foodEatenPlaceholder}
                        className={cn(inputClassName, "pl-9")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {labels.eatenAt}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        value={eatenAt}
                        onChange={(e) => setEatenAt(e.target.value)}
                        placeholder={labels.eatenAtPlaceholder}
                        className={cn(inputClassName, "pl-9")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {labels.remarks}
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder={labels.remarksPlaceholder}
                        rows={3}
                        className={cn(
                          inputClassName,
                          "min-h-24 resize-none pl-9",
                        )}
                      />
                    </div>
                  </div>

                  <Button onClick={handleNext} className="w-full">
                    {t("common.next")} <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === "ms"
                      ? "Pilih gejala anda:"
                      : "Select your symptoms:"}
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
                            "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm",
                            isSelected
                              ? "border-primary bg-accent"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="font-medium">
                            {t(`symptoms.symptomList.${symptom.id}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="w-4 h-4" /> {t("common.back")}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={selectedSymptoms.length === 0}
                    >
                      {t("common.next")} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("symptoms.questions.duration")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDuration(option.value)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                          duration === option.value
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <Clock
                          className={cn(
                            "w-4 h-4",
                            duration === option.value
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span>{getDurationLabel(option.value)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="w-4 h-4" /> {t("common.back")}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!duration || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          {labels.submitting}
                        </>
                      ) : (
                        <>
                          {t("common.submit")}{" "}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{labels.submitted}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center border ${resultConfig[result].className}`}
                  >
                    {React.createElement(resultConfig[result].icon, {
                      className: "w-6 h-6",
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {labels.reportId}:{" "}
                    <span className="font-medium text-foreground">
                      {reportId}
                    </span>
                  </p>
                  <Button variant="outline" onClick={handleRestart}>
                    {t("common.restart")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
