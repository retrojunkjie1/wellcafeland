import React from "react";
import PageTemplate from "./PageTemplate";

const Yoga = () => {
  return (
    <PageTemplate
      pageType="yoga"
      title="Yoga, Mindfulness & Mindful Movement Practices"
      intro="Ancient wisdom meets modern science in transformative yoga practices, breathwork, and meditation. Discover balance, strength, and inner peace through personalized movement sequences designed to heal body, mind, and spirit."
      features={[
        {
          title: "Adaptive Flow Sequences & Personalized Practice",
          desc: "AI-powered yoga sequences that adapt to your current abilities, injuries, and goals. Choose from Hatha, Vinyasa, Yin, Restorative, and therapeutic styles. Progress tracking ensures your practice evolves safely while building strength, flexibility, and mindfulness.",
        },
        {
          title: "Breathwork & Pranayama Techniques",
          desc: "Master the art of conscious breathing with guided pranayama practices including Ujjayi, Nadi Shodhana, Kapalabhati, and Box Breathing. Learn to use breath as a tool for stress reduction, emotional regulation, energy cultivation, and deep relaxation.",
        },
        {
          title: "Meditation & Mindfulness Training",
          desc: "Cultivate presence and inner stillness through various meditation traditions including mindfulness, transcendental, loving-kindness, and body scan practices. Access guided meditations for sleep, anxiety reduction, focus enhancement, and spiritual growth.",
        },
        {
          title: "Therapeutic & Restorative Yoga",
          desc: "Specialized practices for specific conditions including anxiety, depression, chronic pain, PTSD, and recovery support. Gentle restorative poses held with props promote deep relaxation, nervous system regulation, and healing at the cellular level.",
        },
        {
          title: "Movement Integration & Somatics",
          desc: "Combine yoga with somatic practices, dance movement therapy, and embodied awareness techniques. Release stored tension, improve body awareness, and develop a deeper connection between mind, body, and spirit through mindful movement.",
        },
        {
          title: "Chakra Balancing & Energy Work",
          desc: "Align your energy centers through targeted asana sequences, visualization practices, and sound healing. Learn to identify and balance the seven major chakras for optimal physical, emotional, and spiritual well-being.",
        },
        {
          title: "Yoga Philosophy & Lifestyle Integration",
          desc: "Explore the deeper teachings of yoga philosophy including the Eight Limbs of Yoga, yamas and niyamas, and principles for conscious living. Integrate yogic wisdom into daily life for greater purpose, compassion, and authentic self-expression.",
        },
        {
          title: "Community Practice & Group Classes",
          desc: "Join virtual and in-person yoga communities for shared practice experiences. Participate in themed classes, seasonal practices, and special events that foster connection, accountability, and collective healing energy.",
        },
        {
          title: "Teacher Training & Advanced Practice",
          desc: "Deepen your practice through structured teacher training programs, advanced workshops, and specialized certifications. Learn to share the transformative power of yoga with others while continuing your own journey of self-discovery.",
        },
        {
          title: "Holistic Wellness Integration",
          desc: "Combine yoga with nutrition, Ayurveda, herbal medicine, and other wellness modalities for comprehensive health support. Create personalized wellness plans that address physical, mental, emotional, and spiritual aspects of well-being.",
        },
      ]}
      ctaText="Begin your journey of mindful movement and self-discovery. Whether you're new to yoga or deepening an established practice, our comprehensive approach offers the tools, guidance, and community support you need to cultivate balance, strength, and inner peace. Step onto your mat and transform your life through the ancient art of yoga."
    />
  );
};

export default Yoga;
