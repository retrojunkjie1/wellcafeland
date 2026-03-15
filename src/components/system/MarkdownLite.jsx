// src/components/system/MarkdownLite.jsx
// Safe Markdown-lite renderer (no HTML, no dangerouslySetInnerHTML).

import React from "react";

const wrapperClass = "wc-md text-[15px] sm:text-[16px] leading-relaxed text-white/85";
const headingClass = "mt-3 font-medium tracking-wide text-white";
const listClass = "mt-2 space-y-1 pl-5";
const quoteClass = "mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/75";
const codeClass = "rounded-md border border-white/10 bg-black/30 px-1 py-0.5 text-[0.95em] text-white/80";
const highlightClass = "mt-3 rounded-2xl border border-amber-400/15 bg-amber-400/5 px-3 py-2 text-white/80";

function parseInline(str) {
  if(!str) return [];
  const out = [];
  let i = 0;
  while(i < str.length) {
    const rest = str.slice(i);
    const bold = rest.match(/^\*\*(.+?)\*\*/);
    const italic = rest.match(/^(?!\*\*)\*(.+?)\*/);
    const code = rest.match(/^`([^`]+)`/);
    if(bold) {
      out.push({ type: "strong", text: bold[1] });
      i += bold[0].length;
    } else if(italic) {
      out.push({ type: "em", text: italic[1] });
      i += italic[0].length;
    } else if(code) {
      out.push({ type: "code", text: code[1] });
      i += code[0].length;
    } else {
      const next = rest.search(/\*\*|(?!\*\*)\*|`/);
      const end = next === -1 ? rest.length : next;
      if(end > 0) out.push({ type: "text", text: rest.slice(0, end) });
      i += end || 1;
    }
  }
  return out;
}

function renderInline(nodes) {
  return nodes.map((n, i) => {
    if(n.type === "strong") return <strong key={i}>{n.text}</strong>;
    if(n.type === "em") return <em key={i}>{n.text}</em>;
    if(n.type === "code") return <code key={i} className={codeClass}>{n.text}</code>;
    return <React.Fragment key={i}>{n.text}</React.Fragment>;
  });
}

function parseBlocks(text) {
  if(!text || typeof text !== "string") return [];
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while(i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimEnd();
    if(trimmed.startsWith("# ")) {
      blocks.push({ type: "h3", raw: trimmed.slice(2) });
      i++;
    } else if(trimmed.startsWith("## ")) {
      blocks.push({ type: "h4", raw: trimmed.slice(3) });
      i++;
    } else if(trimmed.startsWith("!! ")) {
      blocks.push({ type: "highlight", raw: trimmed.slice(3) });
      i++;
    } else if(trimmed.startsWith("> ")) {
      blocks.push({ type: "quote", raw: trimmed.slice(2) });
      i++;
    } else if(trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = [];
      while(i < lines.length) {
        const l = lines[i];
        const t = l.trimEnd();
        if(t.startsWith("- ") || t.startsWith("* ")) {
          items.push(t.slice(2));
          i++;
        } else if(t === "") {
          i++;
        } else break;
      }
      blocks.push({ type: "ul", items });
    } else if(/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while(i < lines.length) {
        const l = lines[i];
        const t = l.trimEnd();
        const num = t.match(/^(\d+)\.\s(.+)$/);
        if(num) {
          items.push(num[2]);
          i++;
        } else if(t === "") {
          i++;
        } else break;
      }
      blocks.push({ type: "ol", items });
    } else if(trimmed === "") {
      blocks.push({ type: "br" });
      i++;
    } else {
      blocks.push({ type: "p", raw: trimmed });
      i++;
    }
  }
  return blocks;
}

export default function MarkdownLite({ text }) {
  if(!text) return null;
  const blocks = parseBlocks(text);
  return (
    <div className={wrapperClass}>
      {blocks.map((block, idx) => {
        if(block.type === "h3") return <h3 key={idx} className={headingClass + " text-lg"}>{renderInline(parseInline(block.raw))}</h3>;
        if(block.type === "h4") return <h4 key={idx} className={headingClass + " text-base"}>{renderInline(parseInline(block.raw))}</h4>;
        if(block.type === "highlight") return <div key={idx} className={highlightClass}>{renderInline(parseInline(block.raw))}</div>;
        if(block.type === "quote") return <blockquote key={idx} className={quoteClass}>{renderInline(parseInline(block.raw))}</blockquote>;
        if(block.type === "ul") return <ul key={idx} className={listClass}>{block.items.map((item, j) => <li key={j}>{renderInline(parseInline(item))}</li>)}</ul>;
        if(block.type === "ol") return <ol key={idx} className={listClass}>{block.items.map((item, j) => <li key={j}>{renderInline(parseInline(item))}</li>)}</ol>;
        if(block.type === "br") return <br key={idx} />;
        if(block.type === "p") return <p key={idx} className="mt-2 first:mt-0">{renderInline(parseInline(block.raw))}</p>;
        return null;
      })}
    </div>
  );
}
