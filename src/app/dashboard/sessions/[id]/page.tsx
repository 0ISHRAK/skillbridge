"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Call hardware states
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  // Chat panel state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "Tanzim Hasan", text: "Assalamu Alaikum! Hope you're doing well. Let's start the code review.", time: "8:30 PM" },
    { sender: "System", text: "You have joined the secure video call room.", time: "8:30 PM" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    const chatContainer = document.getElementById("chat-flow");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      sender: "You",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate mentor automated response after 2 seconds
    setTimeout(() => {
      const mentorReplies = [
        "That makes sense. Can you share your package.json file?",
        "Awesome! Let me look into that error trace.",
        "Exactly. Next.js App Router renders Server Components by default.",
      ];
      const randomReply = mentorReplies[Math.floor(Math.random() * mentorReplies.length)];
      
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "Tanzim Hasan",
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
  };

  const handleEndSession = () => {
    setShowReviewModal(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    // Save review locally to mock submission
    localStorage.setItem(`review-${id}`, JSON.stringify({ rating, reviewComment }));

    setTimeout(() => {
      setIsSubmittingReview(false);
      alert("Thank you for your feedback! Review submitted successfully.");
      router.push("/dashboard/sessions");
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex-1 flex flex-col lg:flex-row gap-6 relative animate-scale-up">
      {/* LEFT: Video Conference Panel */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
        {/* Video feeds grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          
          {/* Feed 1: Mentor Feed */}
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
            {videoActive ? (
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                <span className="text-[10px] uppercase font-bold bg-black/60 px-2 py-0.5 rounded text-white self-start">
                  Tanzim Hasan (Mentor)
                </span>
                <span className="text-xs text-emerald-400 font-bold self-end bg-black/60 px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
            ) : null}

            {/* Mentor Webcam avatar placeholder */}
            <div className="text-center space-y-3 z-0">
              <span className="text-6xl block">👨‍💻</span>
              <p className="text-sm font-bold text-zinc-300">Tanzim Hasan</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Webcam active</p>
            </div>
          </div>

          {/* Feed 2: Learner Feed */}
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
            {videoActive ? (
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                <span className="text-[10px] uppercase font-bold bg-black/60 px-2 py-0.5 rounded text-white self-start">
                  You (Learner)
                </span>
                <span className="text-[10px] text-zinc-400 bg-black/60 px-2 py-0.5 rounded self-end">
                  Webcam active
                </span>
              </div>
            ) : null}

            {/* Learner Avatar placeholder */}
            <div className="text-center space-y-3 z-0">
              {videoActive ? (
                <>
                  <span className="text-6xl block">🎓</span>
                  <p className="text-sm font-bold text-zinc-300">Fahim Hossain</p>
                </>
              ) : (
                <p className="text-xs text-red-500 font-bold">Webcam Muted</p>
              )}
            </div>
          </div>
        </div>

        {/* Video Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-800/80 pt-4 mt-4 gap-4 z-10">
          <div className="flex items-center gap-3">
            {/* Mic Toggle */}
            <button
              onClick={() => setMicActive(!micActive)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                micActive ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500 text-white"
              }`}
              title={micActive ? "Mute Mic" : "Unmute Mic"}
            >
              {micActive ? "🎙️" : "🔇"}
            </button>

            {/* Video Toggle */}
            <button
              onClick={() => setVideoActive(!videoActive)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                videoActive ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500 text-white"
              }`}
              title={videoActive ? "Stop Camera" : "Start Camera"}
            >
              {videoActive ? "📹" : "📸"}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={() => setScreenSharing(!screenSharing)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                screenSharing ? "bg-primary text-primary-foreground" : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
              title={screenSharing ? "Stop Share" : "Share Screen"}
            >
              💻
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-semibold tracking-wider">
            SECURE MEETING ID: sb-tanzim-{id}
          </div>

          {/* End Call Button */}
          <button
            onClick={handleEndSession}
            className="px-6 h-10 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
          >
            End Call & Leave
          </button>
        </div>
      </div>

      {/* RIGHT: Chat Sidebar Panel */}
      <div className="w-full lg:w-80 shrink-0 bg-card border border-border rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Session Chat</h2>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Message Flow Area */}
        <div id="chat-flow" className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[300px] lg:max-h-none">
          {chatMessages.map((msg, idx) => {
            const isMe = msg.sender === "You";
            const isSystem = msg.sender === "System";
            
            if (isSystem) {
              return (
                <div key={idx} className="text-center text-[10px] text-muted-foreground font-semibold py-1 bg-muted/40 rounded-md">
                  {msg.text}
                </div>
              );
            }

            return (
              <div key={idx} className={`space-y-1 ${isMe ? "text-right" : "text-left"}`}>
                <p className="text-[9px] uppercase font-extrabold text-muted-foreground">{msg.sender}</p>
                <div className={`inline-block p-3 rounded-2xl text-xs leading-normal max-w-[85%] ${
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

        {/* Input Form Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background/50 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-lg hover:bg-primary/95 transition-all shadow-md cursor-pointer"
          >
            ✈
          </button>
        </form>
      </div>

      {/* RATING & REVIEW MODAL OVERLAY */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up">
            <h3 className="text-lg font-extrabold tracking-tight text-foreground">Review Your Session</h3>
            <p className="text-xs text-muted-foreground mt-1">Please take a moment to rate Tanzim Hasan for this meeting.</p>

            <form onSubmit={handleSubmitReview} className="space-y-5 mt-6">
              {/* Star Rating Selectors */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">Session Rating</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-all ${
                        star <= rating ? "text-amber-500 scale-110" : "text-muted-foreground/30 hover:scale-105"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text area */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Feedback Comments</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you learned or how the mentor could improve..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 h-10 border border-border rounded-lg text-xs font-semibold hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
