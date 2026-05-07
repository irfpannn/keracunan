"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { listenToReports, Report, ReportStatus } from "@/lib/firebase/reports";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Open":
      return <ClipboardList className="w-5 h-5 text-blue-500" />;
    case "Pending Visit":
      return <Clock className="w-5 h-5 text-amber-500" />;
    case "Action Taken":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "Resolved":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "Rejected":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <AlertTriangle className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Pending Visit":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Action Taken":
      return "bg-green-100 text-green-800 border-green-200";
    case "Resolved":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const statusKeys = [
  "Open",
  "Pending Visit",
  "Action Taken",
  "Resolved",
  "Rejected",
] as const;

const isReportStatus = (status: string): status is ReportStatus => {
  return statusKeys.includes(status as ReportStatus);
};

const getCurrentStatus = (report: Report): ReportStatus | "Unknown" => {
  return report.history && report.history.length > 0
    ? report.history[report.history.length - 1].status
    : "Unknown";
};

const getReportTypeLabel = (report: Report) => {
  return report.type === "symptom" ? "Symptom Report" : "Restaurant Hygiene";
};

const getPublicLocation = (report: Report) => {
  return report.type === "symptom"
    ? report.eatenAt || report.location
    : report.location;
};

const getPublicSummary = (report: Report) => {
  if (report.type === "symptom") {
    return [
      report.foodEaten ? `Food eaten: ${report.foodEaten}` : "",
      report.symptomSeverity ? `Severity: ${report.symptomSeverity}` : "",
      report.symptomDate ? `Symptom date: ${report.symptomDate}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return report.remarks;
};

const getLatestAdminRemark = (report: Report) => {
  return [...(report.history || [])]
    .reverse()
    .find(
      (entry) =>
        entry.admin_remarks && !entry.admin_remarks.startsWith("System:"),
    )?.admin_remarks;
};

function PublicReportModal({
  report,
  currentStatus,
}: {
  report: Report;
  currentStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("reports.public_feed");
  const tStatus = useTranslations("reports.admin_dashboard.statuses");
  const publicLocation = getPublicLocation(report);
  const publicSummary = getPublicSummary(report);
  const currentStatusLabel = isReportStatus(currentStatus)
    ? tStatus(currentStatus)
    : currentStatus;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="View Details"
          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <Eye className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("modal_title")}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Image */}
          <div className="h-56 w-full bg-gray-100 rounded-xl relative overflow-hidden group">
            {report.image ? (
              <img
                src={report.image}
                alt="Report image"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <AlertTriangle className="text-gray-300 w-12 h-12" />
              </div>
            )}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border bg-white/90 backdrop-blur-sm">
              {getStatusIcon(currentStatus)}
              <span className="text-gray-700">{currentStatusLabel}</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <ClipboardList className="w-4 h-4 mr-1.5 text-red-500" />{" "}
                {t("col_type")}
              </h4>
              <p className="text-sm text-gray-600">
                {getReportTypeLabel(report)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-red-500" />{" "}
                {t("col_location")}
              </h4>
              <p className="text-sm text-gray-600">{publicLocation || "-"}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />{" "}
                {t("col_submitted")}
              </h4>
              <p className="text-sm text-gray-600">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {report.type === "symptom"
                ? t("public_details")
                : t("user_remarks")}
            </h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700">{publicSummary || "-"}</p>
            </div>
          </div>

          {/* Timeline UI */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("history")}
            </h4>
            <div className="space-y-4">
              {report.history?.map((entry, index) => (
                <div key={index} className="flex gap-3 relative">
                  {/* Timeline Line connecting dots */}
                  {index !== report.history.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-[-16px] w-[2px] bg-gray-100" />
                  )}

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center z-10 flex-shrink-0 mt-0.5 border-2 ${
                      entry.status === "Open"
                        ? "bg-blue-50 border-blue-200 text-blue-500"
                        : entry.status === "Pending Visit"
                          ? "bg-amber-50 border-amber-200 text-amber-500"
                          : entry.status === "Action Taken"
                            ? "bg-green-50 border-green-200 text-green-500"
                            : entry.status === "Resolved"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-500"
                              : "bg-red-50 border-red-200 text-red-500"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${getStatusColor(entry.status)} inline-block w-fit`}
                      >
                        {tStatus(entry.status)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.admin_remarks && (
                      <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 p-2 rounded border border-gray-100">
                        {entry.admin_remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PublicReportsFeed() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("reports.public_feed");
  const tStatus = useTranslations("reports.admin_dashboard.statuses");

  useEffect(() => {
    const unsubscribe = listenToReports((data) => {
      setReports(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 mt-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h1>
        <p className="text-gray-500">{t("subtitle")}</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {t("no_reports_title")}
          </h3>
          <p className="text-gray-500">{t("no_reports_subtitle")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">{t("col_type")}</th>
                  <th className="px-6 py-4 font-medium">{t("col_location")}</th>
                  <th className="px-6 py-4 font-medium">
                    {t("col_submitted")}
                  </th>
                  <th className="px-6 py-4 font-medium">{t("col_remarks")}</th>
                  <th className="px-6 py-4 font-medium">{t("col_status")}</th>
                  <th className="px-6 py-4 font-medium text-center">
                    {t("col_timeline")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const currentStatus = getCurrentStatus(report);
                  const publicLocation = getPublicLocation(report);
                  const publicSummary = getPublicSummary(report);
                  const latestAdminRemark = getLatestAdminRemark(report);
                  const currentStatusLabel = isReportStatus(currentStatus)
                    ? tStatus(currentStatus)
                    : currentStatus;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            report.type === "symptom"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {getReportTypeLabel(report)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          {report.image ? (
                            <img
                              src={report.image}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center border border-gray-100">
                              <AlertTriangle className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <span
                            className="font-medium text-gray-900 text-sm max-w-[200px] truncate"
                            title={publicLocation}
                          >
                            {publicLocation || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(report.createdAt, {
                          addSuffix: true,
                        })}
                      </td>
                      <td
                        className="px-6 py-4 align-middle text-sm text-gray-600 max-w-xs"
                        title={latestAdminRemark || publicSummary}
                      >
                        <p className="truncate">{publicSummary || "-"}</p>
                        {latestAdminRemark && (
                          <p className="mt-1 truncate text-xs text-gray-500">
                            Admin: {latestAdminRemark}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(currentStatus)}`}
                        >
                          {currentStatusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <PublicReportModal
                          report={report}
                          currentStatus={currentStatus}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
