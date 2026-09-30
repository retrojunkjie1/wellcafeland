import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { listProviderConversationMessages, sendProviderMessage } from "@/services/practitionerMessaging";
import PageHeader from "@/components/navigation/PageHeader";
import { MessageSquare, RefreshCw, Send, Users } from "lucide-react";

const humanError = (error, fallback) => {
  const code = error?.code || "";
  if (code.includes("permission-denied")) return "This conversation is no longer available. Confirm that you and this person are still connected.";
  if (code.includes("unauthenticated")) return "Your sign-in has expired. Sign in again to continue.";
  return error?.message || fallback;
};

export default function ProviderMessagesPage() {
  const [searchParams] = useSearchParams();
  const { providerId, userId, isProvider, isAdmin } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const messagesEndRef = useRef(null);
  const providerIdToUse = providerId || userId;

  useEffect(() => {
    let active = true;
    setClientsLoading(true);
    listAssignmentsForProvider(providerIdToUse)
      .then((assignments) => {
        if (!active) return;
        const connected = assignments.map((assignment, index) => ({
          id: assignment.clientId,
          alias: assignment.alias || `Client ${index + 1}`,
        }));
        setClients(connected);
        const requestedId = searchParams.get("clientId");
        setSelectedClientId(connected.some((client) => client.id === requestedId) ? requestedId : (connected[0]?.id || ""));
      })
      .catch((err) => { if (active) setError(humanError(err, "Your connected people could not be loaded.")); })
      .finally(() => { if (active) setClientsLoading(false); });
    return () => { active = false; };
  }, [providerIdToUse, searchParams]);

  useEffect(() => {
    if (!selectedClientId) { setMessages([]); return undefined; }
    let active = true;
    setMessagesLoading(true);
    setError("");
    listProviderConversationMessages(selectedClientId)
      .then((items) => { if (active) setMessages(items); })
      .catch((err) => { if (active) setError(humanError(err, "Messages could not be loaded.")); })
      .finally(() => { if (active) setMessagesLoading(false); });
    return () => { active = false; };
  }, [selectedClientId]);

  useEffect(() => {
    if (!selectedClientId) return undefined;
    let active = true;
    const interval = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      setRefreshing(true);
      try {
        const items = await listProviderConversationMessages(selectedClientId);
        if (active) {
          setMessages((current) => current.length === items.length && current.every((item, index) => item.id === items[index]?.id) ? current : items);
          setError("");
        }
      } catch (err) {
        if (active) setError(humanError(err, "New messages could not be checked. You can try refreshing."));
      } finally { if (active) setRefreshing(false); }
    }, 20000);
    return () => { active = false; window.clearInterval(interval); };
  }, [selectedClientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  const refresh = async () => {
    if (!selectedClientId) return;
    setRefreshing(true);
    setError("");
    try { setMessages(await listProviderConversationMessages(selectedClientId)); }
    catch (err) { setError(humanError(err, "Messages could not be refreshed.")); }
    finally { setRefreshing(false); }
  };

  const handleSend = async (event) => {
    event?.preventDefault?.();
    const content = messageText.trim();
    if (!content || !selectedClientId || sending) return;
    setSending(true); setError(""); setNotice("");
    try {
      await sendProviderMessage(selectedClientId, content);
      setMessageText("");
      setNotice("Message sent securely.");
      await refresh();
    } catch (err) {
      setError(humanError(err, "Your message could not be sent. Please try again."));
    } finally { setSending(false); }
  };

  if (!isProvider && !isAdmin) return null;

  return <div className="min-h-screen bg-slate-950 text-white">
    <PageHeader title="Messages" subtitle="A private space to coordinate with connected people" />
    <main className="lux-shell py-6 sm:py-8">
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200/20 bg-rose-300/[0.07] p-3 text-sm text-rose-100">{error}</p>}
      <section className="grid min-h-[34rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] md:grid-cols-[16rem_1fr]">
        <aside className="border-b border-white/10 bg-white/[0.025] md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-white/10 p-4"><Users className="h-4 w-4 text-amber-100" /><h2 className="text-sm font-semibold">Connected people</h2></div>
          {clientsLoading ? <p className="p-4 text-sm text-white/50">Loading connections…</p> : clients.length ? <div className="space-y-1 p-2">{clients.map((client) => <button key={client.id} type="button" onClick={() => { setSelectedClientId(client.id); setNotice(""); }} aria-pressed={selectedClientId === client.id} className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${selectedClientId === client.id ? "bg-amber-200/10 text-amber-50" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>{client.alias}</button>)}</div> : <p className="p-4 text-sm leading-relaxed text-white/50">Once a person accepts your connection, you can message them here.</p>}
        </aside>

        <div className="flex min-h-[30rem] flex-col">
          {selectedClientId ? <>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5"><div className="min-w-0"><h2 className="text-sm font-semibold">{clients.find((client) => client.id === selectedClientId)?.alias || "Connected person"}</h2><p className="mt-0.5 text-xs text-white/45">Messages are available only while your connection is active.</p></div><button type="button" onClick={refresh} disabled={messagesLoading || refreshing} aria-label="Refresh messages" title="Refresh messages" className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/65 hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></button></div>
            <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {messagesLoading && !messages.length ? <p className="py-8 text-center text-sm text-white/45">Loading this conversation…</p> : messages.length ? messages.map((msg) => <article key={msg.id} className={`flex ${msg.senderRole === "provider" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 sm:max-w-[75%] ${msg.senderRole === "provider" ? "border border-amber-100/15 bg-amber-200/[0.08]" : "border border-white/10 bg-white/[0.045]"}`}><p className="text-sm leading-relaxed text-white/85">{msg.content}</p><time className="mt-2 block text-right text-[11px] text-white/40">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "Just sent"}</time></div></article>) : <div className="mx-auto my-auto max-w-md py-14 text-center"><MessageSquare className="mx-auto h-8 w-8 text-amber-100/60" /><h3 className="mt-3 font-medium">Start with a kind hello</h3><p className="mt-1 text-sm leading-relaxed text-white/50">Coordinate a visit, ask what support would feel useful, or follow up on something you discussed together.</p></div>}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="border-t border-white/10 p-3 sm:p-4"><label htmlFor="provider-message" className="sr-only">Write a message</label><div className="flex items-end gap-2"><textarea id="provider-message" value={messageText} onChange={(event) => setMessageText(event.target.value.slice(0, 4000))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(event); } }} rows={2} maxLength={4000} placeholder="Write a message…" className="min-h-12 flex-1 resize-y rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white placeholder:text-white/35 focus:border-amber-100/40 focus:outline-none" /><button type="submit" disabled={!messageText.trim() || sending} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45"><Send className="h-4 w-4" /><span>{sending ? "Sending…" : "Send"}</span></button></div><div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/40"><span>Enter sends · Shift + Enter adds a line</span><span>{messageText.length}/4000</span></div>{notice && <p role="status" className="mt-2 text-sm text-emerald-200">{notice}</p>}</form>
          </> : <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-white/50">{clientsLoading ? "Loading your connections…" : "Choose a connected person to open a private conversation."}</div>}
        </div>
      </section>
      <p className="mt-3 text-xs leading-relaxed text-white/40">{refreshing ? "Checking for new messages… " : "Messages refresh automatically while this page is open. "}Do not use this space for emergencies. Messages may not be read right away; for immediate danger, contact local emergency services.</p>
    </main>
  </div>;
}
