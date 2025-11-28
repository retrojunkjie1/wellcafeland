import React from "react";
import PageTemplate from "./PageTemplate";

const Recovery = () => {
  return (
    <PageTemplate
      pageType="recovery"
      title="Comprehensive Recovery Support & Healing Journey"
      intro="Transformative recovery tools powered by AI and compassionate community support. Track your progress, build resilience, and connect with others on similar healing paths through evidence-based practices and personalized guidance."
      features={[
        {
          title: "AI-Powered Progress Tracking & Insights",
          desc: "Advanced daily check-ins with machine learning algorithms that analyze your recovery patterns, identify triggers, celebrate milestones, and provide predictive insights. Receive personalized coping strategies, meditation recommendations, and wellness activities tailored to your unique journey and current emotional state.",
        },
        {
          title: "Comprehensive Prevention & Relapse Prevention",
          desc: "Proactive intervention system with early warning alerts for high-risk situations, personalized coping toolboxes, emergency contact integration, and 24/7 crisis support access. Build resilience through cognitive behavioral techniques, mindfulness practices, and evidence-based prevention strategies.",
        },
        {
          title: "Safe Healing Community & Peer Support",
          desc: "Moderated support circles connecting you with others at similar stages of recovery. Share experiences anonymously, participate in guided group discussions, access peer mentorship programs, and build meaningful connections in a judgment-free environment focused on growth and mutual support.",
        },
        {
          title: "Holistic Treatment Integration",
          desc: "Seamlessly integrate traditional and alternative therapies including medication-assisted treatment tracking, therapy session logging, yoga and meditation integration, nutritional support, and exercise tracking. Connect with licensed professionals and access comprehensive treatment planning tools.",
        },
        {
          title: "Family & Relationship Support",
          desc: "Resources and tools for rebuilding relationships, family counseling access, communication skills development, and boundary-setting guidance. Support loved ones through their own healing journey with educational resources and family-focused recovery programs.",
        },
        {
          title: "Professional Clinical Support",
          desc: "Connect with licensed therapists, counselors, and addiction specialists through our verified provider network. Access telehealth appointments, group therapy sessions, specialized treatment programs, and ongoing clinical supervision throughout your recovery journey.",
        },
        {
          title: "Life Skills & Personal Development",
          desc: "Build essential life skills including stress management, emotional regulation, healthy communication, financial planning, career development, and relationship building. Access educational resources, workshops, and coaching programs designed for long-term recovery success.",
        },
        {
          title: "Spiritual & Mindfulness Practices",
          desc: "Incorporate spiritual practices, meditation, prayer, nature-based healing, and mindfulness techniques into your recovery routine. Access guided meditations, spiritual direction, and contemplative practices that support deep healing and inner peace.",
        },
        {
          title: "Aftercare & Long-Term Support",
          desc: "Continued support beyond initial treatment including alumni programs, sober living communities, ongoing therapy access, and lifelong recovery maintenance tools. Build a sustainable lifestyle that supports long-term wellness and prevents relapse.",
        },
        {
          title: "Emergency Crisis Intervention",
          desc: "24/7 access to crisis hotlines, emergency counseling, medical detox coordination, and immediate intervention services. Connect with local emergency resources, peer support during crises, and professional intervention when needed most.",
        },
      ]}
      ctaText="Begin your transformative recovery journey today. Our comprehensive support system combines cutting-edge technology with compassionate human connection to guide you toward sustainable healing, personal growth, and a life of wellness. You're not alone in this journey - let us support you every step of the way."
    />
  );
};

export default Recovery;
