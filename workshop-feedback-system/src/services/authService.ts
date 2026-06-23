import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';

export interface AppUser {
  uid: string;
  email: string | null;
}

export type AuthStateCallback = (user: AppUser | null) => void;

export interface AuthService {
  signIn: (email: string, pass: string) => Promise<AppUser>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: AuthStateCallback) => () => void;
}

const firebaseAuthService: AuthService = {
  signIn: async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return { uid: cred.user.uid, email: cred.user.email };
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      console.error("Error Code:", error.code);

      switch (error.code) {
        case "auth/invalid-credential":
          throw new Error("Invalid email or password.");
        case "auth/user-not-found":
          throw new Error("No account exists with this email.");
        case "auth/wrong-password":
          throw new Error("Incorrect password.");
        case "auth/invalid-email":
          throw new Error("Please enter a valid email address.");
        case "auth/too-many-requests":
          throw new Error("Too many failed attempts. Please try again later.");
        case "auth/network-request-failed":
          throw new Error("Network error. Check your internet connection.");
        default:
          throw new Error(`Firebase Auth Error: ${error.code}`);
      }
    }
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

export const authService: AuthService = firebaseAuthService;
