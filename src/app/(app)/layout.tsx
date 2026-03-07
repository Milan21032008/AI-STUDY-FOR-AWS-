"use client";

import { BackButton } from "@/components/back-button";
import { History, LayoutDashboard, MessageCircle, Volume2, Pause, Loader2, User, Baby, Reply } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { useAppContext } from "@/hooks/use-app-context";
import { useState, useRef, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { getTranslatedSpeech } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SettingsDialog } from "@/components/settings-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const titles: { [key: string]: string } = {
  "/record": "",
  "/processing": "Processing",
  "/result": "Mediated Message",
  "/history": "Communication Logs",
  "/select-teacher": "Select Recipient",
  "/dashboard": "Dashboard",
};

const DEMO_STUDENT_MESSAGES = [
  {
    id: "demo-s-1",
    senderId: "Aryan-Khan",
    senderName: "Aryan Khan",
    rephrased: "I am having some difficulty understanding the new geometry concepts. Could you please provide some extra guidance?",
    timestamp: Date.now() - 3600000,
    role: "Child"
  },
  {
    id: "demo-s-2",
    senderId: "Sana-Sheikh",
    senderName: "Sana Sheikh",
    rephrased: "I missed the last class. Is there any homework I need to catch up on?",
    timestamp: Date.now() - 10800000,
    role: "Child"
  }
];

const DEMO_PARENT_MESSAGES = [
  {
    id: "demo-p-1",
    senderId: "Mrs-Patil",
    senderName: "Mrs. Patil",
    rephrased: "Thank you for the update on Rahul's progress. I will ensure he completes his science project.",
    timestamp: Date.now() - 7200000,
    role: "Parent"
  },
  {
    id: "demo-p-2",
    senderId: "Mr-Iyer",
    senderName: "Mr. Iyer",
    rephrased: "I would like to schedule a brief meeting to discuss my daughter's recent exam results.",
    timestamp: Date.now() - 18000000,
    role: "Parent"
  }
];

const DEMO_TEACHER_RESPONSES = [
  {
    id: "demo-t-1",
    senderId: "demo-teacher-1",
    senderName: "Mrs. Sharma",
    rephrased: "I would be happy to help you with those concepts after class today. Let's meet at 3 PM in the library.",
    timestamp: Date.now() - 3600000,
    role: "Teacher"
  },
  {
    id: "demo-t-2",
    senderId: "demo-teacher-2",
    senderName: "Mr. Verma",
    rephrased: "Your recent work on the science assignment was excellent! I've shared some additional resources in the portal.",
    timestamp: Date.now() - 86400000,
    role: "Teacher"
  }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, history, setSelectedTeacher } = useAppContext();
  const { toast } = useToast();
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isRecordPage = pathname === '/record';
  const isProcessingPage = pathname === '/processing';
  const isDashboardPage = pathname === '/dashboard';
  
  const title = titles[pathname] || "SETU";

  const isTeacher = userProfile?.role === 'Teacher';
  
  const studentMessages = useMemo(() => {
    const real = history.filter(c => c.receiverId === userProfile?.id && c.role === 'Child');
    return real.length > 0 ? real : DEMO_STUDENT_MESSAGES;
  }, [history, userProfile?.id]);

  const parentMessages = useMemo(() => {
    const real = history.filter(c => c.receiverId === userProfile?.id && c.role === 'Parent');
    return real.length > 0 ? real : DEMO_PARENT_MESSAGES;
  }, [history, userProfile?.id]);

  const teacherResponses = useMemo(() => {
    const real = history.filter(c => c.receiverId === userProfile?.id && c.role === 'Teacher');
    return real.length > 0 ? real : DEMO_TEACHER_RESPONSES;
  }, [history, userProfile?.id]);

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (playingId === messageId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    setLoadingAudioId(messageId);
    try {
      const lang = userProfile?.language || "English";
      const { audioDataUri } = await getTranslatedSpeech(text, lang);
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        setPlayingId(messageId);
        audioRef.current.onended = () => setPlayingId(null);
      }
    } catch (error) {
      toast({ title: "Audio Error", description: "Could not play audio.", variant: "destructive" });
    } finally {
      setLoadingAudioId(null);
    }
  };

  const handleReplyAction = (msg: any) => {
    if (isTeacher) {
      router.push('/dashboard');
      toast({
        title: "Replying to " + msg.senderName,
        description: "Please use the dashboard reply section.",
      });
    } else {
      setSelectedTeacher({ 
        id: msg.senderId, 
        name: msg.senderName, 
        role: "Teacher",
        subtext: "Teacher", 
        secondaryText: "Setu Academy"
      });
      router.push('/dashboard');
      toast({
        title: "Replying to " + msg.senderName,
        description: "Directing you to the mediated reply area.",
      });
    }
  };

  const MessageList = ({ messages }: { messages: any[] }) => (
    <div className="space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              {msg.senderName}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground">
              {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true }) : "Recent"}
            </span>
          </div>
          <p className="text-sm font-bold text-foreground leading-snug mb-3 italic">"{msg.rephrased}"</p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" size="sm" className="h-8 rounded-full text-[10px] font-bold flex items-center justify-center gap-2 flex-1"
              onClick={() => handlePlayAudio(msg.id, msg.rephrased)}
              disabled={loadingAudioId === msg.id}
            >
              {loadingAudioId === msg.id ? <Loader2 className="size-3 animate-spin" /> : playingId === msg.id ? <Pause className="size-3 fill-current" /> : <Volume2 className="size-3" />}
              {playingId === msg.id ? "Stop" : "Listen"}
            </Button>
            <Button 
              variant="default" size="sm" className="h-8 rounded-full text-[10px] font-bold flex items-center justify-center gap-2 flex-1"
              onClick={() => handleReplyAction(msg)}
            >
              <Reply className="size-3" />
              Reply
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("flex min-h-screen flex-col", isRecordPage && "bg-record-gradient")}>
      <audio ref={audioRef} className="hidden" />
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 safe-top transition-all duration-300",
        isRecordPage ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b"
      )}>
        <div className="mx-auto flex h-full max-w-md items-center justify-between px-4">
          <div className="w-1/4">
            <BackButton />
          </div>
          
          <div className="flex-grow flex justify-center text-center">
            {isRecordPage ? (
              <Select defaultValue="english">
                <SelectTrigger className="w-32 h-9 bg-white/60 border-none rounded-full px-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="gujarati">Gujarati</SelectItem>
                  <SelectItem value="marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <h1 className="text-sm font-black uppercase tracking-widest text-foreground truncate px-2">
                {title}
              </h1>
            )}
          </div>

          <div className="w-1/4 flex justify-end gap-1">
            {userProfile && !isProcessingPage && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full transition-all active:scale-90 hover:bg-primary/5">
                    <MessageCircle className="size-5 text-primary" />
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs rounded-l-[2rem] border-none shadow-2xl p-0">
                  <SheetHeader className="p-6 border-b border-primary/5">
                    <SheetTitle className="text-sm font-black uppercase tracking-widest text-primary">
                      {isTeacher ? "Message Inboxes" : "Teacher Responses"}
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-80px)] px-4 py-6">
                    {isTeacher ? (
                      <Tabs defaultValue="students" className="w-full">
                        <TabsList className="grid grid-cols-2 bg-primary/5 rounded-full mb-6">
                          <TabsTrigger value="students" className="rounded-full text-[10px] font-black uppercase">Students</TabsTrigger>
                          <TabsTrigger value="parents" className="rounded-full text-[10px] font-black uppercase">Parents</TabsTrigger>
                        </TabsList>
                        <TabsContent value="students" className="mt-0">
                          <MessageList messages={studentMessages} />
                        </TabsContent>
                        <TabsContent value="parents" className="mt-0">
                          <MessageList messages={parentMessages} />
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <MessageList messages={teacherResponses} />
                    )}
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}

            {!isRecordPage && !isProcessingPage && !isDashboardPage && (
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full transition-all active:scale-90 hover:bg-primary/5">
                  <LayoutDashboard className="size-5 text-muted-foreground" />
              </Button>
            )}
            
            {!isRecordPage && !isProcessingPage && (
              <Button variant="ghost" size="icon" onClick={() => router.push('/history')} className="rounded-full transition-all active:scale-90 hover:bg-primary/5">
                  <History className="size-5 text-muted-foreground" />
              </Button>
            )}
            
            {!isProcessingPage && <SettingsDialog />}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 flex flex-col items-center w-full">
        <div className="w-full max-w-md flex-1 flex flex-col px-4 min-h-0">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}