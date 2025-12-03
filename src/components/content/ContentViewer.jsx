// src/components/content/ContentViewer.jsx

import React from "react";

export const ContentViewer = ({ title, body }) => {
  if (!body) return null;

  const paragraphs = body.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="prose prose-invert max-w-none">
      {title && <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-white">{title}</h1>}
      {paragraphs.map((para, idx) => {
        // Check if it's a heading
        if (para.startsWith("###")) {
          const headingText = para.replace(/^###\s*/, "");
          return (
            <h3 key={idx} className="text-lg font-semibold text-white mt-6 mb-3">
              {headingText}
            </h3>
          );
        }
        // Check if it's a list item
        if (para.startsWith("-") || para.startsWith("*")) {
          const items = para.split(/\n/).filter(line => line.trim().startsWith("-") || line.trim().startsWith("*"));
          return (
            <ul key={idx} className="list-disc list-inside space-y-2 mb-3 text-white/80">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-sm sm:text-base">
                  {item.replace(/^[-*]\s*/, "")}
                </li>
              ))}
            </ul>
          );
        }
        // Regular paragraph
        return (
          <p key={idx} className="text-sm sm:text-base text-white/80 mb-3 leading-relaxed">
            {para}
          </p>
        );
      })}
    </article>
  );
};


