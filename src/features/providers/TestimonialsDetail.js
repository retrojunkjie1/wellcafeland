import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext";
import "../../styles/providers.css";

const TestimonialsDetail = () => {
  const { toggleTheme, isDark } = useTheme();

  const testimonials = [
    {
      id: "sarah-m",
      name: "Sarah M.",
      title: "Licensed Acupuncturist",
      experience: "8 years",
      specialty: "Traditional Chinese Medicine, Pain Management",
      location: "Portland, Oregon",
      image: "👩‍⚕️",
      quote: `"WellnessCafe helped me expand my practice beyond my local area. I've connected with clients who truly value holistic approaches and are willing to invest in their health journey. The platform's flexibility allows me to maintain my clinic hours while taking virtual sessions that fit my schedule."`,
      fullStory: `Sarah started her acupuncture practice in Portland 8 years ago, focusing on traditional Chinese medicine and pain management. Like many practitioners, she struggled with limited local reach and inconsistent client flow.

"Before WellnessCafe, I was dependent on walk-ins and local referrals," Sarah explains. "My practice was limited to Portland residents, and I often had slow periods between patients."

When she discovered WellnessCafe, Sarah was initially skeptical about virtual acupuncture sessions. "I wasn't sure how effective treatments could be without in-person palpation and pulse diagnosis," she admits.

However, after her first few virtual sessions, Sarah was convinced. "The video quality is excellent, and I've developed techniques to assess patients remotely. I've actually expanded my client base significantly - I now work with clients across the Pacific Northwest and even some in other states."

The flexibility has been transformative. "I can schedule sessions during optimal times for both myself and my clients. No more 9-5 clinic hours if I don't want them. I maintain my in-person practice but supplement it with virtual sessions that fit around my life."

Sarah's success metrics speak for themselves: "My practice revenue increased by 40% in the first year, and I've built a waiting list for the first time ever. The clients I work with through WellnessCafe are incredibly committed to their healing journey."`,
      achievements: [
        "40% increase in practice revenue",
        "Expanded client base beyond local area",
        "Built first-ever waiting list",
        "Maintained work-life balance",
        "Pioneered virtual acupuncture techniques",
      ],
      services: [
        "Acupuncture",
        "Herbal Medicine",
        "Cupping Therapy",
        "Virtual Consultations",
      ],
    },
    {
      id: "michael-r",
      name: "Michael R.",
      title: "Yoga Instructor & Meditation Guide",
      experience: "12 years",
      specialty: "Vinyasa Flow, Mindfulness Meditation",
      location: "Austin, Texas",
      image: "🧘‍♂️",
      quote: `"The platform makes it easy to offer both in-person and virtual sessions. My clients appreciate the flexibility, and I've been able to reach students who wouldn't have found me otherwise. The community aspect has been invaluable for my professional growth."`,
      fullStory: `Michael's journey with WellnessCafe began when he realized his Austin-based yoga studio was limiting his impact. With 12 years of experience teaching Vinyasa flow and mindfulness meditation, Michael wanted to reach more students but was constrained by geography.

"I love teaching in person - the energy exchange in a physical space is magical," Michael shares. "But I also recognized that many people can't commit to studio classes due to time constraints, physical limitations, or location."

WellnessCafe provided the perfect solution. "I can now offer private sessions, small group classes, and meditation workshops to anyone with internet access. I've had students from 15 different states join my virtual classes."

The platform's flexibility has allowed Michael to diversify his offerings. "I teach sunrise yoga sessions for East Coast students, afternoon flows for West Coast participants, and evening meditation for my local Austin community. It's incredible how the platform adapts to different time zones."

What Michael values most is the professional community. "The provider forums have connected me with yoga teachers from around the world. I've learned new techniques, collaborated on workshop series, and even co-created online retreats with other instructors."

The results have exceeded his expectations. "My income has tripled since joining WellnessCafe. I've built a sustainable online practice that complements my studio work perfectly. Most importantly, I'm reaching more people with yoga and meditation than I ever dreamed possible."`,
      achievements: [
        "300% increase in teaching income",
        "Students from 15+ states",
        "Created online retreat series",
        "Built sustainable hybrid practice",
        "Expanded professional network globally",
      ],
      services: [
        "Private Yoga Sessions",
        "Group Yoga Classes",
        "Meditation Workshops",
        "Online Retreats",
        "Teacher Training",
      ],
    },
    {
      id: "dr-lisa-k",
      name: "Dr. Lisa K.",
      title: "Clinical Psychologist",
      experience: "15 years",
      specialty: "Trauma-Informed Care, EMDR",
      location: "Seattle, Washington",
      image: "👩‍⚕️",
      quote: `"Finally, a platform that understands the unique needs of wellness practitioners. The community support is invaluable, and the compliance features give me confidence that my practice is fully protected. My clients appreciate the convenience of virtual sessions."`,
      fullStory: `With 15 years as a clinical psychologist specializing in trauma-informed care and EMDR therapy, Dr. Lisa K. has witnessed the evolution of mental health care delivery. When the pandemic accelerated telehealth adoption, she saw both opportunities and challenges.

"I was already doing some telehealth work, but the platforms available were either too medical-focused or lacked the therapeutic features I needed," Dr. K. explains. "I needed something that felt safe, professional, and specifically designed for mental health practitioners."

WellnessCafe's approach resonated with her immediately. "The platform understands that mental health work requires a different level of privacy and security than general wellness services. The HIPAA compliance and 42 CFR Part 2 protections are crucial for my trauma work."

The community aspect has been transformative. "I've connected with other trauma specialists, EMDR practitioners, and mental health professionals from across the country. We share resources, discuss challenging cases (anonymously), and support each other's professional development."

For her clients, the platform has been a game-changer. "Many of my trauma survivors have complex schedules or mobility challenges that make in-person sessions difficult. Virtual sessions through WellnessCafe have made therapy accessible to clients who previously couldn't engage in treatment."

Dr. K. particularly appreciates the platform's therapeutic features. "The session recording capabilities (with client consent), secure messaging, and integrated intake forms streamline my practice. I can focus more on client care and less on administrative tasks."

Her practice has grown significantly. "I've doubled my client load while maintaining the same office hours. The platform has allowed me to serve more people while maintaining work-life balance. Most importantly, I'm helping clients who previously had no access to specialized trauma care."`,
      achievements: [
        "100% increase in client capacity",
        "Expanded trauma care access",
        "Built professional peer network",
        "Streamlined practice administration",
        "Improved work-life balance",
      ],
      services: [
        "Individual Therapy",
        "EMDR Therapy",
        "Trauma Processing",
        "Virtual Sessions",
        "Group Workshops",
      ],
    },
  ];

  return (
    <section className="pv-wrap">
      <div className="pv-header">
        <div>
          <Link to="/providers/apply" className="back-link">
            ← Back to Application
          </Link>
          <h1 className="pv-title">Provider Success Stories</h1>
          <p className="pv-sub">
            Real practitioners sharing their experiences and achievements on
            WellnessCafe
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="testimonials-detail-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-detail-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">{testimonial.image}</div>
              <div className="testimonial-info">
                <h2>{testimonial.name}</h2>
                <p className="testimonial-title">{testimonial.title}</p>
                <p className="testimonial-meta">
                  {testimonial.experience} experience • {testimonial.location}
                </p>
              </div>
            </div>

            <div className="testimonial-quote-section">
              <blockquote className="testimonial-quote-full">
                {testimonial.quote}
              </blockquote>
            </div>

            <div className="testimonial-details">
              <div className="testimonial-specialty">
                <h3>Specialty</h3>
                <p>{testimonial.specialty}</p>
              </div>

              <div className="testimonial-story">
                <h3>Their Story</h3>
                <p>{testimonial.fullStory}</p>
              </div>

              <div className="testimonial-services">
                <h3>Services Offered</h3>
                <ul>
                  {testimonial.services.map((service, index) => (
                    <li key={`${testimonial.id}-service-${index}`}>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="testimonial-achievements">
                <h3>Key Achievements</h3>
                <ul>
                  {testimonial.achievements.map((achievement, index) => (
                    <li key={`${testimonial.id}-achievement-${index}`}>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="success-cta">
        <h2>Join Our Success Stories</h2>
        <p>
          Be part of a growing community of practitioners who are transforming
          their practices and helping more clients than ever before.
        </p>
        <div className="success-stats">
          <div className="success-stat">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Providers</div>
          </div>
          <div className="success-stat">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Sessions Completed</div>
          </div>
          <div className="success-stat">
            <div className="stat-number">95%</div>
            <div className="stat-label">Provider Satisfaction</div>
          </div>
        </div>
        <Link to="/providers/apply" className="cta-button">
          Start Your Success Story
        </Link>
      </div>
    </section>
  );
};

export default TestimonialsDetail;
