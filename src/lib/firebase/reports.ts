import { db } from "./config";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export interface ReportHistoryEntry {
  status: ReportStatus;
  timestamp: number;
  admin_remarks: string;
}

export type ReportStatus =
  | "Open"
  | "Pending Visit"
  | "Action Taken"
  | "Resolved"
  | "Rejected";

export interface Report {
  id: string;
  type?: "restaurant" | "symptom";
  image: string; // Base64
  location: string;
  remarks: string;
  createdAt: number;
  history: ReportHistoryEntry[];
  reporterName?: string;
  reporterEmail?: string;
  symptomDate?: string;
  foodEaten?: string;
  eatenAt?: string;
  symptoms?: string[];
  symptomDuration?: string;
  symptomSeverity?: "mild" | "moderate" | "severe";
}

export const submitReport = async (
  image: string,
  location: string,
  remarks: string,
  reporterEmail?: string,
): Promise<string> => {
  const newReport = {
    type: "restaurant",
    image,
    location,
    remarks,
    reporterEmail: reporterEmail || "",
    createdAt: Date.now(),
    history: [
      {
        status: "Open",
        timestamp: Date.now(),
        admin_remarks: "System: Report submitted successfully.",
      },
    ],
  };

  const docRef = await addDoc(collection(db, "reports"), newReport);
  return docRef.id;
};

export interface SymptomReportInput {
  reporterName: string;
  symptomDate: string;
  foodEaten: string;
  eatenAt: string;
  symptoms: string[];
  symptomDuration: string;
  symptomSeverity: "mild" | "moderate" | "severe";
  remarks: string;
}

export const submitSymptomReport = async (
  input: SymptomReportInput,
): Promise<string> => {
  const now = Date.now();
  const newReport = {
    type: "symptom",
    image: "",
    location: input.eatenAt,
    remarks: input.remarks,
    createdAt: now,
    reporterName: input.reporterName,
    symptomDate: input.symptomDate,
    foodEaten: input.foodEaten,
    eatenAt: input.eatenAt,
    symptoms: input.symptoms,
    symptomDuration: input.symptomDuration,
    symptomSeverity: input.symptomSeverity,
    history: [
      {
        status: "Open",
        timestamp: now,
        admin_remarks: "System: Symptom report submitted successfully.",
      },
    ],
  };

  const docRef = await addDoc(collection(db, "reports"), newReport);
  return docRef.id;
};

export const listenToReports = (callback: (reports: Report[]) => void) => {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const reportsList = snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as Report,
    );

    callback(reportsList);
  });
};

export const listenToRestaurantReports = (
  callback: (reports: Report[]) => void,
) => {
  const q = query(collection(db, "reports"), where("type", "==", "restaurant"));

  return onSnapshot(q, (snapshot) => {
    const reportsList = snapshot.docs
      .map(
        (docSnap) =>
          ({
            id: docSnap.id,
            ...docSnap.data(),
          }) as Report,
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(reportsList);
  });
};

export const updateReportStatus = async (
  reportId: string,
  newStatus: ReportStatus,
  adminRemarks: string,
) => {
  const reportRef = doc(db, "reports", reportId);
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
    throw new Error("Report not found");
  }
};
