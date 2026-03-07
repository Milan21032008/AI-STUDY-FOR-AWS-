
"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/hooks/use-app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, User, MessageCircle, Loader2, School, Baby, Reply, Inbox, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

// Simple, clear demo messages
const DEMO_INCOMING_MESSAGES: Partial<Conversation>[] = [
  {
    id: "demo-msg-1",
    senderId: "student-1",
    senderName: "Aryan Khan",
    senderClass: "7A",
    role: "Child",
    rephrased: "I am having some difficulty understanding the new geometry concepts. Could you please provide some extra guidance?",
    timestamp: Date.now() - 3600000,
    sentiment: "Neutral"
  },
  {
    id: "demo-msg-2",
    senderId: "parent-1",
    senderName: "Mrs. Patil",
    role: "Parent",
    rephrased: "Thank you for the update on Rahul's progress. I will ensure he completes his science project.",
    timestamp: Date.now() - 7200000,
    sentiment: "Positive"
  },
  {
    id: "demo-msg-3",
    senderId: "student-2",
    senderName: "Sana Sheikh",
    senderClass: "8B",
    role: "Child",
    rephrased: "I missed the last class. Is there any homework I need to catch up on?",
    timestamp: Date.now() - 10800000,
    sentiment: "Neutral"
  },
  {
    id: "demo-msg-4",
    senderId: "parent-2",
    senderName: "Mr. Iyer",
    role: "Parent",
    rephrased: "I would like to schedule a brief meeting to discuss my daughter's recent exam results.",
    timestamp: Date.now() - 18000000,
    sentiment: "Neutral"
  }
];

export function TeacherDashboard() {
  const { history, userProfile, sendReply } = useAppContext();
  const [replyText, setReplyText] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const allIncoming = useMemo(() => {
    const realIncoming = history.filter(
      (conv) => conv.receiverId === userProfile?.id && conv.role !== 'Teacher'
    );
    
    const combined = [...realIncoming];
    DEMO_INCOMING_MESSAGES.forEach(demo => {
      if (!combined.some(real => real.id === demo.id)) {
        combined.push(demo as Conversation);
      }
    });

    return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [history, userProfile?.id]);

  const studentMessages = allIncoming.filter(m => m.role === 'Child');
  const parentMessages = allIncoming.filter(m => m.role === 'Parent');

  const sentResponses = history.filter(
    (conv) => conv.senderId === userProfile?.id && conv.role === 'Teacher'
  );

  const selectedConversation = allIncoming.find(m => m.id === selectedConversationId);

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;
    setIsSending(true);
    try {
      await sendReply(selectedConversation.senderId, selectedConversation.senderName, replyText);
      setReplyText("");
      setSelectedConversationId(null);
      toast({
        title: "Reply Sent",
        description: `Your response has been sent to ${selectedConversation.senderName}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const MessageList = ({ messages, emptyLabel }: { messages: Conversation[], emptyLabel: string }) => (
    <ScrollArea className="h-[350px] px-2 py-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
          <Inbox className="size-12 mb-2" />
          <p className="text-sm font-bold uppercase tracking-widest">{emptyLabel}</p>
        </div>
      ) : (
        <div className="space-y-4 pr-4">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => setSelectedConversationId(msg.id)}
              className={cn(
                "w-full text-left p-5 rounded-2xl border transition-all duration-300",
                selectedConversationId === msg.id
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20 scale-[1.02] shadow-lg"
                  : "bg-white/40 border-primary/5 hover:bg-white/60 shadow-sm"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    msg.role === 'Parent' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {msg.role === 'Parent' ? <User className="size-3" /> : <Baby className="size-3" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tight text-foreground/80">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {msg.role} {msg.senderClass ? `• Class ${msg.senderClass}` : ""}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                  {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true }) : "Just now"}
                </span>
              </div>
              <p className="text-base font-bold text-foreground leading-tight italic line-clamp-2">
                "{msg.rephrased}"
              </p>
            </button>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  return (
    <div className="flex flex-col flex-1 space-y-8 pb-12 animate-fade-in">
      <header className="text-center space-y-1 py-6 border-b border-primary/10">
        <h2 className="text-2xl font-black tracking-tight text-primary uppercase tracking-widest">SETU COMMUNICATION</h2>
        <div className="flex items-center justify-center gap-2">
            <School className="size-3 text-muted-foreground" />
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Teacher Dashboard</p>
        </div>
      </header>

      <section className="space-y-4">
        <Tabs defaultValue="students" className="w-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                1️⃣ Message Inbox
            </h3>
            <TabsList className="bg-primary/5 rounded-full h-10 p-1">
              <TabsTrigger value="students" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                Students ({studentMessages.length})
              </TabsTrigger>
              <TabsTrigger value="parents" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                Parents ({parentMessages.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <Card className="border-primary/10 shadow-xl rounded-[2rem] bg-white/60 backdrop-blur-md overflow-hidden">
            <CardContent className="p-4">
              <TabsContent value="students" className="m-0 border-none p-0 focus-visible:ring-0">
                <MessageList messages={studentMessages} emptyLabel="No student messages yet" />
              </TabsContent>
              <TabsContent value="parents" className="m-0 border-none p-0 focus-visible:ring-0">
                <MessageList messages={parentMessages} emptyLabel="No parent messages yet" />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            2️⃣ Sent Responses
        </h3>
        <Card className="border-primary/10 shadow-xl rounded-[2rem] bg-white/60 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
                <ScrollArea className="h-[200px] px-6 py-6">
                    {sentResponses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center opacity-40">
                        <Reply className="size-10 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No responses sent yet</p>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {sentResponses.map((msg) => (
                        <div key={msg.id} className="w-full text-left p-4 rounded-2xl border border-primary/5 bg-primary/5">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <School className="size-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                        To: {msg.receiverName}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-foreground leading-relaxed italic">"{msg.rephrased}"</p>
                        </div>
                        ))}
                    </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </section>

      <section className="space-y-4 pt-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            3️⃣ Constructive Reply
        </h3>
        <Card className="border-primary/20 border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white ring-8 ring-primary/5">
            <CardHeader className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4" />
                        {selectedConversation 
                            ? `Replying to: ${selectedConversation.senderName}` 
                            : "Select a message to respond"}
                    </div>
                    {selectedConversation && (
                         <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-white/50">{selectedConversation.role}</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <Textarea
                    placeholder={selectedConversationId 
                        ? `Type your supportive response to ${selectedConversation?.senderName}...` 
                        : "Please select a message from the Students or Parents inbox above to start your reply."}
                    className="min-h-[140px] rounded-2xl border-primary/10 bg-primary/5 focus:bg-white transition-all text-base font-medium p-4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={!selectedConversationId}
                />
                <Button
                    className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] bg-primary hover:bg-primary/90"
                    disabled={!selectedConversationId || !replyText.trim() || isSending}
                    onClick={handleSendReply}
                >
                    {isSending ? <Loader2 className="animate-spin" /> : (
                    <>
                        Send Constructive Response
                        <Send className="ml-3 size-5" />
                    </>
                    )}
                </Button>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
