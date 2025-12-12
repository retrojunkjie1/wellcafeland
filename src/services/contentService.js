// src/services/contentService.js

import { getContentRegistryEntry, listContentBySection } from "@/content/contentRegistry";

/**
 * Very small Markdown frontmatter parser.
 * Expects frontmatter between --- lines at the top.
 */
function parseFrontmatter(raw) {
  if (typeof raw !== "string") {
    return { meta: {}, body: "" };
  }

  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) {
    return { meta: {}, body: raw };
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { meta: {}, body: raw };
  }

  const fmBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 4).trim();

  const meta = {};
  fmBlock.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) return;
    const valueRaw = rest.join(":").trim();
    const value = valueRaw.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    meta[key.trim()] = value;
  });

  return { meta, body };
}

/**
 * Load raw content by registry ID using Vite's import.meta.glob.
 * Only Phase 34: file-based, no Firestore writes.
 * Phase 61: Updated to new Vite glob syntax (query: '?raw', import: 'default')
 */
const contentFiles = import.meta.glob("../content/**/*.md", {
  query: '?raw',
  import: 'default',
});

/**
 * Load a content module by ID.
 * Returns: { id, title, section, tags, meta, body } or null.
 */
export async function loadContentById(id) {
  const entry = getContentRegistryEntry(id);
  if (!entry) return null;

  const filePath = `../content/${entry.file}`;
  const loader = contentFiles[filePath];

  if (!loader) {
    console.warn("[contentService] No loader for path:", filePath);
    return null;
  }

  try {
    const raw = await loader();
    const { meta, body } = parseFrontmatter(raw);

    return {
      id: entry.id,
      section: entry.section,
      title: meta.title || entry.title,
      tags: entry.tags || meta.tags || [],
      meta,
      body,
    };
  } catch (err) {
    console.warn("[contentService] Failed to load content:", id, err);
    return null;
  }
}

/**
 * List content summaries by section.
 * Useful for listing in UI (Tools, Recovery, Education, etc.).
 */
export function listContentSummaries(section) {
  const list = listContentBySection(section);
  return list.map((entry) => ({
    id: entry.id,
    title: entry.title,
    section: entry.section,
    tags: entry.tags || [],
    file: entry.file,
  }));
}

