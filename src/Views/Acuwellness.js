import React, { useState } from "react";
import PageTemplate from "./PageTemplate";
import "./Acuwellness.css";

const Acuwellness = () => {
  const pageFeatures = [
    {
      title: "Traditional Acupuncture & Meridian Therapy",
      desc: "Precise treatments targeting meridian points to restore energy flow (Qi), release blockages, and promote natural healing for pain, stress, and chronic conditions.",
    },
    {
      title: "Acupressure & Self-Care",
      desc: "Learn powerful self-care techniques for headaches, anxiety, and insomnia. Master point stimulation for ongoing wellness maintenance at home.",
    },
    {
      title: "The NADA Protocol",
      desc: "Grounded in the work of the National Acupuncture Detoxification Association, this protocol is a simple, effective 5-point ear acupuncture treatment for trauma, substance misuse, and mental health.",
    },
    {
      title: "Chinese Herbal Medicine & Nutrition",
      desc: "Discover personalized herbal formulas and dietary therapy based on traditional principles to nourish your body and spirit.",
    },
    {
      title: "Cupping & Gua Sha Therapy",
      desc: "Experience traditional cupping and Gua Sha to improve circulation, release muscle tension, and promote detoxification and facial rejuvenation.",
    },
    {
      title: "Qi Gong & Movement Medicine",
      desc: "Practice gentle Qi Gong exercises that cultivate internal energy, improve balance, and enhance meditation through flowing movements.",
    },
  ];

  const videos = [
    {
      id: "tvrj2aLd22o",
      title: "Acuwellness on Campus: The NADA Protocol",
      description:
        "Watch how this simple, affordable, and community-building treatment is supporting college students.",
    },
    {
      id: "LXbOL_3-p-Q",
      title: "What is Acu-wellness?",
      description:
        "An introduction to the principles of Acu-wellness and its benefits for modern health.",
    },
    {
      id: "_8s4h_n1_xc",
      title: "Facial Rejuvenation with Acupuncture",
      description:
        "Discover the 'Acu-face-lift' and how cosmetic acupuncture can naturally enhance your skin's health and appearance.",
    },
    {
      id: "m-r1gOC_y_c",
      title: "Acupressure for Stress Relief",
      description:
        "Learn simple acupressure points to quickly relieve stress and anxiety.",
    },
    {
      id: "n-evy2l9A2I",
      title: "Introduction to Qi Gong",
      description:
        "Follow along with a beginner's Qi Gong routine to cultivate energy and improve balance.",
    },
    {
      id: "40-n4_FhU-c",
      title: "Cupping Therapy Explained",
      description:
        "See how cupping therapy works to release muscle tension and improve circulation.",
    },
  ];

  const [currentVideo, setCurrentVideo] = useState(videos[0]);
  const [hoveredVideo, setHoveredVideo] = useState(null);

  const handleThumbnailClick = (video) => {
    setCurrentVideo(video);
  };

  return (
    <>
      <PageTemplate
        pageType="acuwellness"
        title="Acuwellness: Ancient Healing for Modern Wellness"
        intro="Experience the profound healing power of acupuncture, acupressure, and traditional Chinese medicine. Restore balance, release blockages, and cultivate optimal health through time-tested Eastern healing wisdom."
        features={pageFeatures}
        ctaText="Embark on a journey of deep healing and balance through the ancient wisdom of Acuwellness. Our experienced practitioners blend traditional techniques with modern understanding to address your unique health concerns."
      />

      <div className="video-player-section">
        <div className="main-video-container">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="main-video-info">
          <h2 className="main-video-title">{currentVideo.title}</h2>
          <p className="main-video-description">{currentVideo.description}</p>
        </div>
      </div>

      <div className="video-gallery-section">
        <h2 className="video-gallery-title">Explore More Videos</h2>
        <div className="video-thumbnail-gallery">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              className={`thumbnail-card ${
                currentVideo.id === video.id ? "active" : ""
              }`}
              onClick={() => handleThumbnailClick(video)}
              onMouseEnter={() => setHoveredVideo(video.id)}
              onMouseLeave={() => setHoveredVideo(null)}
              aria-pressed={currentVideo.id === video.id}
              aria-label={`Play ${video.title}`}
            >
              <div className="thumbnail-video-container">
                {hoveredVideo === video.id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="thumbnail-video"
                  ></iframe>
                ) : (
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    className="thumbnail-image"
                  />
                )}
              </div>
              <h3 className="thumbnail-title">{video.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Acuwellness;
