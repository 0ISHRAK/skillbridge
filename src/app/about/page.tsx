"use client";

import { useState } from "react";

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Skillbridge, and how does it help Bangladeshi learners?",
      a: "Skillbridge is a peer-to-peer mentorship and skill-sharing platform tailored for Bangladesh. We connect students and early-career professionals directly with verified industry experts (working at TigerIT, Pathao, bKash, or foreign remote companies) for 1-on-1 calls, resume reviews, code pairings, and specialized courses.",
    },
    {
      q: "What payment methods are supported, and is it secure?",
      a: "Yes! We support secure, local mobile financial services (MFS) including bKash, Nagad, and Rocket, as well as Visa and Mastercard credit cards. Payments are processed in BDT (৳) with instant transaction confirmations.",
    },
    {
      q: "How are 1-on-1 mentor sessions conducted?",
      a: "Sessions are conducted online via our built-in video meeting portal or integrated Google Meet links. Once your booking and payment are confirmed, you will receive an email containing the meeting invite link and calendar schedule.",
    },
    {
      q: "What is the refund policy?",
      a: "You can request a full refund or session reschedule up to 24 hours before your scheduled time slot. Refund requests inside 24 hours are subject to the mentor's approval.",
    },
    {
      q: "How can I apply to become a verified mentor?",
      a: "We welcome experienced software developers, designers, product managers, and communication trainers. Click 'Get Started' or apply through the 'Become a Mentor' option on our auth page to submit your details and LinkedIn profile for review.",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
      {/* Brand Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">About Skillbridge</h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Our mission is to bridge the gap between academic education and industry requirements in Bangladesh. 
          By offering a platform for direct 1-on-1 mentorship, we help developers, designers, and creators unlock their career potential.
        </p>
      </section>

      {/* Grid: FAQ & Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* FAQs Accordion */}
        <section className="md:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left font-bold text-sm text-foreground flex justify-between items-center hover:bg-accent/40"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-xs text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-card">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section className="md:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Contact Support</h2>
            <p className="text-xs text-muted-foreground">Have questions? Send us a message and we&apos;ll reply within 24 hours.</p>
          </div>

          {isSubmitted ? (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs text-center space-y-2">
              <span className="text-lg">✉️</span>
              <p className="font-bold">Message Sent Successfully!</p>
              <p className="opacity-90">Thank you for reaching out. We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fahim Hossain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. fahim@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Mentor Application Status"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                Send Message
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
