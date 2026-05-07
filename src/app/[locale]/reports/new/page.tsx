"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import { submitReport } from "@/lib/firebase/reports";
import {
  UploadCloud,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  Mail,
} from "lucide-react";
import SymptomReport from "@/components/reports/SymptomReport";

export default function ReportRestaurantPage() {
  const router = useRouter();
  const t = useTranslations("reports.public_new");

  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "symptom" ? "symptom" : "hygiene";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [location, setLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"hygiene" | "symptom">(initialTab);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "symptom" || tab === "hygiene") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError(t("error_size"));
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!imageFile || !location || !remarks || !email) {
      setError(t("error_fill_all"));
      return;
    }

    if (!emailRegex.test(email)) {
      setError(
        t("error_invalid_email") || "Please enter a valid email address.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Compress the image before converting to base64
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(imageFile, options);
      const base64Image = await toBase64(compressedFile);

      // Save to Firebase (include reporter email)
      await submitReport(base64Image, location, remarks, email);

      // Redirect to public feed
      router.push("/reports");
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab("hygiene")}
            className={`px-4 py-2 rounded-md ${activeTab === "hygiene" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            Report Hygiene
          </button>
          <button
            onClick={() => setActiveTab("symptom")}
            className={`px-4 py-2 rounded-md ${activeTab === "symptom" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            Report Symptom
          </button>
        </div>

        {activeTab === "symptom" ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <SymptomReport />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-xl shadow-red-900/5">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("title")}
              </h1>
              <p className="text-gray-500">{t("subtitle")}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 mb-6 text-red-700 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("photo_label")}
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    imagePreview
                      ? "border-gray-200 bg-gray-50"
                      : "border-red-200 bg-red-50/50 hover:bg-red-50 cursor-pointer"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud className="w-10 h-10 text-red-500 mb-3" />
                      <span className="text-sm font-medium text-gray-700">
                        {t("photo_hint_1")}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {t("photo_hint_2")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("location_label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("location_placeholder")}
                    className="pl-10 block w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Reporter Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("email_label") || "Email"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email_placeholder") || "you@example.com"}
                    className="pl-10 block w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("remarks_label")}
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    placeholder={t("remarks_placeholder")}
                    className="pl-10 block w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("submitting_btn")}
                  </>
                ) : (
                  t("submit_btn")
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
