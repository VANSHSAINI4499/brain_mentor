import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';

// TODO: Set USE_MOCKS to false once Firebase Auth is enabled
const USE_MOCKS = true;
const MOCK_DELAY = 1000;

export interface AppUser {
  uid: string;
  email: string | null;
}

type AuthStateCallback = (user: AppUser | null) => void;

interface AuthService {
  signIn: (email: string, pass: string) => Promise<AppUser>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: AuthStateCallback) => () => void;
}

// Global mock state
let mockCurrentUser: AppUser | null = null;
const mockSubscribers: Set<AuthStateCallback> = new Set();

const notifySubscribers = () => {
  mockSubscribers.forEach((cb) => cb(mockCurrentUser));
};

const mockAuthService: AuthService = {
  signIn: async (email: string, pass: string) => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    if (email === 'admin@example.com' && pass === 'admin123') {
      const user = { uid: 'mock-admin-123', email: 'admin@example.com' };
      mockCurrentUser = user;
      notifySubscribers();
      return user;
    }
    throw new Error('Invalid email or password');
  },
  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    mockCurrentUser = null;
    notifySubscribers();
  },
  onAuthStateChanged: (callback: AuthStateCallback) => {
    mockSubscribers.add(callback);
    // Immediately invoke with current state
    callback(mockCurrentUser);
    return () => mockSubscribers.delete(callback);
  }
};

const firebaseAuthService: AuthService = {
  signIn: async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return { uid: cred.user.uid, email: cred.user.email };
  },
  signOut: async () => {
    await firebaseSignOut(auth);
  },
  onAuthStateChanged: (callback: AuthStateCallback) => {
    return firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        callback({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        callback(null);
      }
    });
  }
};

export const authService: AuthService = USE_MOCKS ? mockAuthService : firebaseAuthService;
