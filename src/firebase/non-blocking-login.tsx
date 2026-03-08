'use client';
import { Auth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export function initiateAnonymousSignIn(authInstance: Auth, onError?: (errorMessage: string) => void): void {
  try {
    if (!authInstance) throw new Error("Firebase Auth miss ho gaya hai! Vercel environment variables check karein.");
    signInAnonymously(authInstance).catch((error) => {
      if (onError) onError(error.message); 
    });
  } catch (err: any) {
    if (onError) onError(err.message);
  }
}

export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: (errorMessage: string) => void): void {
  try {
    if (!authInstance) throw new Error("Firebase Auth config fail ho gaya. Env variables check karein.");
    createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
      if (onError) onError(error.message); 
    });
  } catch (err: any) {
    if (onError) onError(err.message);
  }
}

export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: (errorMessage: string) => void): void {
  try {
    if (!authInstance) throw new Error("Firebase Auth config fail ho gaya. Env variables check karein.");
    signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
      if (onError) onError(error.message); 
    });
  } catch (err: any) {
    if (onError) onError(err.message);
  }
}