"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

interface BookingDetails {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  topic: string;
  date: string;
  time: string;
  status: string;
}

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Booking & user state
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Call hardware states
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  // Chat panel state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch(`/api/bookings?id=${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([bookingData, meData]) => {
        if (!isMounted) return;
        if (meData?.user) {
          setCurrentUser(meData.user);
        }
        if (bookingData?.booking) {
          setBooking(bookingData.booking);
          const mentor = bookingData.booking.mentorName || "Mentor";
          setChatMessages([
            {
              sender: mentor,
              text: `Assalamu Alaikum! Welcome to our 1-on-1 session on "${bookingData.booking.topic}". Feel free to share your screen or questions!`,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            {
              sender: "System",
              text: "🔒 Secure end-to-end encrypted video session initiated.",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      })
      .catch((err) => console.error("Error loading session:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

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

    const senderName = currentUser?.name || "You";
    const newMsg: ChatMessage = {
      sender: senderName,
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate mentor reply if the current user is a learner
    if (currentUser?.role !== "mentor") {
      setTimeout(() => {
        const mentorName = booking?.mentorName || "Mentor";
        const mentorReplies = [
          "That makes complete sense! Let's examine the code architecture.",
          "Great question. In Next.js App Router, Server Components run strictly on the server.",
          "Let me share a quick diagram on how this data flow connects to the database.",
          "Awesome work on this milestone. Let's do a quick code walk-through.",
        ];
        const randomReply = mentorReplies[Math.floor(Math.random() * mentorReplies.length)];

        setChatMessages((prev) => [
          ...prev,
          {
            sender: mentorName,
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    }
  };

  const handleEndSession = () => {
    // If the user is a learner, show review modal to rate the mentor
    if (currentUser?.role !== "mentor" && booking?.mentorId) {
      setShowReviewModal(true);
    } else {
      if (confirm("Are you sure you want to exit the video room?")) {
        router.push("/dashboard/mentor/bookings");
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    try {
      if (booking?.mentorId) {
        // 1. Submit review to PostgreSQL database
        await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "mentor",
            targetId: booking.mentorId,
            rating,
            comment: reviewComment || "Great mentorship session!",
          }),
        });

        // 2. Mark booking as completed
        await fetch("/api/bookings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: id,
            status: "completed",
          }),
        });
      }

      setReviewSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/sessions");
      }, 1500);
    } catch {
      alert("Error submitting review. Returning to sessions list.");
      router.push("/dashboard/sessions");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Connecting to secure video room...</p>
        </div>
      </div>
    );
  }

  const mentorDisplayName = booking?.mentorName || "Expert Mentor";
  const studentDisplayName = currentUser?.name || "Learner";
  const isMentorView = currentUser?.role === "mentor";

  return (
    <div className="h-[calc(100vh-8rem)] flex-1 flex flex-col lg:flex-row gap-4 relative animate-scale-up">
      {/* LEFT: Video Conference Panel */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
        {/* Top Room Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-zinc-200 tracking-tight truncate max-w-[280px] sm:max-w-md">
              {booking?.topic ? `Topic: ${booking.topic}` : "1-on-1 Mentorship Session Room"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
              Room #{id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Video feeds grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* Feed 1: Primary Peer (Mentor or Student) */}
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
            {videoActive ? (
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 pointer-events-none">
                <span className="text-[10px] uppercase font-bold bg-black/60 px-2 py-0.5 rounded text-white self-start">
                  {isMentorView ? `${studentDisplayName} (Student)` : `${mentorDisplayName} (Mentor)`}
                </span>
                <span className="text-xs text-emerald-400 font-bold self-end bg-black/60 px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live HD
                </span>
              </div>
            ) : null}

            {/* Peer Avatar placeholder */}
            <div className="text-center space-y-3 z-0">
              <span className="text-6xl block">{isMentorView ? "🎓" : "👨‍💻"}</span>
              <p className="text-sm font-bold text-zinc-300">
                {isMentorView ? studentDisplayName : mentorDisplayName}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                {screenSharing ? "Screen Share Active" : "Webcam Stream Active"}
              </p>
            </div>
          </div>

          {/* Feed 2: Local User Feed */}
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
            {videoActive ? (
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 pointer-events-none">
                <span className="text-[10px] uppercase font-bold bg-black/60 px-2 py-0.5 rounded text-white self-start">
                  You ({isMentorView ? "Mentor" : "Learner"})
                </span>
                <span className="text-[10px] text-zinc-400 bg-black/60 px-2 py-0.5 rounded self-end">
                  {micActive ? "Mic On" : "Mic Muted"}
                </span>
              </div>
            ) : null}

            {/* Local Avatar placeholder */}
            <div className="text-center space-y-3 z-0">
              {videoActive ? (
                <>
                  <span className="text-6xl block">{isMentorView ? "👨‍🏫" : "🎓"}</span>
                  <p className="text-sm font-bold text-zinc-300">You ({currentUser?.name || "You"})</p>
                </>
              ) : (
                <p className="text-xs text-red-500 font-bold">Webcam Video Paused</p>
              )}
            </div>
          </div>
        </div>

        {/* Video Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-800/80 pt-4 mt-3 gap-4 z-10">
          <div className="flex items-center gap-3">
            {/* Mic Toggle */}
            <button
              onClick={() => setMicActive(!micActive)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                micActive ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500 text-white"
              }`}
              title={micActive ? "Mute Mic" : "Unmute Mic"}
            >
              {micActive ? "🎙️" : "🔇"}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setVideoActive(!videoActive)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                videoActive ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500 text-white"
              }`}
              title={videoActive ? "Turn Camera Off" : "Turn Camera On"}
            >
              {videoActive ? "📹" : "🚫"}
            </button>

            {/* Screen Share */}
            <button
              onClick={() => setScreenSharing(!screenSharing)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                screenSharing ? "bg-primary text-primary-foreground" : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
              title={screenSharing ? "Stop Screen Share" : "Share Screen"}
            >
              🖥️
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={isMentorView ? "/dashboard/mentor/bookings" : "/dashboard/sessions"}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
            >
              Minimize
            </Link>
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer"
            >
              End Session ✕
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: In-Call Chat & Shared Notes */}
      <div className="w-full lg:w-80 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Chat header */}
        <div className="p-3.5 border-b border-border bg-muted/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">💬</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Session Chat & Notes</h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Connected
          </span>
        </div>

        {/* Message Flow Area */}
        <div id="chat-flow" className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[calc(100vh-20rem)] text-xs">
          {chatMessages.map((msg, index) => {
            const isMe = msg.sender === "You" || msg.sender === currentUser?.name;
            const isSys = msg.sender === "System";

            if (isSys) {
              return (
                <div key={index} className="text-center my-2">
                  <span className="text-[10px] font-semibold bg-muted/80 text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-muted-foreground font-semibold mb-0.5">{msg.sender}</span>
                <div
                  className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none shadow-xs"
                      : "bg-muted text-foreground rounded-bl-none border border-border"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
          <input
            type="text"
            placeholder="Type message or code snippet..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all cursor-pointer shrink-0"
          >
            Send
          </button>
        </form>
      </div>

      {/* Review Modal on End Session (for learner) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up space-y-4">
            <div className="text-center space-y-1">
              <span className="text-3xl">⭐</span>
              <h3 className="text-base font-extrabold text-foreground">Rate Your Session with {mentorDisplayName}</h3>
              <p className="text-xs text-muted-foreground">
                Your feedback helps mentors improve and helps fellow Bangladeshi learners find top guides.
              </p>
            </div>

            {reviewSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl mx-auto">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-foreground">Review Submitted!</h4>
                <p className="text-xs text-muted-foreground">Session marked as completed. Redirecting to sessions...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star rating selector */}
                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                        rating >= star ? "text-amber-400" : "text-zinc-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Session Feedback & Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="What did you learn? How was the mentor's guidance?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/sessions")}
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
                  >
                    Skip Review
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 py-2.5 text-xs font-black rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review ⭐"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
