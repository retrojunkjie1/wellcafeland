import React, { useCallback, useEffect, useState } from "react";
import { Archive, ArrowRightLeft, Flag, LogOut, Send, Trash2, UserMinus, UserX } from "lucide-react";
import {
  blockPrivateFriendCircleMember,
  deletePrivateFriendCircleMessage,
  leavePrivateFriendCircle,
  listPrivateFriendCircleMessages,
  postPrivateFriendCircleMessage,
  reportPrivateFriendCircleMessage,
  removePrivateFriendCircleMember,
  transferPrivateFriendCircleOwnership,
  closePrivateFriendCircle,
  unblockPrivateFriendCircleMember,
} from "@/services/friendCirclesService";

function readableError(error) {
  if (error?.code === "functions/failed-precondition" || error?.code === "functions/unavailable") return error.message;
  if (error?.code === "functions/permission-denied") return "Your group access changed. Refresh your groups to see the latest membership.";
  return "That action did not complete. Please try again.";
}

export default function PrivateFriendGroupConversation({ group, user, onChanged }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reportingMessageId, setReportingMessageId] = useState("");
  const [reportReason, setReportReason] = useState("harassment");
  const [reportDetails, setReportDetails] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setMessages(await listPrivateFriendCircleMessages(group.id));
    } catch (loadError) {
      setError(readableError(loadError));
    } finally {
      setLoading(false);
    }
  }, [group.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || working) return;
    setWorking("send");
    setError("");
    setNotice("");
    try {
      await postPrivateFriendCircleMessage(group.id, text);
      setDraft("");
      await refresh();
    } catch (sendError) {
      setError(readableError(sendError));
    } finally {
      setWorking("");
    }
  };

  const leave = async () => {
    if (!window.confirm(`Leave “${group.name}”? You will need a new invitation to rejoin.`)) return;
    setWorking("leave");
    setError("");
    try {
      await leavePrivateFriendCircle(group.id);
      setNotice("You left the group.");
      await onChanged();
    } catch (leaveError) {
      setError(readableError(leaveError));
    } finally {
      setWorking("");
    }
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Remove ${member.displayName} from “${group.name}”? They will lose access to the group and its messages.`)) return;
    setWorking(member.uid);
    setError("");
    try {
      await removePrivateFriendCircleMember(group.id, member.uid);
      setNotice(`${member.displayName} was removed from the group.`);
      await onChanged();
    } catch (removeError) {
      setError(readableError(removeError));
    } finally {
      setWorking("");
    }
  };

  const transferOwnership = async (member) => {
    if (!window.confirm(`Make ${member.displayName} the organizer of “${group.name}”? You will become a member and can then leave.`)) return;
    setWorking(member.uid);
    setError("");
    try {
      await transferPrivateFriendCircleOwnership(group.id, member.uid);
      setNotice(`${member.displayName} is now the organizer. You are now a member and can leave if you choose.`);
      await onChanged();
    } catch (transferError) {
      setError(readableError(transferError));
    } finally {
      setWorking("");
    }
  };

  const closeGroup = async () => {
    if (!window.confirm(`Close “${group.name}”? This removes the group and permanently deletes its messages.`)) return;
    setWorking("close");
    setError("");
    try {
      await closePrivateFriendCircle(group.id);
      setNotice("The group and its messages were removed.");
      await onChanged();
    } catch (closeError) {
      setError(readableError(closeError));
    } finally {
      setWorking("");
    }
  };

  const blockMember = async (message) => {
    if (!window.confirm(`Block ${message.authorName}? Their messages will be hidden from you across WellnessCafe, and yours will be hidden from them.`)) return;
    setWorking(message.authorUid);
    setError("");
    try {
      await blockPrivateFriendCircleMember(group.id, message.authorUid);
      setNotice(`${message.authorName} is blocked in this group. You will no longer see each other’s group messages.`);
      await refresh();
    } catch (blockError) {
      setError(readableError(blockError));
    } finally {
      setWorking("");
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm("Delete this message from the group? This cannot be undone.")) return;
    setWorking(message.id);
    setError("");
    try {
      await deletePrivateFriendCircleMessage(group.id, message.id);
      setNotice("Your message was deleted.");
      await refresh();
    } catch (deleteError) {
      setError(readableError(deleteError));
    } finally {
      setWorking("");
    }
  };

  const unblockMember = async (member) => {
    setWorking(member.uid);
    setError("");
    try {
      await unblockPrivateFriendCircleMember(group.id, member.uid);
      setNotice(`${member.displayName} is unblocked in this group.`);
      await onChanged();
      await refresh();
    } catch (unblockError) {
      setError(readableError(unblockError));
    } finally {
      setWorking("");
    }
  };

  const submitReport = async (event, message) => {
    event.preventDefault();
    if (working) return;
    setWorking(message.id);
    setError("");
    try {
      await reportPrivateFriendCircleMessage(group.id, message.id, reportReason, reportDetails);
      setReportingMessageId("");
      setReportDetails("");
      setNotice("Your report was sent for admin review. The message itself was not copied into the report.");
    } catch (reportError) {
      setError(readableError(reportError));
    } finally {
      setWorking("");
    }
  };

  return <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4" aria-label={`${group.name} messages`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h4 className="font-semibold text-white">Group conversation</h4><p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/50">Share only what you want this group to see. These messages are not a clinical or emergency service. Group messages are safety-reviewed before posting.</p></div>
      {group.role !== "owner" && <button type="button" onClick={leave} disabled={!!working} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/65 hover:bg-white/[0.05] disabled:opacity-50"><LogOut className="h-3.5 w-3.5" />Leave group</button>}
      {group.role === "owner" && group.memberCount === 1 && <button type="button" onClick={closeGroup} disabled={!!working} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200/15 px-3 text-xs text-rose-100/75 hover:bg-rose-100/[0.05] disabled:opacity-50"><Archive className="h-3.5 w-3.5" />Close group</button>}
    </div>

    {group.role === "owner" && group.members?.length > 1 && <details className="mt-4 rounded-xl border border-white/10 p-3">
      <summary className="cursor-pointer text-sm text-white/75">Organizer controls · {group.members.length} members</summary>
      <ul className="mt-3 space-y-2">{group.members.filter((member) => member.uid !== user?.uid).map((member) => <li key={member.uid} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-white/70">{member.displayName}{member.role === "owner" ? " · Organizer" : ""}</span><span className="flex gap-2">{member.role !== "owner" && <><button type="button" onClick={() => transferOwnership(member)} disabled={!!working} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-white/10 px-2 text-xs text-white/65 disabled:opacity-50"><ArrowRightLeft className="h-3 w-3" />Make organizer</button><button type="button" onClick={() => removeMember(member)} disabled={!!working} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-rose-200/15 px-2 text-xs text-rose-100/75 disabled:opacity-50"><UserMinus className="h-3 w-3" />Remove</button></>}</span></li>)}</ul>
    </details>}

    {group.blockedMembers?.length > 0 && <details className="mt-3 rounded-xl border border-white/10 p-3"><summary className="cursor-pointer text-xs text-white/60">People you blocked here · {group.blockedMembers.length}</summary><ul className="mt-2 space-y-2">{group.blockedMembers.map((member) => <li key={member.uid} className="flex items-center justify-between gap-2 text-xs"><span className="text-white/65">{member.displayName}</span><button type="button" onClick={() => unblockMember(member)} disabled={!!working} className="min-h-8 rounded-md border border-white/10 px-2 text-white/65 disabled:opacity-50">Unblock</button></li>)}</ul></details>}

    {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200/15 bg-rose-200/[0.05] p-3 text-sm text-rose-100/85">{error}</p>}
    {notice && <p role="status" className="mt-3 text-sm text-emerald-100/80">{notice}</p>}
    <div className="mt-4 max-h-80 space-y-2 overflow-y-auto rounded-xl border border-white/[0.07] bg-slate-950/45 p-3" aria-live="polite">
      {loading ? <p className="text-sm text-white/45">Loading messages…</p> : messages.length ? messages.map((message) => <article key={message.id} className="rounded-lg bg-white/[0.04] p-3"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-medium text-emerald-100/65">{message.authorUid === user?.uid ? "You" : message.authorName}</p><div className="flex gap-2">{message.authorUid === user?.uid ? <button type="button" onClick={() => deleteMessage(message)} disabled={!!working} className="inline-flex min-h-7 items-center gap-1 rounded-md border border-white/10 px-2 text-[11px] text-white/55 disabled:opacity-50"><Trash2 className="h-3 w-3" />Delete</button> : <><button type="button" onClick={() => blockMember(message)} disabled={!!working} className="inline-flex min-h-7 items-center gap-1 rounded-md border border-rose-200/10 px-2 text-[11px] text-rose-100/65 disabled:opacity-50"><UserX className="h-3 w-3" />Block</button><button type="button" onClick={() => { setReportingMessageId((current) => current === message.id ? "" : message.id); setReportDetails(""); }} disabled={!!working} className="inline-flex min-h-7 items-center gap-1 rounded-md border border-white/10 px-2 text-[11px] text-white/55 disabled:opacity-50"><Flag className="h-3 w-3" />Report</button></>}</div></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">{message.text}</p>{reportingMessageId === message.id && <form onSubmit={(event) => submitReport(event, message)} className="mt-3 grid gap-2 rounded-lg border border-white/10 bg-slate-950/55 p-3"><label className="text-xs text-white/65">Why are you reporting this?<select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-1 min-h-9 w-full rounded-lg border border-white/10 bg-slate-900 px-2 text-white"><option value="harassment">Harassment or bullying</option><option value="unsafe_content">Unsafe or harmful content</option><option value="spam">Spam</option><option value="other">Something else</option></select></label><label className="text-xs text-white/65">A brief note <span className="text-white/40">(optional)</span><textarea maxLength={280} rows={2} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-white" /></label><p className="text-[11px] leading-relaxed text-white/40">The report stores the reason and message reference, not a copy of the message. Admins review it in God-Eye.</p><button type="submit" disabled={!!working} className="min-h-9 justify-self-end rounded-lg bg-amber-100 px-3 text-xs font-semibold text-slate-950 disabled:opacity-50">{working === message.id ? "Sending…" : "Send report"}</button></form>}</article>) : <p className="text-sm text-white/45">No messages yet. A simple hello is a good beginning.</p>}
    </div>
    <form onSubmit={send} className="mt-3 flex items-end gap-2">
      <label className="sr-only" htmlFor={`private-group-message-${group.id}`}>Write a message to {group.name}</label>
      <textarea id={`private-group-message-${group.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} rows={2} placeholder="Write a supportive note…" className="min-h-12 min-w-0 flex-1 resize-y rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-white/35" />
      <button type="submit" disabled={!draft.trim() || !!working} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-100 px-3 text-sm font-semibold text-slate-950 disabled:opacity-50"><Send className="h-4 w-4" />{working === "send" ? "Sending…" : "Send"}</button>
    </form>
    <p className="mt-2 text-right text-[11px] text-white/35">{draft.length}/1,200</p>
  </section>;
}
