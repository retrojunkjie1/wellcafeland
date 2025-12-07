// src/components/content/ContentViewer.jsx

import React from "react";

/**
 * Parse markdown text for bold (**text**) formatting
 */
const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Handle bold text (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-semibold text-white">{boldText}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export const ContentViewer = ({ title, body }) => {
  if (!body) return null;

  const paragraphs = body.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="prose prose-invert max-w-none">
      {title && <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-white">{title}</h1>}
      {paragraphs.map((para, idx) => {
        // Check if it's a heading
        if (para.startsWith("###")) {
          const headingText = para.replace(/^###\s*/, "");
          return (
            <h3 key={idx} className="text-lg sm:text-xl font-semibold text-white mt-8 mb-4 tracking-tight first:mt-0">
              {parseMarkdown(headingText)}
            </h3>
          );
        }
        
        // Check if it's a numbered list
        if (/^\d+\./.test(para.trim())) {
          const items = para.split(/\n/).filter(line => /^\d+\./.test(line.trim()));
          return (
            <ol key={idx} className="space-y-4 mb-6 pl-1">
              {items.map((item, itemIdx) => {
                const content = item.replace(/^\d+\.\s*/, "");
                return (
                  <li key={itemIdx} className="text-sm sm:text-base text-white/85 leading-relaxed ml-6">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400/20 text-amber-200 flex items-center justify-center text-xs font-semibold -ml-9">
                        {itemIdx + 1}
                      </span>
                      <div className="flex-1">
                        {parseMarkdown(content)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          );
        }
        
        // Check if it's an unordered list
        if (para.startsWith("-") || para.startsWith("*")) {
          const items = para.split(/\n/).filter(line => line.trim().startsWith("-") || line.trim().startsWith("*"));
          return (
            <ul key={idx} className="space-y-2 mb-6 ml-6">
              {items.map((item, itemIdx) => {
                const content = item.replace(/^[-*]\s*/, "");
                return (
                  <li key={itemIdx} className="text-sm sm:text-base text-white/85 leading-relaxed relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-amber-300/60 before:font-bold">
                    {parseMarkdown(content)}
                  </li>
                );
              })}
            </ul>
          );
        }
        
        // Regular paragraph
        return (
          <p key={idx} className="text-sm sm:text-base text-white/85 mb-4 leading-relaxed">
            {parseMarkdown(para)}
          </p>
        );
      })}
    </article>
  );
};


