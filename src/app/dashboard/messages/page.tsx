"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Conversation {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  latestMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface MentorRecipient {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId") || searchParams.get("recipientId") || searchParams.get("mentorId");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [mentors, setMentors] = useState<MentorRecipient[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<Conversation | null>(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Get current user id
  useEffect(() => {
    fetch(`/api/auth/me?_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.id) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  // Load conversations and support query parameters
  useEffect(() => {
    let isMounted = true;

    async function loadConversations(isInitial = false) {
      try {
        const res = await fetch(`/api/messages/conversations?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          const nextConversations: Conversation[] = data.conversations || [];
          if (!isMounted) return;
          setConversations(nextConversations);

          // Handle initial selection or target URL param selection
          if (isInitial || !activeConvRef.current) {
            if (targetUserId) {
              const matched = nextConversations.find((c) => c.id === targetUserId);
              if (matched) {
                setActiveConv(matched);
              } else {
                // If not in existing conversations, fetch recipient details
                try {
                  const recRes = await fetch(`/api/messages/recipients?_t=${Date.now()}`, { cache: "no-store" });
                  if (recRes.ok) {
                    const recData = await recRes.json();
                    const recList: MentorRecipient[] = recData.recipients || [];
                    const recipient = recList.find((r) => r.id === targetUserId);
                    if (recipient) {
                      setActiveConv({
                        id: recipient.id,
                        name: recipient.name,
                        role: recipient.role,
                        avatarUrl: recipient.avatarUrl,
                        latestMessage: { content: "Start a conversation", createdAt: new Date().toISOString(), senderId: "" },
                        unreadCount: 0,
                      });
                    }
                  }
                } catch {}
              }
            } else if (nextConversations.length > 0 && !activeConvRef.current) {
              setActiveConv(nextConversations[0]);
            }
          }
        }
      } catch {
        // silent
      } finally {
        if (isMounted && isInitial) {
          setIsLoadingConvs(false);
        }
      }
    }

    void loadConversations(true);
    const interval = window.setInterval(() => {
      void loadConversations(false);
    }, 4000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [targetUserId]);

  // Fast-polling messages for the active conversation (1.5s interval for real-time responsiveness)
  useEffect(() => {
    const conversationId = activeConv?.id;
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/messages?userId=${conversationId}&_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          const fetchedMessages: Message[] = data.messages || [];
          if (!isMounted) return;

          setMessages(fetchedMessages);

          // Mark unread as zero locally and update latest message in sidebar
          if (fetchedMessages.length > 0) {
            const lastMsg = fetchedMessages[fetchedMessages.length - 1];
            setConversations((prev) =>
              prev.map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      unreadCount: 0,
                      latestMessage: {
                        content: lastMsg.content,
                        createdAt: lastMsg.createdAt,
                        senderId: lastMsg.senderId,
                      },
                    }
                  : c
              )
            );
          }
        }
      } catch {
        // silent
      } finally {
        if (isMounted) setIsLoadingMsgs(false);
      }
    }

    setIsLoadingMsgs(true);
    void loadMessages();
    const interval = window.setInterval(() => {
      void loadMessages();
    }, 1500);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [activeConv?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !activeConv || isSending) return;

    const text = inputVal.trim();
    setInputVal("");
    setIsSending(true);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId || "me",
      receiverId: activeConv.id,
      content: text,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ receiverId: activeConv.id, content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        // Replace temp message with server message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.sentMessage : m))
        );

        // Instantly refresh conversation sidebar list
        const convsRes = await fetch(`/api/messages/conversations?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (convsRes.ok) {
          const convsData = await convsRes.json();
          setConversations(convsData.conversations || []);
        }
      }
    } catch {
      // Keep optimistic message or handle error silently
    } finally {
      setIsSending(false);
    }
  };

  const openNewMessage = async () => {
    setShowNewMessage(true);
    setIsLoadingMentors(true);
    try {
      const res = await fetch(`/api/messages/recipients?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMentors(data.recipients || []);
      }
    } finally {
      setIsLoadingMentors(false);
    }
  };

  const startConversation = (mentor: MentorRecipient) => {
    const existing = conversations.find((c) => c.id === mentor.id);
    if (existing) {
      setActiveConv(existing);
    } else {
      setActiveConv({
        id: mentor.id,
        name: mentor.name,
        role: mentor.role,
        avatarUrl: mentor.avatarUrl,
        latestMessage: { content: "Start a conversation", createdAt: new Date().toISOString(), senderId: "" },
        unreadCount: 0,
      });
    }
    setMessages([]);
    setShowNewMessage(false);
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex-1 flex bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-scale-up">
      {/* Left Pane: Conversations List */}
      <div className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/20">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Messages</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live sync enabled" />
          </div>
          <button onClick={openNewMessage} className="rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            New message
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 bg-background/50">
          {isLoadingConvs ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border animate-pulse">
                  <div className="h-3 bg-accent rounded w-2/3 mb-2" />
                  <div className="h-2 bg-accent rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">No conversations yet.</p>
              <p className="text-[10px] text-muted-foreground mt-1">Use New message to contact an approved mentor.</p>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-transparent hover:bg-accent hover:border-border/40 text-muted-foreground hover:text-foreground bg-card/45"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-base overflow-hidden shrink-0">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold truncate">{c.name}</h3>
                      {c.unreadCount > 0 && !isActive && (
                        <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {c.role}
                    </p>
                    <p className={`text-[9px] truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/80"} mt-0.5`}>
                      {c.latestMessage?.content || "Start a conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {showNewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-sm font-bold">Start a new conversation</h3>
              <button onClick={() => setShowNewMessage(false)} className="text-lg font-bold text-muted-foreground hover:text-foreground">×</button>
            </div>
            {isLoadingMentors ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading mentors...</p>
            ) : mentors.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No approved mentors are available yet.</p>
            ) : (
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {mentors.map((mentor) => (
                  <button key={mentor.id} onClick={() => startConversation(mentor)} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold">
                      {mentor.avatarUrl ? <img src={mentor.avatarUrl} alt="" className="h-full w-full object-cover" /> : mentor.name.slice(0, 1)}
                    </div>
                    <div><p className="text-xs font-bold">{mentor.name}</p><p className="text-[10px] capitalize text-muted-foreground">{mentor.role.toLowerCase()}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Pane: Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                {activeConv.avatarUrl ? (
                  <img src={activeConv.avatarUrl} alt={activeConv.name} className="w-full h-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">{activeConv.name}</h3>
                <p className="text-[10px] text-muted-foreground capitalize">{activeConv.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Chat
            </div>
          </div>

          <div ref={chatBoxRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/25">
            {isLoadingMsgs && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`space-y-1 ${isMe ? "text-right" : "text-left"}`}>
                    <p className="text-[9px] uppercase font-extrabold text-muted-foreground">
                      {isMe ? "You" : activeConv.name}
                    </p>
                    <div className={`inline-block p-3 rounded-2xl text-xs leading-normal max-w-[70%] shadow-xs ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border/40"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.createdAt && (
                      <p className="text-[8px] text-muted-foreground font-semibold">{formatTime(msg.createdAt)}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-border bg-background/50 flex gap-2">
            <input
              type="text"
              placeholder={`Message ${activeConv.name}...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isSending}
              className="flex-1 text-xs p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !inputVal.trim()}
              className="px-5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "..." : "Send"}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-card">
          <div className="text-center space-y-2">
            <span className="text-4xl block">💬</span>
            <p className="text-sm font-semibold text-foreground">Select a conversation</p>
            <p className="text-xs text-muted-foreground">Choose a contact from the left to start messaging.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesDashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-card rounded-2xl">
        <p className="text-xs text-muted-foreground">Loading chat dashboard...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

