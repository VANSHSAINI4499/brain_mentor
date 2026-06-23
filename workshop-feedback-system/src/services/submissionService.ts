import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface SubmitFeedbackPayload {
  workshopId: string;
  name: string;
  course: string;
  phone: string;
  email: string;
  feedback: string;
  rating?: number;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export interface Submission extends SubmitFeedbackPayload {
  id: string;
  certificateStatus: 'pending' | 'sent' | 'failed';
  emailStatus: 'pending' | 'sent' | 'failed';
  whatsappStatus: 'pending' | 'sent' | 'failed';
  submittedAt: any;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  id: string;
}

const SUBMISSIONS_COLLECTION = 'submissions';

export const submissionService = {
  submitFeedback: async (payload: SubmitFeedbackPayload): Promise<SubmitFeedbackResponse> => {
    const submissionData = {
      ...payload,
      certificateStatus: 'pending',
      emailStatus: 'pending',
      whatsappStatus: 'pending',
      submittedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionData);
    return { success: true, id: docRef.id };
  },

  getSubmissions: async (): Promise<Submission[]> => {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  getSubmissionsByWorkshop: async (workshopId: string): Promise<Submission[]> => {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('workshopId', '==', workshopId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  getSubmissionById: async (id: string): Promise<Submission | null> => {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Submission;
    }
    return null;
  }
};
