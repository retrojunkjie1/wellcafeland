import React from "react";
import PageTemplate from "./PageTemplate";

const Spiritual = () => {
  return (
    <PageTemplate
      pageType="spiritual"
      title="Spiritual Counseling & Soul Transformation"
      intro="Deepen your spiritual journey through sacred community, personalized guidance, and transformative rituals. Explore meaning, purpose, and connection in a supportive environment that honors diverse spiritual traditions and personal beliefs."
      features={[
        {
          title: "Sacred Community Circles & Group Work",
          desc: "Participate in facilitated group circles where diverse spiritual perspectives create rich dialogue and mutual growth. Experience the healing power of shared vulnerability, collective wisdom, and sacred witnessing in a safe, inclusive environment that honors all paths.",
        },
        {
          title: "Personalized Spiritual Direction & Counseling",
          desc: "Receive one-on-one spiritual guidance tailored to your unique journey, beliefs, and life circumstances. Work with experienced spiritual directors who help you discern life purpose, navigate spiritual crises, and deepen your connection to the sacred.",
        },
        {
          title: "Rituals, Ceremonies & Sacred Practices",
          desc: "Engage in meaningful rituals for life transitions including birth, coming of age, marriage, healing, grief, and spiritual awakening. Learn traditional and contemporary ceremonial practices that honor the sacred in everyday life and mark important passages.",
        },
        {
          title: "Interfaith & Multicultural Spiritual Exploration",
          desc: "Explore spiritual wisdom from diverse traditions including Christianity, Buddhism, Indigenous practices, Sufism, Hinduism, and contemporary spirituality. Discover universal spiritual principles while honoring cultural contexts and personal resonance.",
        },
        {
          title: "Contemplative Practices & Mystical Traditions",
          desc: "Learn contemplative prayer, meditation, centering prayer, and mystical practices from various traditions. Develop inner stillness, spiritual discernment, and direct experience of the divine through guided contemplative exercises and retreats.",
        },
        {
          title: "Spiritual Psychology & Inner Work",
          desc: "Integrate psychological insight with spiritual wisdom to address shadow work, ego development, attachment patterns, and spiritual bypassing. Explore the intersection of mental health and spiritual growth in a holistic healing approach.",
        },
        {
          title: "Nature-Based & Earth-Centered Spirituality",
          desc: "Connect with the sacred in nature through earth-based spiritual practices, seasonal ceremonies, and eco-spirituality. Learn to recognize the divine in the natural world and cultivate reverence for the Earth as a living spiritual being.",
        },
        {
          title: "Spiritual Care for Life Transitions",
          desc: "Receive specialized spiritual support during major life changes including illness, loss, career transitions, relationship changes, and spiritual emergencies. Navigate uncertainty with spiritual tools, rituals, and compassionate guidance.",
        },
        {
          title: "Creative Spiritual Expression",
          desc: "Explore spiritual themes through art, music, poetry, dance, and creative expression. Discover how creativity can be a spiritual practice, a form of prayer, and a pathway to deeper self-understanding and divine connection.",
        },
        {
          title: "Spiritual Ethics & Social Justice",
          desc: "Examine how spiritual principles inform ethical living, social justice work, and compassionate action in the world. Explore spirituality's role in addressing systemic issues, promoting equity, and cultivating a more just and compassionate society.",
        },
      ]}
      ctaText="Begin your sacred journey of spiritual discovery and soul transformation. Whether you're seeking deeper meaning, navigating life transitions, or exploring spiritual questions, our compassionate spiritual counselors and sacred community await. Step into the mystery and discover the divine spark within you."
    />
  );
};

export default Spiritual;
