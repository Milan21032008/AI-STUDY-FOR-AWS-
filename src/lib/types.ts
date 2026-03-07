
export type Role = "Child" | "Parent" | "Teacher";

export type Sentiment = "Negative" | "Neutral" | "Positive";

export type EducationLevel = 
  | "1-5" 
  | "6-8" 
  | "9-12" 
  | "Primary School" 
  | "Secondary School" 
  | "Graduate" 
  | "Post Graduate";

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  language: string;
  educationLevel?: EducationLevel;
  email?: string;
  schoolName?: string;
  gradeClass?: string;
  subject?: string;
  teacherIds?: string[];
  authorizedTeacherIds?: string[];
  childName?: string;
  childClass?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  subject: string;
  schoolName: string;
  availableTime: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface RecipientProfile {
  id: string;
  name: string;
  role: Role;
  subtext?: string;
  secondaryText?: string;
}

export interface MessageSafetyAssessment {
  isSafe: boolean;
  flaggedKeywords: string[];
  aiAssessment: string;
  isAiBlocked: boolean;
}

export interface MessageSafetyCheckOutput {
  originalMessageSafety: MessageSafetyAssessment;
  reframedMessageSafety: MessageSafetyAssessment;
}

export interface Conversation {
  id: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  senderClass?: string;
  receiverId: string;
  receiverName: string;
  role: Role;
  audioDataUri?: string;
  textMessage?: string;
  transcription: string;
  rephrased: string;
  sentiment: Sentiment;
  explanation: string;
  safety: MessageSafetyCheckOutput;
  offlineStored?: boolean;
}
