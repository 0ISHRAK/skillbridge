"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"learner" | "mentor">("learner");
  const [step, setStep] = useState(1);

  // Learner State
  const [learnerInterests, setLearnerInterests] = useState<string[]>([]);
  const [learnerGoal, setLearnerGoal] = useState("");
  const [learnerHours, setLearnerHours] = useState("");

  // Mentor State
  const [mentorSkills, setMentorSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mentorRate, setMentorRate] = useState(1000);
  const [mentorDays, setMentorDays] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [nidUploaded, setNidUploaded] = useState(false);
  const [nidFileName, setNidFileName] = useState("");

  // Common list of skills for suggestions
  const suggestedSkills = ["React", "Next.js", "Figma", "Design Systems", "IELTS Speaking", "Agile Product Management", "SQL", "Upwork Proposal"];

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "learner" | "mentor" | null;
    if (storedRole && storedRole !== "learner") {
      setTimeout(() => setRole(storedRole), 0);
    }
  }, []);

  const handleInterestToggle = (interest: string) => {
    setLearnerInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleDayToggle = (day: string) => {
    setMentorDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput && !mentorSkills.includes(skillInput)) {
      setMentorSkills([...mentorSkills, skillInput]);
      setSkillInput("");
    }
  };

  const handleAddSuggestedSkill = (s: string) => {
    if (!mentorSkills.includes(s)) {
      setMentorSkills([...mentorSkills, s]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNidUploaded(true);
      setNidFileName(e.target.files[0].name);
    }
  };

  const handleNextStep = () => {
    if (role === "learner") {
      if (step === 1 && learnerInterests.length === 0) {
        alert("Please select at least one interest to continue.");
        return;
      }
      if (step === 2 && !learnerGoal) {
        alert("Please select a target career goal to continue.");
        return;
      }
      if (step === 3 && !learnerHours) {
        alert("Please select your target learning target hours.");
        return;
      }
    } else {
      if (step === 1 && mentorSkills.length === 0) {
        alert("Please add at least one skill/expertise tag.");
        return;
      }
      if (step === 2 && (mentorRate < 500 || mentorDays.length === 0)) {
        alert("Please select a valid rate (Min ৳500) and at least one available day.");
        return;
      }
      if (step === 3 && (!linkedinUrl || !nidUploaded)) {
        alert("Please provide your LinkedIn profile and upload NID/Passport for identity check.");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Completed Onboarding
      localStorage.setItem("isOnboarded", "true");
      // Redirect to dashboard
      router.push("/dashboard");
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
      <div className="max-w-xl w-full bg-card border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        {/* Background glow decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Wizard Header Progress */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-primary tracking-widest">
              Onboarding: {role === "learner" ? "Learner Flow" : "Mentor Setup"}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Step {step} of 3</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* ==================== LEARNER ONBOARDING FLOW ==================== */}
        {role === "learner" && (
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">What skills do you want to learn?</h2>
                  <p className="text-xs text-muted-foreground">Select one or more categories that interest you.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Software & Coding", "UI/UX & Product Design", "IELTS & English", "Freelancing & Career", "Digital Marketing", "Higher Study Abroad"].map((interest) => {
                    const isSelected = learnerInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-4 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary font-bold"
                            : "border-border text-muted-foreground hover:border-primary/55"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">What is your primary career goal?</h2>
                  <p className="text-xs text-muted-foreground">This helps us match you with the best mentors.</p>
                </div>
                <div className="space-y-3">
                  {[
                    "Land a remote software/tech job from Bangladesh",
                    "Build a successful freelancing profile on Upwork/Fiverr",
                    "Score high in IELTS to apply for higher study abroad",
                    "Upskill to get promoted in my current organization",
                  ].map((goal) => {
                    const isSelected = learnerGoal === goal;
                    return (
                      <button
                        key={goal}
                        onClick={() => setLearnerGoal(goal)}
                        className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                            : "border-border text-muted-foreground hover:border-primary/55"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Set your target learning targets</h2>
                  <p className="text-xs text-muted-foreground">Select how many hours you plan to spend upskilling each week.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Light: 1 - 2 hours per week",
                    "Moderate: 3 - 5 hours per week (Recommended)",
                    "Intense: 6+ hours per week",
                  ].map((hours) => {
                    const isSelected = learnerHours === hours;
                    return (
                      <button
                        key={hours}
                        onClick={() => setLearnerHours(hours)}
                        className={`p-4 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary font-bold"
                            : "border-border text-muted-foreground hover:border-primary/55"
                        }`}
                      >
                        {hours}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== MENTOR ONBOARDING FLOW ==================== */}
        {role === "mentor" && (
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Add your expertise & skills</h2>
                  <p className="text-xs text-muted-foreground">Select common skills or type custom ones below.</p>
                </div>

                {/* Custom Skill Input Form */}
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill, e.g. Docker, Python..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all"
                  >
                    Add
                  </button>
                </form>

                {/* Suggestions List */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Common Suggestions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkills.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => handleAddSuggestedSkill(s)}
                        className="px-2.5 py-1 rounded text-[10px] bg-accent text-accent-foreground hover:bg-accent/80 transition-colors border border-border"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Skills Chips */}
                {mentorSkills.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Your Selected Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mentorSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-semibold flex items-center gap-1.5"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => setMentorSkills(mentorSkills.filter((ms) => ms !== s))}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Set Fee & Weekly Slots</h2>
                  <p className="text-xs text-muted-foreground">Set your hourly fee in BDT and choose your teaching days.</p>
                </div>

                {/* Fee Rate Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Hourly Consultation Rate (৳ BDT)</label>
                  <div className="flex items-center border border-input bg-background rounded-lg px-3 max-w-xs">
                    <span className="text-sm font-bold text-muted-foreground">৳</span>
                    <input
                      type="number"
                      min={500}
                      max={10000}
                      step={100}
                      value={mentorRate}
                      onChange={(e) => setMentorRate(Number(e.target.value))}
                      className="w-full text-sm p-2.5 bg-transparent text-foreground focus:outline-none ml-2 font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground font-semibold">/hr</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Platform average is ৳1,000 - ৳2,000 per hour.</p>
                </div>

                {/* Days Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Weekly Available Days</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const isSelected = mentorDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`py-2 rounded-lg border text-center text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground font-bold"
                              : "bg-background border-border text-muted-foreground hover:border-primary"
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Identity Verification</h2>
                  <p className="text-xs text-muted-foreground">Provide verified references to display the verified checkmark badge.</p>
                </div>

                {/* LinkedIn Profile */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">LinkedIn Profile Link</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    required
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* File Upload Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">National ID (NID) / Passport Scan</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-background/50 relative cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="space-y-2">
                      <span className="text-2xl block">📄</span>
                      {nidUploaded ? (
                        <div>
                          <p className="text-xs font-bold text-emerald-500">Document Uploaded!</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{nidFileName}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold">Click to select files for verification</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, PNG, or JPG (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Identity scans are encrypted and used solely for admin checks.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-border/60 pt-6 mt-8">
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className="px-5 h-10 flex items-center justify-center font-bold text-xs rounded-lg border border-border bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={handleNextStep}
            className="px-6 h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 hover:shadow-primary/25"
          >
            {step === 3 ? "Complete Onboarding" : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
