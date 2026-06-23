import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Workshop } from '../types/workshop';

const WORKSHOPS_COLLECTION = 'workshops';

export const workshopService = {
  async getAllWorkshops(): Promise<Workshop[]> {
    const q = query(collection(db, WORKSHOPS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Workshop));
  },

  async getWorkshopById(id: string): Promise<Workshop | null> {
    const docRef = doc(db, WORKSHOPS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Workshop;
    }
    return null;
  },

  async createWorkshop(workshopData: Omit<Workshop, 'createdAt' | 'updatedAt'>): Promise<Workshop> {
    const docRef = doc(db, WORKSHOPS_COLLECTION, workshopData.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      throw new Error('A workshop with this slug already exists.');
    }
    
    const newWorkshop = {
      ...workshopData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(docRef, newWorkshop);
    return newWorkshop as unknown as Workshop;
  },

  async updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop> {
    const docRef = doc(db, WORKSHOPS_COLLECTION, id);
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    if (updates.id && updates.id !== id) {
      // If changing ID/slug, we need to create a new doc and delete the old one
      const newDocRef = doc(db, WORKSHOPS_COLLECTION, updates.id);
      const newDocSnap = await getDoc(newDocRef);
      if (newDocSnap.exists()) {
        throw new Error('A workshop with this new slug already exists.');
      }
      
      const oldDocSnap = await getDoc(docRef);
      if (!oldDocSnap.exists()) throw new Error('Workshop not found');
      
      const mergedData = { ...oldDocSnap.data(), ...updatedData };
      await setDoc(newDocRef, mergedData);
      await deleteDoc(docRef);
      
      return { id: updates.id, ...mergedData } as Workshop;
    } else {
      await updateDoc(docRef, updatedData);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as Workshop;
    }
  },

  async deleteWorkshop(id: string): Promise<void> {
    const docRef = doc(db, WORKSHOPS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
