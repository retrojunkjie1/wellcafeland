import { useEffect, useMemo, useState } from "react";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";

export default function useAutoSpeak({ messages, pending }) {
  // Voice playback stays off unless the person opts in. Use a new key so browsers
  // that previously stored the old default-on value don't inherit it as consent.
  const key = "wc_autospeak_enabled_v2";
  const [enabled, setEnabled] = useState(() => {
    const v = safeLocalStorage.get(key);
    return v === "1";
  });

  const lastSpokenIdRefKey = "wc_autospeak_last_id";

  useEffect(() => {
    safeLocalStorage.set(key, enabled ? "1" : "0");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (pending) return;
    const last = (messages?.length) ? messages[messages.length - 1] : null;
    if (!last) return;
    if (last.role !== "assistant") return;
    if (last.type === "system") return;
    if (!last.content) return;

    const lastId = safeLocalStorage.get(lastSpokenIdRefKey);
    if (lastId && lastId === String(last.id)) return;

    try {
      window.speechSynthesis?.cancel?.();
      const u = new SpeechSynthesisUtterance(String(last.content));
      u.rate = 1;
      u.pitch = 1;
      window.speechSynthesis?.speak?.(u);
      safeLocalStorage.set(lastSpokenIdRefKey, String(last.id));
    } catch (e) {}
  }, [enabled, messages, pending]);

  return useMemo(() => ({ autoSpeakEnabled: enabled, setAutoSpeakEnabled: setEnabled }), [enabled]);
}
