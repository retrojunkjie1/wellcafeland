import React from "react";
import PropTypes from "prop-types";
import "./PageBanner.css";

const normalizeBg = (src)=>{
  if (!src) return "";
  let s = String(src).trim();
  if (/^http:\/\//i.test(s)) s = s.replace(/^http:\/\//i, "https://");
  // If relative without leading slash, make it absolute to work under ngrok/prod
  if (!/^https?:\/\//i.test(s) && !/^\//.test(s)){
    s = `/${s.replace(/^\.\//, "")}`;
  }
  return s;
};

const PageBanner = ({imageSrc, altText, overlayClasses = ""})=>{
  const bg = normalizeBg(imageSrc);
  return (
    <section
      className={`page-banner ${overlayClasses}`}
      role="img"
      aria-label={altText || ""}
      style={{backgroundImage:`url(${bg})`}}
    >
      <div className="page-banner-inner"></div>
    </section>
  );
};

PageBanner.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  altText: PropTypes.string,
  overlayClasses: PropTypes.string,
};

export default PageBanner;
