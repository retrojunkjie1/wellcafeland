import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Thumbnail.css";

// Fallback to an existing public image to avoid broken links on mobile/iOS
const DEFAULT_FALLBACK = "/images/naaa.jpg";

const isHttpLike = (u) => /^https?:\/\//i.test(u || "");
const isAbsolute = (u) => /^\//.test(u || "");

// Normalize various src forms to a safe, HTTPS-capable URL for the browser
const normalizeSrc = (src) => {
  if (!src) return DEFAULT_FALLBACK;
  let s = String(src).trim();
  // Prefer HTTPS
  if (/^http:\/\//i.test(s)) {
    s = s.replace(/^http:\/\//i, "https://");
  }

  // CRA public folder assets should be absolute from root
  if (!isHttpLike(s) && !isAbsolute(s)) {
    // If author passed something like "images/foo.jpg" or "assets/foo.jpg"
    s = `/${s.replace(/^\.\//, "")}`;
  }
  return s;
};

const Thumbnail = ({ src, alt, className = "", onClick, role = "img" }) => {
  const [url, setUrl] = useState(() => normalizeSrc(src));

  useEffect(() => {
    const s = String(src || "");
    if (/^gs:\/\//i.test(s)) {
      // Try resolving Firebase Storage gs:// URLs to HTTPS download URLs
      (async () => {
        try {
          const mod = await import("firebase/storage");
          const { getStorage, ref, getDownloadURL } = mod;
          const storage = getStorage?.();
          if (!storage) {
            setUrl(DEFAULT_FALLBACK);
            return;
          }
          const r = ref(storage, s);
          const dl = await getDownloadURL(r);
          setUrl(dl);
        } catch (_e) {
          setUrl(DEFAULT_FALLBACK);
        }
      })();
      return;
    }
    setUrl(normalizeSrc(src));
  }, [src]);

  const handleError = (e) => {
    if (url !== DEFAULT_FALLBACK) {
      setUrl(DEFAULT_FALLBACK);
    } else {
      // Avoid infinite loops; detach handler if already fallback
      if (e?.currentTarget) e.currentTarget.onerror = null;
    }
  };

  return (
    <img
      src={url}
      alt={alt || ""}
      onError={handleError}
      className={`wc-thumb ${className}`}
      onClick={onClick}
      role={role}
      loading="lazy"
      decoding="async"
    />
  );
};

Thumbnail.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  role: PropTypes.string,
};

export default Thumbnail;
