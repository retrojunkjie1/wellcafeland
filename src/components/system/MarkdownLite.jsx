// Safe Markdown-lite renderer (no HTML, no dangerouslySetInnerHTML).

import React from "react";

const wrapperClass = "wc-md text-[15px] leading-[1.7] text-white/85 sm:text-base";
const headingClass = "font-medium tracking-[-0.025em] text-white";
const listClass = "my-3 space-y-2 pl-5 marker:text-amber-200/70";
const quoteClass = "my-4 border-l-2 border-amber-200/60 bg-amber-100/[0.045] py-3 pl-4 pr-3 text-white/90 sm:pl-5";
const codeClass = "rounded-md border border-white/10 bg-black/30 px-1 py-0.5 text-[0.95em] text-white/80";
const highlightClass = "my-4 rounded-xl border border-amber-200/20 bg-amber-100/[0.055] px-4 py-3 text-white/90";

function parseInline(str) {
  if (!str) return [];
  const out = [];
  let i = 0;
  while (i < str.length) {
    const rest = str.slice(i);
    const bold = rest.match(/^\*\*(.+?)\*\*/);
    const italic = rest.match(/^(?!\*\*)\*(.+?)\*/);
    const code = rest.match(/^`([^`]+)`/);
    if (bold) {
      out.push({ type: "strong", text: bold[1] });
      i += bold[0].length;
    } else if (italic) {
      out.push({ type: "em", text: italic[1] });
      i += italic[0].length;
    } else if (code) {
      out.push({ type: "code", text: code[1] });
      i += code[0].length;
    } else {
      const next = rest.search(/\*\*|(?!\*\*)\*|`/);
      const end = next === -1 ? rest.length : next;
      if (end > 0) out.push({ type: "text", text: rest.slice(0, end) });
      i += end || 1;
    }
  }
  return out;
}

function renderInline(nodes) {
  return nodes.map((node, index) => {
    if (node.type === "strong") return <strong key={index} className="font-semibold text-white">{node.text}</strong>;
    if (node.type === "em") return <em key={index} className="text-white/95">{node.text}</em>;
    if (node.type === "code") return <code key={index} className={codeClass}>{node.text}</code>;
    return <React.Fragment key={index}>{node.text}</React.Fragment>;
  });
}

const isRule = (line) => /^\s*(?:---+|___+|\*\s*\*\s*\*\s*)\s*$/.test(line);
const isListItem = (line) => /^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line);
const isBlockStart = (line) => /^\s{0,3}#{1,3}\s+/.test(line) || /^\s*!!\s+/.test(line) || /^\s*>/.test(line) || isRule(line) || isListItem(line);

function parseBlocks(text) {
  if (!text || typeof text !== "string") return [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    if (isRule(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: heading[1].length === 1 ? "h2" : "h3", raw: heading[2] });
      i++;
      continue;
    }

    if (line.startsWith("!! ")) {
      blocks.push({ type: "highlight", raw: line.slice(3) });
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ type: "quote", raw: quote.join(" ").trim() });
      continue;
    }

    if (isListItem(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length) {
        const item = lines[i].trim().match(ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/);
        if (item) { items.push(item[1]); i++; }
        else if (!lines[i].trim()) i++;
        else break;
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }

    // A standalone quoted sentence reads more clearly as a callout than as inline punctuation.
    const standaloneQuote = line.match(/^(?:"([^"]+)"|'([^']+)'|“([^”]+)”|‘([^’]+)’)$/);
    const quotedText = standaloneQuote?.slice(1).find(Boolean);
    if (quotedText?.trim()) {
      blocks.push({ type: "quote", raw: quotedText.trim() });
      i++;
      continue;
    }

    const paragraph = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i].trim())) paragraph.push(lines[i++].trim());
    blocks.push({ type: "p", raw: paragraph.join(" ") });
  }
  return blocks;
}

export default function MarkdownLite({ text }) {
  if (!text) return null;
  const blocks = parseBlocks(text);
  return (
    <div className={wrapperClass}>
      {blocks.map((block, index) => {
        if (block.type === "h2") return <h2 key={index} className={`${headingClass} mb-1 mt-5 text-xl first:mt-0 sm:text-2xl`}>{renderInline(parseInline(block.raw))}</h2>;
        if (block.type === "h3") return <h3 key={index} className={`${headingClass} mb-1 mt-4 text-lg first:mt-0 sm:text-xl`}>{renderInline(parseInline(block.raw))}</h3>;
        if (block.type === "highlight") return <div key={index} className={highlightClass}>{renderInline(parseInline(block.raw))}</div>;
        if (block.type === "quote") return <blockquote key={index} className={quoteClass}>{renderInline(parseInline(block.raw))}</blockquote>;
        if (block.type === "ul") return <ul key={index} className={`${listClass} list-disc`}>{block.items.map((item, itemIndex) => <li key={itemIndex} className="pl-1">{renderInline(parseInline(item))}</li>)}</ul>;
        if (block.type === "ol") return <ol key={index} className={`${listClass} list-decimal`}>{block.items.map((item, itemIndex) => <li key={itemIndex} className="pl-1">{renderInline(parseInline(item))}</li>)}</ol>;
        if (block.type === "rule") return <hr key={index} className="my-4 border-0 border-t border-white/10" />;
        if (block.type === "p") return <p key={index} className="my-2 first:mt-0 last:mb-0">{renderInline(parseInline(block.raw))}</p>;
        return null;
      })}
    </div>
  );
}
