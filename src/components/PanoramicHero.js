import React from "react";
import heroPanorama from "../assets/images/wellnesscafe -HomePage-header-v1.png";

const PanoramicHero = () => {
  return (
    <div className="panoramic-background">
      <img
        src={heroPanorama}
        alt="WellnessCafe Hero Panorama"
        className="hero-panorama-image"
      />
    </div>
  );
};

export default PanoramicHero;
