
"use client";

import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut, signInAnonymously, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import type { Conversation, Role, UserProfile, TeacherProfile, RecipientProfile } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

/**
 * Utility to remove undefined values from an object recursively.
 * Firestore throws errors if it encounters 'undefined'.
 */
function sanitizeData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  } else if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitizeData(v)])
    );
  }
  return data;
}

type AppState = {
  userProfile: UserProfile | null;
  history: Conversation[];
  currentConversation: Partial<Conversation> | null;
  selectedTeacher: RecipientProfile | null;
  isOnline: boolean;
  isOnboardingComplete: boolean;
  isInitialLoading: boolean;
};

type Action =
  | { type: "SET_USER_PROFILE"; payload: UserProfile | null }
  | { type: "SET_HISTORY"; payload: Conversation[] }
  | { type: "START_CONVERSATION" }
  | { type: "UPDATE_CONVERSATION"; payload: Partial<Conversation> }
  | { type: "FINISH_CONVERSATION" }
  | { type: "SET_RECIPIENT"; payload: RecipientProfile | null }
  | { type: "SET_ONLINE_STATUS"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AppState = {
  userProfile: null,
  history: [],
  currentConversation: null,
  selectedTeacher: null,
  isOnline: true,
  isOnboardingComplete: false,
  isInitialLoading: true,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_USER_PROFILE":
      return { 
        ...state, 
        userProfile: action.payload, 
        isOnboardingComplete: !!action.payload,
        isInitialLoading: false 
      };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "START_CONVERSATION":
      return {
        ...state,
        currentConversation: { id: new Date().toISOString() },
      };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        currentConversation: { ...state.currentConversation, ...action.payload },
      };
    case "FINISH_CONVERSATION":
      return {
        ...state,
        currentConversation: null,
      };
    case "SET_RECIPIENT":
      return { ...state, selectedTeacher: action.payload };
    case "SET_ONLINE_STATUS":
      return { ...state, isOnline: action.payload };
    case "SET_LOADING":
      return { ...state, isInitialLoading: action.payload };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  startConversation: () => void;
  updateConversation: (data: Partial<Conversation>) => void;
  finishConversation: () => Promise<void>;
  setSelectedTeacher: (recipient: RecipientProfile | null) => void;
  sendReply: (receiverId: string, receiverName: string, text: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      dispatch({ type: "SET_USER_PROFILE", payload: null });
      return;
    }

    let isSubscribed = true;

    const fetchProfile = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!isSubscribed) return;

        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          dispatch({ type: "SET_USER_PROFILE", payload: { ...data, id: user.uid } });
        } else {
          dispatch({ type: "SET_USER_PROFILE", payload: null });
        }
      } catch (error) {
        if (!isSubscribed) return;
        
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    };

    fetchProfile();
    
    return () => {
      isSubscribed = false;
    };
  }, [user, isUserLoading, db]);

  useEffect(() => {
    if (!user) {
      dispatch({ type: "SET_HISTORY", payload: [] });
      return;
    }

    const qSent = query(collection(db, "conversations"), where("senderId", "==", user.uid));
    const qReceived = query(collection(db, "conversations"), where("receiverId", "==", user.uid));

    let sentMessages: Conversation[] = [];
    let receivedMessages: Conversation[] = [];

    const updateHistory = () => {
      const combined = [...sentMessages, ...receivedMessages];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);
      dispatch({ type: "SET_HISTORY", payload: sorted });
    };

    const unsubSent = onSnapshot(qSent, (snapshot) => {
      sentMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Conversation));
      updateHistory();
    }, (error) => {});

    const unsubReceived = onSnapshot(qReceived, (snapshot) => {
      receivedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Conversation));
      updateHistory();
    }, (error) => {});

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [user, db]);

  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if(typeof navigator !== 'undefined') {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: navigator.onLine });
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const completeOnboarding = useCallback(async (profile: UserProfile) => {
    let currentUser = user;
    if (!currentUser) {
      try {
        const result = await signInAnonymously(auth);
        currentUser = result.user;
      } catch (error: any) {
        if (error.code === 'auth/network-request-failed') {
          throw new Error("Network error: Please check your internet connection and try again.");
        }
        throw error;
      }
    }

    if (!currentUser) {
      throw new Error("Authentication failed. Please try again.");
    }
    
    const uid = currentUser.uid;
    const cleanProfile = sanitizeData(profile);

    const userDocRef = doc(db, "users", uid);
    const userData = sanitizeData({
      ...cleanProfile,
      id: uid,
      createdAt: new Date().toISOString(),
    });

    // Non-blocking write for main user profile
    setDoc(userDocRef, userData)
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userData
        }));
      });

    const isChild = profile.role === "Child";
    const isParent = profile.role === "Parent";
    const isTeacher = profile.role === "Teacher";
    
    const collectionName = isChild ? "students" : isParent ? "parents" : isTeacher ? "teachers" : null;

    if (!collectionName) {
      throw new Error("Invalid role selected. Please try again.");
    }

    let roleData: any = { userId: uid, name: profile.name };

    if (isChild) {
      roleData = {
        ...roleData,
        schoolName: profile.schoolName || "Setu Academy",
        gradeClass: profile.gradeClass || "7A",
        teacherIds: ["demo-teacher-1", "demo-teacher-2", "demo-teacher-3", "demo-teacher-4"]
      };
    } else if (isParent) {
      roleData = {
        ...roleData,
        childName: profile.childName,
        childClass: profile.childClass,
        childIds: [],
        authorizedTeacherIds: ["demo-teacher-1", "demo-teacher-2", "demo-teacher-3", "demo-teacher-4"]
      };
    } else if (isTeacher) {
      roleData = {
        ...roleData,
        subject: profile.subject || "General",
        schoolName: profile.schoolName || "Setu Academy",
        availableTime: "M-F 9am-3pm"
      };
    }

    const roleDocRef = doc(db, collectionName, uid);
    const sanitizedRoleData = sanitizeData(roleData);
    
    // Non-blocking write for role-specific data
    setDoc(roleDocRef, sanitizedRoleData)
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: roleDocRef.path,
          operation: 'create',
          requestResourceData: sanitizedRoleData
        }));
      });

    // Proceed with optimistic UI update immediately
    dispatch({ type: "SET_USER_PROFILE", payload: { ...cleanProfile, id: uid } });
  }, [user, auth, db]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || "Login failed. Please check your credentials.");
    }
  }, [auth]);

  const startConversation = useCallback(() => {
    dispatch({ type: "START_CONVERSATION" });
  }, []);

  const updateConversation = useCallback((data: Partial<Conversation>) => {
    dispatch({ type: "UPDATE_CONVERSATION", payload: data });
  }, []);

  const finishConversation = useCallback(async () => {
    if (!state.currentConversation || !user || !state.selectedTeacher) return;
    
    const receiverId = state.selectedTeacher.id;
    const receiverName = state.selectedTeacher.name;
    
    const rawConversation = {
      ...state.currentConversation,
      senderId: user.uid,
      senderName: state.userProfile?.name || "User",
      senderClass: state.userProfile?.gradeClass || state.userProfile?.childClass || undefined,
      receiverId: receiverId,
      receiverName: receiverName,
      timestamp: Date.now(),
      role: state.userProfile?.role || "Child",
      offlineStored: !state.isOnline,
    };

    const sanitizedConversation = sanitizeData(rawConversation);

    const convId = sanitizedConversation.id || new Date().toISOString();
    const convDocRef = doc(db, "conversations", convId);
    
    // Non-blocking write for conversations
    setDoc(convDocRef, sanitizedConversation)
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: convDocRef.path,
          operation: 'create',
          requestResourceData: sanitizedConversation
        }));
      });

    dispatch({ type: "FINISH_CONVERSATION" });
  }, [state.currentConversation, state.selectedTeacher, state.userProfile, user, db, state.isOnline]);

  const setSelectedTeacher = useCallback((recipient: RecipientProfile | null) => {
    dispatch({ type: "SET_RECIPIENT", payload: recipient });
  }, []);

  const sendReply = useCallback(async (receiverId: string, receiverName: string, text: string) => {
    if (!user || !state.userProfile) return;
    const id = new Date().toISOString();
    const reply: Partial<Conversation> = {
      id,
      timestamp: Date.now(),
      senderId: user.uid,
      senderName: state.userProfile.name,
      receiverId: receiverId,
      receiverName: receiverName,
      role: state.userProfile.role,
      transcription: text,
      rephrased: text,
      sentiment: "Positive",
      explanation: "Direct mediated response.",
      safety: {
        originalMessageSafety: { isSafe: true, flaggedKeywords: [], aiAssessment: "SAFE", isAiBlocked: false },
        reframedMessageSafety: { isSafe: true, flaggedKeywords: [], aiAssessment: "SAFE", isAiBlocked: false }
      }
    };

    const sanitizedReply = sanitizeData(reply);

    const replyDocRef = doc(db, "conversations", id);
    
    // Non-blocking write for replies
    setDoc(replyDocRef, sanitizedReply)
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: replyDocRef.path,
          operation: 'create',
          requestResourceData: sanitizedReply
        }));
      });
  }, [user, state.userProfile, db]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      dispatch({ type: "SET_USER_PROFILE", payload: null });
      dispatch({ type: "SET_HISTORY", payload: [] });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [auth, router]);

  const value = useMemo(
    () => ({
      ...state,
      completeOnboarding,
      login,
      startConversation,
      updateConversation,
      finishConversation,
      setSelectedTeacher,
      sendReply,
      logout,
    }),
    [state, completeOnboarding, login, startConversation, updateConversation, finishConversation, setSelectedTeacher, sendReply, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
