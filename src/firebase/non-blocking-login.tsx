
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError?: (errorMessage: string) => void): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous Auth Error:", error.message);
    if (onError) onError(error.message);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: (errorMessage: string) => void): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Sign Up Error:", error.message);
    if (onError) onError(error.message);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: (errorMessage: string) => void): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Sign In Error:", error.message);
    if (onError) onError(error.message);
  });
}
