// src/apps/legal/PrivacyPolicyPage.jsx

import React, { useEffect } from "react";

const content = [
  "1. WELLNESSCAFE PRIVACY POLICY",
  "Effective: 2025",
  "WellnessCafe (“we,” “us,” “our”) is committed to protecting your privacy.",
  "This Privacy Policy explains how we collect, use, store, and safeguard your information when you use the WellnessCafe platform, tools, insights, and support features.",
  "We designed WellnessCafe intentionally so that you can use the platform in Guest Mode without sharing personal details, allowing you to build trust before creating an account.",
  "1. Information We Collect",
  "We collect only the information necessary to provide the experience you expect.",
  "A. Information You Provide",
  "Guest Mode: anonymous usage data with no name or email attached",
  "Account creation: name, email (optional)",
  "Journaling or reflection entries that you voluntarily write",
  "Responses to tools (breathing, grounding, check-ins)",
  "Support requests or messages you choose to send",
  "Available review and deletion controls depend on the type of information. See Privacy & your data and Wellness settings for the controls currently available.",
  "B. Automatically Collected Information",
  "To improve functionality and safety, we collect:",
  "Basic device information (browser type, device type)",
  "Usage patterns (tool usage, timestamps)",
  "Anonymous analytics for performance",
  "We do not collect precise location unless you explicitly choose to use a “Find Help Near Me” feature.",
  "C. No Third-Party Selling",
  "We do not sell, rent, or trade your information.",
  "Ever.",
  "2. How We Use Your Information",
  "We use your information to:",
  "Generate a reply when you choose to send a message to the AI guide.",
  "Transcribe a voice recording when you choose a voice feature and confirm its send action.",
  "Prepare an AI reflection only when you choose the specific reflection or summary action described in that tool.",
  "Provide wellness tools and exercises",
  "Help you track patterns, insights, and progress",
  "Improve app functionality and stability",
  "Offer optional weekly reflections",
  "Maintain your streaks and saved moments",
  "Provide access to the Support Hub",
  "We do not use your data for advertising.",
  "WellnessCafe does not diagnose, treat, cure, or replace professional medical care.",
  "3. How Your Data Is Stored",
  "Chat messages and voice transcripts you send are saved in this browser. The recording is used to create the transcript and is not added to chat history.",
  "Saved check-ins and journal entries are stored in your account when signed in, or in this browser when account saving is unavailable.",
  "Guide conversation memory is separate from browser chat history. When you enable it, guide exchanges are saved to your account until you review or clear them in Wellness settings.",
  "Voice recordings are sent for transcription only after the confirmation shown in the voice feature. Voice Journal asks separately before sending a reviewed transcript for an AI summary. Voice Session keeps a recording on this device until you choose Send; after sending, its transcript and reply are added to the browser-saved chat.",
  "Automatic timed deletion is not available for all data types. Use the controls in Privacy & your data and Wellness settings to review or remove the data they cover.",
  "4. Sharing of Information",
  "When you choose an AI or transcription feature, the text or audio needed for that feature is sent to the configured processing service to provide the requested response. Each voice tool explains when it sends audio or transcript text and asks you to confirm before that handoff.",
  "AI and transcription providers process submitted content under their own service terms. Do not submit details you are not comfortable sharing with the selected feature.",
  "Your chat and journal content is not automatically shared with a practitioner. Practitioner access is managed separately through the sharing choices in Practitioner access settings.",
  "We do not sell, rent, or trade your information.",
  "5. Your Rights",
  "You have the right to:",
  "Delete your account",
  "Request your data",
  "Opt out of analytics",
  "Use Guest Mode instead of creating an account",
  "Revoke consent",
  "6. Children’s Privacy",
  "WellnessCafe is not intended for users under 13.",
  "We do not knowingly collect data from children without parental consent.",
  "7. Updates to This Policy",
  "We may update this policy to improve clarity or meet new legal requirements.",
  "We will notify you if major changes occur.",
  "8. Contact Us",
  "For questions about privacy, contact:",
  "support@wellnesscafe.net",
];

const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy - WellnessCafe";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-10 space-y-8">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            WellnessCafe
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Effective: 2025</p>
        </header>

        <div className="lux-card p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {content.map((paragraph, index) => (
            <p key={index} className="text-foreground/80">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
