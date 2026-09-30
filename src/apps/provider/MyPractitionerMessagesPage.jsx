import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle, RefreshCw, Send } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";
import { listMyPractitionerShares } from "@/services/practitionerRegistry";
import { listMyPractitionerMessages, sendClientMessage } from "@/services/practitionerMessaging";

export default function MyPractitionerMessagesPage() {
  const [searchParams] = useSearchParams();
  const [practitioners, setPractitioners] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let active = true;
    listMyPractitionerShares().then(({ shares = [] }) => {
      if (!active) return;
      setPractitioners(shares);
      const requestedId = searchParams.get("practitionerId");
      setSelectedId((current) => current || (shares.some((share) => share.practitionerId === requestedId) ? requestedId : shares[0]?.practitionerId) || "");
    }).catch((err) => { if (active) setError(err?.message || "Your connected practitioners could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    if (!selectedId) { setMessages([]); return () => { active = false; }; }
    setLoading(true); setError(""); setNotice("");
    listMyPractitionerMessages(selectedId).then((items) => { if (active) setMessages(items); })
      .catch((err) => { if (active) setError(err?.message || "This conversation could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedId) return undefined;
    let active = true;
    const interval = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      setRefreshing(true);
      try {
        const items = await listMyPractitionerMessages(selectedId);
        if (active) {
          setMessages((current) => current.length === items.length && current.every((item, index) => item.id === items[index]?.id) ? current : items);
          setError("");
        }
      } catch (err) {
        if (active) setError(err?.message || "New messages could not be checked. You can try refreshing.");
      } finally { if (active) setRefreshing(false); }
    }, 20000);
    return () => { active = false; window.clearInterval(interval); };
  }, [selectedId]);

  const refresh = async () => {
    if (!selectedId || refreshing) return;
    setRefreshing(true); setError("");
    try { setMessages(await listMyPractitionerMessages(selectedId)); }
    catch (err) { setError(err?.message || "Messages could not be refreshed. Please try again."); }
    finally { setRefreshing(false); }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || !selectedId || sending) return;
    setSending(true); setError(""); setNotice("");
    try {
      await sendClientMessage(selectedId, content);
      setText("");
      setMessages(await listMyPractitionerMessages(selectedId));
      setNotice("Message sent.");
    } catch (err) { setError(err?.message || "Your message could not be sent. Please try again."); }
    finally { setSending(false); }
  };

  const practitioner = practitioners.find((item) => item.practitionerId === selectedId);
  return <div className="min-h-screen bg-slate-950 text-white"><PageHeader title="Messages with your practitioner" subtitle="Private messages for coordinating support" />
    <main className="lux-shell py-6 sm:py-8">
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200/20 bg-rose-300/[0.07] p-3 text-sm text-rose-100">{error}</p>}
      {loading && !practitioners.length ? <p className="py-10 text-center text-sm text-white/55">Loading your connections…</p> : !practitioners.length ? <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center"><MessageCircle className="mx-auto h-8 w-8 text-amber-100/65" /><h2 className="mt-3 font-medium">No practitioner connection yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/55">After you connect with a practitioner, this is where you can coordinate sessions and ask follow-up questions.</p></section> : <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3"><label htmlFor="practitioner-message-select" className="text-sm text-white/60">Conversation</label><select id="practitioner-message-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="min-h-10 min-w-48 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white">{practitioners.map((item) => <option key={item.practitionerId} value={item.practitionerId}>{item.name} · {item.type}</option>)}</select><span className="text-xs text-white/40">Available while your connection is active</span><button type="button" onClick={refresh} disabled={refreshing || loading} aria-label="Refresh messages" title="Refresh messages" className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/65 hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></button></div>
        <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">{loading ? <p className="py-10 text-center text-sm text-white/45">Loading messages…</p> : messages.length ? messages.map((item) => <article key={item.id} className={`flex ${item.senderRole === "client" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl border px-4 py-3 sm:max-w-[75%] ${item.senderRole === "client" ? "border-amber-100/15 bg-amber-200/[0.08]" : "border-white/10 bg-white/[0.045]"}`}><p className="text-sm leading-relaxed text-white/85">{item.content}</p><time className="mt-2 block text-right text-[11px] text-white/40">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just sent"}</time></div></article>) : <div className="mx-auto max-w-md py-14 text-center"><MessageCircle className="mx-auto h-8 w-8 text-amber-100/60" /><h2 className="mt-3 font-medium">Start the conversation when you’re ready</h2><p className="mt-1 text-sm leading-relaxed text-white/50">Use this space to coordinate a visit or follow up about support. You can share only what you choose.</p></div>}<div ref={messagesEndRef} /></div>
        <form onSubmit={handleSend} className="border-t border-white/10 p-3 sm:p-4"><label className="sr-only" htmlFor="client-practitioner-message">Write a message</label><div className="flex items-end gap-2"><textarea id="client-practitioner-message" rows={2} maxLength={4000} value={text} onChange={(event) => setText(event.target.value.slice(0, 4000))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(event); } }} placeholder={`Message ${practitioner?.name || "your practitioner"}…`} className="min-h-12 flex-1 resize-y rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white placeholder:text-white/35 focus:border-amber-100/40 focus:outline-none" /><button type="submit" disabled={!text.trim() || sending} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 disabled:opacity-45"><Send className="h-4 w-4" />{sending ? "Sending…" : "Send"}</button></div><div className="mt-2 flex justify-between text-xs text-white/40"><span>Enter sends · Shift + Enter adds a line</span><span>{text.length}/4000</span></div>{notice && <p role="status" className="mt-2 text-sm text-emerald-200">{notice}</p>}</form>
      </section>}
      <p className="mt-3 text-xs leading-relaxed text-white/40">{refreshing ? "Checking for new messages… " : "Messages refresh automatically while this page is open. "}Messages may not be read right away and are not an emergency service.</p>
    </main>
  </div>;
}
