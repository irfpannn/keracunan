"use client";

import SymptomChecker from "@/components/bantuan/SymptomChecker";

export default function GejalaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20 py-8">
      <div className="container mx-auto">
        <SymptomChecker />
      </div>
    </div>
  );
}
