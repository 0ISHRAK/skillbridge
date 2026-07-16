"use client";

import { useState, useEffect, useRef } from "react";

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

export default function MessagesDashboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Get current user id
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.id) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch("/api/messages/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
          if (data.conversations?.length > 0) {
            setActiveConv(data.conversations[0]);
          }
        }
      } catch {
        // silent
      } finally {
        setIsLoadingConvs(false);
      }
    }
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    async function loadMessages() {
      setIsLoadingMsgs(true);
      try {
        const res = await fetch(`/api/messages?userId=${activeConv!.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          // mark as read locally
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConv!.id ? { ...c, unreadCount: 0 } : c))
          );
        }
      } catch {
        // silent
      } finally {
        setIsLoadingMsgs(false);
      }
    }
    loadMessages();
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

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeConv.id, content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.sentMessage]);
        // refresh conversation list
        const convsRes = await fetch("/api/messages/conversations");
        if (convsRes.ok) {
          const convsData = await convsRes.json();
          setConversations(convsData.conversations || []);
        }
      }
    } catch {
      // silent
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex-1 flex bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-scale-up">
      {/* Left Pane: Conversations List */}
      <div className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/20">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Messages</h2>
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
              <p className="text-[10px] text-muted-foreground mt-1">Book a session to start messaging your mentor.</p>
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
                      {c.latestMessage.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-card">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
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

          <div ref={chatBoxRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/25">
            {isLoadingMsgs ? (
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
                    <div className={`inline-block p-3 rounded-2xl text-xs leading-normal max-w-[70%] ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border/40"
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[8px] text-muted-foreground font-semibold">{formatTime(msg.createdAt)}</p>
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
