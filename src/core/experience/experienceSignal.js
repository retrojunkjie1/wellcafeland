export const parseExperienceSignal = (text) => {
  const s = String(text || "");
  const start = s.lastIndexOf("[[EXPERIENCE]]");
  const end = s.lastIndexOf("[[/EXPERIENCE]]");
  if (start === -1 || end === -1 || end <= start) return {cleanText: s, signal: null};

  const jsonRaw = s.slice(start + 13, end).trim();
  let signal = null;
  try {
    signal = JSON.parse(jsonRaw);
  } catch (e) {
    signal = null;
  }

  const cleanText = (s.slice(0, start).trim() + "\n").trim();
  return {cleanText, signal};
};
