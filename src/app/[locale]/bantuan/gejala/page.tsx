"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";

export default function SymptomReportRedirect() {
  const router = useRouter();
  const locale = useLocale();
  const localePath = locale === "ms" ? "" : `/${locale}`;

  useEffect(() => {
    router.replace(`${localePath}/reports/new?tab=symptom`);
  }, [router, localePath]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
      Redirecting to the Symptom Report...
    </div>
  );
}
