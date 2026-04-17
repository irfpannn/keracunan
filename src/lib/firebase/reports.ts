import { db } from './config';
import { collection, addDoc, onSnapshot, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';

export interface ReportHistoryEntry {
  status: 'Open' | 'Pending Visit' | 'Action Taken' | 'Resolved' | 'Rejected';
  timestamp: number;
  admin_remarks: string;
}

export interface Report {
  id: string;
  image: string; // Base64
  location: string;
  remarks: string;
  createdAt: number;
  history: ReportHistoryEntry[];
}

export const submitReport = async (
  image: string,
  location: string,
  remarks: string
): Promise<string> => {
  const newReport = {
    image,
    location,
    remarks,
    createdAt: Date.now(),
    history: [
      {
        status: 'Open',
        timestamp: Date.now(),
        admin_remarks: 'System: Report submitted successfully.',
      },
    ],
  };

  const docRef = await addDoc(collection(db, 'reports'), newReport);
  return docRef.id;
};

export const listenToReports = (callback: (reports: Report[]) => void) => {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const reportsList = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Report));
    
    callback(reportsList);
  });
};

export const updateReportStatus = async (
  reportId: string,
  newStatus: 'Open' | 'Pending Visit' | 'Action Taken' | 'Resolved' | 'Rejected',
  adminRemarks: string
) => {
  const reportRef = doc(db, 'reports', reportId);
  const snapshot = await getDoc(reportRef);
  
  if (snapshot.exists()) {
    const report = snapshot.data();
    const newEntry: ReportHistoryEntry = {
      status: newStatus,
      timestamp: Date.now(),
      admin_remarks: adminRemarks || `Status updated to ${newStatus}`,
    };
    
    const newHistory = [...(report.history || []), newEntry];
    
    await updateDoc(reportRef, { history: newHistory });
  } else {
    throw new Error('Report not found');
  }
};
