import { mockWorkshops } from '../data/mockWorkshops';
import type { Workshop } from '../types/workshop';
import { Timestamp } from 'firebase/firestore';

// In a real app, this would use Firebase.
// Here we use an in-memory store initialized with mock data.
let localWorkshops = [...mockWorkshops];

export const workshopService = {
  async getAllWorkshops(): Promise<Workshop[]> {
    return new Promise(resolve => setTimeout(() => resolve([...localWorkshops]), 500));
  },

  async getWorkshop(id: string): Promise<Workshop | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const found = localWorkshops.find(w => w.id === id);
        resolve(found || null);
      }, 300);
    });
  },

  async createWorkshop(workshop: Omit<Workshop, 'createdAt' | 'updatedAt'>): Promise<Workshop> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (localWorkshops.some(w => w.id === workshop.id)) {
          return reject(new Error('A workshop with this slug already exists.'));
        }
        
        const newWorkshop: Workshop = {
          ...workshop,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };
        
        localWorkshops.unshift(newWorkshop); // Add to beginning
        resolve(newWorkshop);
      }, 500);
    });
  },

  async updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = localWorkshops.findIndex(w => w.id === id);
        if (index === -1) {
          return reject(new Error('Workshop not found'));
        }

        // If updating the slug, ensure it doesn't conflict
        if (updates.id && updates.id !== id && localWorkshops.some(w => w.id === updates.id)) {
          return reject(new Error('A workshop with this new slug already exists.'));
        }

        const updatedWorkshop: Workshop = {
          ...localWorkshops[index],
          ...updates,
          updatedAt: Timestamp.fromDate(new Date()),
        };
        
        localWorkshops[index] = updatedWorkshop;
        resolve(updatedWorkshop);
      }, 500);
    });
  }
};
