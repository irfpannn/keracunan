'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useAdminAuth } from '@/lib/firebase/auth';
import { useTranslations } from 'next-intl';
import { listenToReports, updateReportStatus, Report } from '@/lib/firebase/reports';
import { formatDistanceToNow } from 'date-fns';
import { 
  LogOut, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ClipboardList,
  Loader2,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ReportModal({ 
  report, 
  currentStatus, 
  onSave 
}: { 
  report: Report; 
  currentStatus: string;
  onSave: (id: string, status: any, remarks: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('reports.admin_dashboard');
  const tStatus = useTranslations('reports.admin_dashboard.statuses');
  const [newStatus, setNewStatus] = useState<any>(currentStatus || 'Open');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  // Sync state if modal opens
  useEffect(() => {
    if (open) {
      setNewStatus(currentStatus || 'Open');
      setAdminRemarks('');
    }
  }, [open, currentStatus]);

  const handleSave = async () => {
    setUpdating(true);
    await onSave(report.id, newStatus, adminRemarks);
    setUpdating(false);
    setOpen(false); // Close the modal upon saving
  };

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
          <DialogTitle>{t('modal_title')}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Image */}
          <div className="h-64 bg-gray-100 rounded-xl overflow-hidden relative">
            {report.image ? (
              <img src={report.image} alt="Report" className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Image Provided</div>
            )}
            <div className="absolute top-3 right-3 flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur shadow-sm">
              <span className={`mr-1.5 w-2.5 h-2.5 rounded-full ${
                currentStatus === 'Action Taken' || currentStatus === 'Resolved' ? 'bg-green-500' :
                currentStatus === 'Rejected' ? 'bg-red-500' : 
                currentStatus === 'Open' ? 'bg-blue-500' : 'bg-amber-500'
              }`} />
              {tStatus(currentStatus as any) || currentStatus}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-red-500" /> Location
              </h4>
              <p className="text-sm text-gray-600">{report.location}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> Date Submitted
              </h4>
              <p className="text-sm text-gray-600">
                {new Date(report.createdAt).toLocaleString()}
                <span className="text-gray-400 ml-1">
                  ({formatDistanceToNow(report.createdAt, { addSuffix: true })})
                </span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('user_remarks')}</h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700 italic">"{report.remarks}"</p>
            </div>
          </div>

          {/* Update State */}
          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('update_status')}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('new_status_label')}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-sm rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 bg-white border p-3"
                >
                  <option value="Open">{tStatus('Open')}</option>
                  <option value="Pending Visit">{tStatus('Pending Visit')}</option>
                  <option value="Action Taken">{tStatus('Action Taken')}</option>
                  <option value="Resolved">{tStatus('Resolved')}</option>
                  <option value="Rejected">{tStatus('Rejected')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin_remarks_label')}</label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  rows={3}
                  placeholder={t('admin_remarks_placeholder')}
                  className="w-full text-sm rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-3 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                  disabled={updating}
                >
                  {t('cancel_btn')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition flex items-center justify-center min-w-[100px]"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboardPage() {
  const { user, loading, signOut } = useAdminAuth();
  const router = useRouter();
  const t = useTranslations('reports.admin_dashboard');
  const tStatus = useTranslations('reports.admin_dashboard.statuses');

  const [reports, setReports] = useState<Report[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
      return;
    }

    if (user) {
      const unsubscribe = listenToReports((data) => {
        setReports(data);
        setDataLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleSaveStatusUpdate = async (reportId: string, newStatus: any, adminRemarks: string) => {
    try {
      await updateReportStatus(reportId, newStatus, adminRemarks);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status.');
    }
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Admin Header */}
      <div className="max-w-6xl mx-auto mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('signout')}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {dataLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{t('no_reports_title')}</h3>
            <p className="text-gray-500 mt-1">{t('no_reports_subtitle')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Submitted</th>
                    <th className="px-6 py-4 font-medium">Remarks</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-center">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => {
                    const histories = report.history || [];
                    const latestEntry = histories[histories.length - 1];
                    const currentStatus = latestEntry ? latestEntry.status : 'Open';

                    return (
                      <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            {report.image && (
                              <img src={report.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-900 text-sm max-w-[200px] truncate" title={report.location}>
                              {report.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-sm text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(report.createdAt, { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 align-middle text-sm text-gray-600 max-w-xs truncate" title={report.remarks}>
                          {report.remarks}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            currentStatus === 'Action Taken' || currentStatus === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                            currentStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                              currentStatus === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {tStatus(currentStatus as any) || currentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <ReportModal 
                            report={report} 
                            currentStatus={currentStatus} 
                            onSave={handleSaveStatusUpdate} 
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
    </div>
  );
}
