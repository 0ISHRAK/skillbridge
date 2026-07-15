"use client";

import { useState, useEffect } from "react";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  unread: boolean;
  lastMessage: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export default function MessagesDashboardPage() {
  const contacts: Contact[] = [
    { id: "tanzim", name: "Tanzim Hasan", role: "Senior Developer @ TigerIT", avatar: "👨‍💻", unread: true, lastMessage: "Let's review the client-side rendering steps." },
    { id: "sabrina", name: "Sabrina Rahman", role: "Product Designer @ Pathao", avatar: "👩‍🎨", unread: false, lastMessage: "I uploaded the styling kit slides." }
  ];

  const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    tanzim: [
      { id: "1", sender: "Tanzim Hasan", text: "Assalamu Alaikum! Did you complete the Module 1 assignment?", time: "昨日 5:30 PM" }, // Wait, Yesterday 5:30 PM
      { id: "2", sender: "You", text: "Wa Alaikum Assalam! Yes, I setup the Node API routers.", time: "昨日 5:45 PM" },
      { id: "3", sender: "Tanzim Hasan", text: "Excellent. Let's review the client-side rendering steps in our upcoming session.", time: "今日 10:00 AM" }
    ],
    sabrina: [
      { id: "1", sender: "Sabrina Rahman", text: "Hey! Can you review the dashboard layouts in Figma?", time: "Monday 11:20 AM" },
      { id: "2", sender: "You", text: "Sure! I will check the alignment guidelines.", time: "Monday 12:00 PM" },
      { id: "3", sender: "Sabrina Rahman", text: "Perfect. I uploaded the styling kit slides to your resources folder.", time: "Monday 12:05 PM" }
    ]
  });

  const [inputVal, setInputVal] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "You",
      text: inputVal,
      time: "Just Now"
    };

    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));
    setInputVal("");

    // Simulate response
    setTimeout(() => {
      const mentorReplies = [
        "Let me review this and get back to you shortly.",
        "Got it! Let's discuss this during our weekly call.",
        "That looks perfect. Keep up the good work!",
      ];
      const replyText = mentorReplies[Math.floor(Math.random() * mentorReplies.length)];
      
      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: [
          ...(prev[activeContact.id] || []),
          {
            id: String(Date.now() + 1),
            sender: activeContact.name,
            text: replyText,
            time: "Just Now"
          }
        ]
      }));
    }, 1500);
  };

  useEffect(() => {
    const box = document.getElementById("chat-box");
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages, activeContact]);

  return (
    <div className="h-[calc(100vh-8rem)] flex-1 flex bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-scale-up">
      {/* Left Pane: Contacts List */}
      <div className="w-80 border-r border-border flex flex-col justify-between shrink-0 bg-muted/20">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">My Contacts</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 bg-background/50">
          {contacts.map((c) => {
            const isActive = activeContact.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveContact(c)}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-transparent hover:bg-accent hover:border-border/40 text-muted-foreground hover:text-foreground bg-card/45"
                }`}
              >
                <span className="text-2xl shrink-0">{c.avatar}</span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold truncate">{c.name}</h3>
                    {c.unread && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{c.role}</p>
                  <p className={`text-[9px] truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/80"} mt-0.5`}>{c.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Conversation Area */}
      <div className="flex-1 flex flex-col justify-between bg-card">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeContact.avatar}</span>
            <div>
              <h3 className="text-xs font-bold text-foreground">{activeContact.name}</h3>
              <p className="text-[10px] text-muted-foreground">{activeContact.role}</p>
            </div>
          </div>
        </div>

        {/* Messages Stream Box */}
        <div id="chat-box" className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/25">
          {messages[activeContact.id]?.map((msg) => {
            const isMe = msg.sender === "You";
            return (
              <div key={msg.id} className={`space-y-1 ${isMe ? "text-right" : "text-left"}`}>
                <p className="text-[9px] uppercase font-extrabold text-muted-foreground">{msg.sender}</p>
                <div className={`inline-block p-3 rounded-2xl text-xs leading-normal max-w-[70%] ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none border border-border/40"
                }`}>
                  {msg.text}
                </div>
                <p className="text-[8px] text-muted-foreground font-semibold">{msg.time}</p>
              </div>
            );
          })}
        </div>

        {/* Input Text Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-border bg-background/50 flex gap-2">
          <input
            type="text"
            placeholder={`Message ${activeContact.name}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 text-xs p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
