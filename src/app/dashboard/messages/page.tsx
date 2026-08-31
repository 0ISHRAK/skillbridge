"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

interface Recipient {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  headline?: string | null;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams?.get("userId") || searchParams?.get("recipientId") || searchParams?.get("mentorId");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [convSearch, setConvSearch] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
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

  // Load conversations and handle URL param auto-selection
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
                    const recList: Recipient[] = recData.recipients || [];
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
    }, 3500);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [targetUserId]);

  // Fast-polling messages for active conversation (1.5s interval for real-time responsiveness)
  useEffect(() => {
    let isMounted = true;
    const conversationId = activeConv?.id;

    async function loadMessages(isFirst = false) {
      if (!conversationId) {
        if (isMounted) setMessages([]);
        return;
      }

      if (isFirst && isMounted) {
        setIsLoadingMsgs(true);
      }

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

          // Update sidebar unread count and latest message snippet
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
        if (isMounted && isFirst) setIsLoadingMsgs(false);
      }
    }

    void loadMessages(true);
    const interval = window.setInterval(() => {
      void loadMessages(false);
    }, 1500);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [activeConv?.id]);

  // Auto-scroll to bottom of chat
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
        // Replace temp message with server saved message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.sentMessage : m))
        );

        // Instantly sync conversation list
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
      // Keep optimistic message
    } finally {
      setIsSending(false);
    }
  };

  const openNewMessage = async () => {
    setShowNewMessage(true);
    setRecipientSearch("");
    setIsLoadingRecipients(true);
    try {
      const res = await fetch(`/api/messages/recipients?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
      }
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const startConversation = (recipient: Recipient) => {
    const existing = conversations.find((c) => c.id === recipient.id);
    if (existing) {
      setActiveConv(existing);
    } else {
      const newEntry: Conversation = {
        id: recipient.id,
        name: recipient.name,
        role: recipient.role,
        avatarUrl: recipient.avatarUrl,
        latestMessage: { content: "Start a conversation", createdAt: new Date().toISOString(), senderId: "" },
        unreadCount: 0,
      };
      setConversations((prev) => [newEntry, ...prev.filter((c) => c.id !== recipient.id)]);
      setActiveConv(newEntry);
    }
    setMessages([]);
    setShowNewMessage(false);
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateDivider = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Filter conversations by search keyword
  const filteredConversations = useMemo(() => {
    if (!convSearch.trim()) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(convSearch.toLowerCase()) ||
        c.latestMessage?.content.toLowerCase().includes(convSearch.toLowerCase())
    );
  }, [conversations, convSearch]);

  // Filter recipients in modal
  const filteredRecipients = useMemo(() => {
    if (!recipientSearch.trim()) return recipients;
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        r.role.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        (r.headline && r.headline.toLowerCase().includes(recipientSearch.toLowerCase()))
    );
  }, [recipients, recipientSearch]);

  return (
    <div className="h-[calc(100vh-8.5rem)] flex-1 flex bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-scale-up">
      {/* Left Pane: Conversations List */}
      <div className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/15">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Direct Messages</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live real-time sync" />
          </div>
          <button
            onClick={openNewMessage}
            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-xs cursor-pointer"
          >
            + New Chat
          </button>
        </div>

        {/* Conversation Search Bar */}
        <div className="p-2.5 border-b border-border/60 bg-background/50">
          <input
            type="text"
            placeholder="Search conversations..."
            value={convSearch}
            onChange={(e) => setConvSearch(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Conversations Feed */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-background/30">
          {isLoadingConvs ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border animate-pulse space-y-2">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <span className="text-2xl block">💬</span>
              <p className="text-xs font-bold text-foreground">No conversations found</p>
              <p className="text-[11px] text-muted-foreground">
                {convSearch ? "No chats match your search query." : "Start a direct conversation with a mentor or student."}
              </p>
              <button
                onClick={openNewMessage}
                className="mt-2 text-xs font-bold text-primary hover:underline block mx-auto"
              >
                + Start New Message
              </button>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-transparent hover:bg-accent hover:border-border/60 text-muted-foreground hover:text-foreground bg-card/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-extrabold overflow-hidden shrink-0">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold truncate">{c.name}</h3>
                      {c.unreadCount > 0 && !isActive && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-extrabold">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : c.role === "mentor"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {c.role === "mentor" ? "Mentor" : "Learner"}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"} mt-0.5`}>
                      {c.latestMessage?.content || "Start a conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Start New Conversation</h3>
                <p className="text-xs text-muted-foreground">Select a mentor or learner to send a direct message.</p>
              </div>
              <button
                onClick={() => setShowNewMessage(false)}
                className="text-lg font-bold text-muted-foreground hover:text-foreground p-1"
              >
                ×
              </button>
            </div>

            {/* Recipient Search */}
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {isLoadingRecipients ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading directory...</p>
            ) : filteredRecipients.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No contacts found matching your search.</p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => startConversation(recipient)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/80 p-3 text-left hover:border-primary hover:bg-primary/5 transition-all bg-card/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold border border-primary/20 shrink-0">
                      {recipient.avatarUrl ? (
                        <img src={recipient.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        recipient.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground truncate">{recipient.name}</p>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          recipient.role === "mentor"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        }`}>
                          {recipient.role === "mentor" ? "Mentor" : "Learner"}
                        </span>
                      </div>
                      {recipient.headline && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{recipient.headline}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Pane: Live Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-card">
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden text-sm font-extrabold">
                {activeConv.avatarUrl ? (
                  <img src={activeConv.avatarUrl} alt={activeConv.name} className="w-full h-full object-cover" />
                ) : (
                  activeConv.name.slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-foreground">{activeConv.name}</h3>
                  <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${
                    activeConv.role === "mentor"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}>
                    {activeConv.role === "mentor" ? "🎓 Mentor" : "📚 Learner"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Continuous conversation history preserved</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Messaging
              </div>
              {activeConv.role === "mentor" && (
                <Link
                  href={`/explore?tab=mentors&q=${encodeURIComponent(activeConv.name)}`}
                  className="hidden sm:inline-flex items-center text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                >
                  View Profile ↗
                </Link>
              )}
            </div>
          </div>

          {/* Messages History Feed */}
          <div ref={chatBoxRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/20">
            {isLoadingMsgs && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">Loading message history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 p-8">
                <span className="text-3xl block">👋</span>
                <p className="text-xs font-bold text-foreground">No message history yet</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Say hello to {activeConv.name} to start exchanging notes, scheduling sessions, or discussing learning goals!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showDateDivider =
                  !prevMsg ||
                  new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                return (
                  <div key={msg.id} className="space-y-2">
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-0.5 rounded-full bg-muted/60 border border-border/60 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          {formatDateDivider(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {isMe ? "You" : activeConv.name}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[75%] shadow-xs break-words ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-card text-foreground rounded-tl-none border border-border/70 shadow-xs"
                        }`}
                      >
                        {msg.content}
                      </div>

                      <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-muted-foreground font-medium">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMe && (
                          <span className={msg.read ? "text-emerald-500 font-bold" : "text-muted-foreground/70 font-bold"}>
                            {msg.read ? "✓✓ Read" : "✓ Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-card/60 flex items-center gap-2.5">
            <input
              type="text"
              placeholder={`Message ${activeConv.name}... (Press Enter to send)`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isSending}
              className="flex-1 text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 placeholder:text-muted-foreground/60 font-medium"
            />
            <button
              type="submit"
              disabled={isSending || !inputVal.trim()}
              className="px-5 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-card">
          <div className="text-center space-y-3 p-8">
            <span className="text-4xl block">💬</span>
            <h3 className="text-sm font-bold text-foreground">Select a Conversation</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Choose a contact from the left list to review your message history, or click &ldquo;+ New Chat&rdquo; to start a new discussion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-8.5rem)] flex items-center justify-center bg-card rounded-2xl">
          <p className="text-xs text-muted-foreground">Loading chat dashboard...</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
