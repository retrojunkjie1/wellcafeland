import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Copy, Link2, Plus, Share2, Users, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PrivateFriendGroupConversation from "./PrivateFriendGroupConversation";
import {
  createPrivateFriendCircle,
  createPrivateFriendCircleInvite,
  listMyPrivateFriendCircles,
  revokePrivateFriendCircleInvite,
} from "@/services/friendCirclesService";

async function shareLink({ title, text, url }) {
  if (navigator.share) {
    await navigator.share({ title, text, url });
    return "Invite ready to share.";
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "Link copied. Send it to the person you have in mind.";
  }
  return "Copy the link below and send it to the person you have in mind.";
}

export default function PrivateFriendGroupsPanel() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const canManageGroups = Boolean(user && !user.isAnonymous && user.emailVerified);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [inviteLinks, setInviteLinks] = useState({});
  const [friendReferralUrl, setFriendReferralUrl] = useState("");
  const [openGroupId, setOpenGroupId] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setGroups(await listMyPrivateFriendCircles());
    } catch (loadError) {
      setGroups([]);
      setError(loadError?.code === "functions/unauthenticated"
        ? "Sign in with a verified account to create or view private friend groups."
        : loadError?.code === "functions/failed-precondition"
          ? "Verify your account email to create or view private friend groups."
          : "Private groups could not load right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!canManageGroups) {
      setGroups([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [authLoading, canManageGroups, refresh]);
  useEffect(() => {
    if (location.state?.joinedFriendGroup) setStatus(`You joined ${location.state.joinedFriendGroup}. Group membership does not share your private account activity.`);
  }, [location.state]);

  const createGroup = async (event) => {
    event.preventDefault();
    if (working || name.trim().length < 2) return;
    setWorking("create");
    setError("");
    setStatus("");
    try {
      await createPrivateFriendCircle(name, description);
      setName("");
      setDescription("");
      setFormOpen(false);
      setStatus("Your private group is ready. Create an invite link when you’re ready to add someone.");
      await refresh();
    } catch (createError) {
      setError(createError?.message || "We couldn’t create the group. Please try again.");
    } finally {
      setWorking("");
    }
  };

  const makeInvite = async (group) => {
    setWorking(group.id);
    setError("");
    setStatus("");
    try {
      const invitation = await createPrivateFriendCircleInvite(group.id);
      const url = new URL(`/circles/invite/${encodeURIComponent(invitation.token)}`, window.location.origin).toString();
      setInviteLinks((current) => ({ ...current, [group.id]: url }));
      const message = await shareLink({
        title: `Join ${group.name} on WellnessCafe`,
        text: `You’re invited to a private friend group on WellnessCafe. The link can be used once and expires in seven days.`,
        url,
      });
      setStatus(`${message} The link grants group membership only; it does not share your private WellnessCafe activity.`);
    } catch (inviteError) {
      if (inviteError?.name !== "AbortError") setError(inviteError?.message || "The invite link is ready, but sharing it did not open. Copy the link below to send it yourself.");
    } finally {
      setWorking("");
    }
  };

  const disableInvite = async (group) => {
    setWorking(group.id);
    setError("");
    setStatus("");
    try {
      await revokePrivateFriendCircleInvite(group.id);
      setInviteLinks((current) => ({ ...current, [group.id]: "" }));
      setStatus("That group invite link has been disabled.");
    } catch (revokeError) {
      setError(revokeError?.message || "We couldn’t disable the invite link. Please try again.");
    } finally {
      setWorking("");
    }
  };

  const inviteFriendToWellnessCafe = async () => {
    setError("");
    setStatus("");
    const url = new URL("/getting-started", window.location.origin).toString();
    setFriendReferralUrl(url);
    try {
      const message = await shareLink({ title: "Explore WellnessCafe", text: "I thought you might like to explore WellnessCafe. Take a look when it feels right.", url });
      setStatus(message);
    } catch (shareError) {
      if (shareError?.name !== "AbortError") setError("We couldn’t open the share option. You can still copy the WellnessCafe link from your browser.");
    }
  };

  return (
    <section className="mb-8 rounded-3xl border border-emerald-100/15 bg-gradient-to-br from-emerald-100/[0.07] via-white/[0.025] to-sky-100/[0.035] p-5 sm:p-7" aria-labelledby="private-friend-groups-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/65">People you choose</p>
          <h2 id="private-friend-groups-title" className="mt-2 text-xl font-semibold text-white sm:text-2xl">Private friend groups</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">Create a small group and invite people you trust. Joining shares group membership only—your check-ins, reflections, and practitioner information stay private unless you choose to share them separately.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={inviteFriendToWellnessCafe} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/80 hover:bg-white/[0.05]"><Share2 className="h-4 w-4" />Invite a friend</button>
          <button type="button" onClick={() => { setFormOpen((open) => !open); setError(""); }} disabled={!canManageGroups} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-100 px-3 text-sm font-semibold text-slate-950 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">{formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{formOpen ? "Close" : "Create a group"}</button>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200/20 bg-rose-300/[0.06] p-3 text-sm text-rose-100">{error}</p>}
      {!authLoading && (!user || user.isAnonymous) && <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-sm leading-relaxed text-white/65">Sign in or create an account to make a private group. <Link to="/login" className="font-medium text-emerald-100 underline underline-offset-4">Sign in</Link> <span aria-hidden="true">·</span> <Link to="/signup" className="font-medium text-emerald-100 underline underline-offset-4">Create account</Link></p>}
      {!authLoading && user && !user.isAnonymous && !user.emailVerified && <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-sm leading-relaxed text-white/65">Verify your email before creating or managing private groups. <Link to="/verify-email" state={{ destination: location.pathname }} className="font-medium text-emerald-100 underline underline-offset-4">Verify email</Link></p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-emerald-100/15 bg-emerald-100/[0.05] p-3 text-sm leading-relaxed text-emerald-50/85">{status}</p>}
      {friendReferralUrl && <div className="mt-3 flex gap-2"><input readOnly aria-label="WellnessCafe link to share" value={friendReferralUrl} onFocus={(event) => event.target.select()} className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/40 px-3 text-xs text-white/75" /><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(friendReferralUrl); setStatus("WellnessCafe link copied. Send it whenever you’re ready."); } catch { setStatus("Select and copy the WellnessCafe link to share it."); } }} aria-label="Copy WellnessCafe invite link" className="grid min-h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-white/75"><Copy className="h-4 w-4" /></button></div>}

      {formOpen && <form onSubmit={createGroup} className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:grid-cols-2">
        <label className="text-sm text-white/75">Group name<input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="A name your group will recognize" className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 text-white placeholder:text-white/35" /></label>
        <label className="text-sm text-white/75">A short note <span className="text-white/40">(optional)</span><input maxLength={240} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What brings this group together?" className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 text-white placeholder:text-white/35" /></label>
        <p className="text-xs leading-relaxed text-white/45 sm:col-span-2">Private groups are invite-only and limited to 12 people. Use a group name you’re comfortable storing in your account.</p>
        <button type="submit" disabled={working === "create" || name.trim().length < 2} className="min-h-11 rounded-xl bg-emerald-100 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50 sm:col-span-2 sm:justify-self-end">{working === "create" ? "Creating group…" : "Create private group"}</button>
      </form>}

      {loading ? <p className="mt-5 text-sm text-white/50" role="status">Loading your groups…</p> : groups.length > 0 ? <div className="mt-5 grid gap-3 md:grid-cols-2">{groups.map((group) => <article key={group.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-100/20 bg-emerald-100/[0.06] text-emerald-100"><Users className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-white">{group.name}</h3><p className="mt-1 text-xs text-white/55">{group.memberCount} {group.memberCount === 1 ? "person" : "people"} · {group.role === "owner" ? "You created this group" : "You’re a member"}</p>{group.description && <p className="mt-2 text-sm leading-relaxed text-white/65">{group.description}</p>}</div></div>
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setOpenGroupId((openId) => openId === group.id ? "" : group.id)} aria-expanded={openGroupId === group.id} className="min-h-10 rounded-lg border border-white/10 px-3 text-sm text-white/75 hover:bg-white/[0.05]">{openGroupId === group.id ? "Close group" : "Open group"}</button>{group.role === "owner" && <><button type="button" onClick={() => makeInvite(group)} disabled={working === group.id || group.memberCount >= 12} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/[0.08] px-3 text-sm text-white hover:bg-white/[0.12] disabled:opacity-50"><Link2 className="h-4 w-4" />{group.memberCount >= 12 ? "Group is full" : working === group.id ? "Preparing…" : "Invite one person"}</button><button type="button" onClick={() => disableInvite(group)} disabled={working === group.id} className="min-h-10 rounded-lg border border-white/10 px-3 text-sm text-white/65 hover:bg-white/[0.05] disabled:opacity-50">Disable invite link</button></>}</div>
        {inviteLinks[group.id] && <div className="mt-3 flex gap-2"><input readOnly aria-label={`Invite link for ${group.name}`} value={inviteLinks[group.id]} onFocus={(event) => event.target.select()} className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 text-xs text-white/75" /><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(inviteLinks[group.id]); setStatus("Group invite link copied."); } catch { setStatus("Select and copy the group invite link."); } }} aria-label="Copy group invite link" className="grid min-h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-white/75"><Copy className="h-4 w-4" /></button></div>}
        <p className="mt-3 text-xs leading-relaxed text-white/40">An invite can be used once, expires after seven days, and only adds the person to this group. Creating a new invite replaces the previous link.</p>
        {openGroupId === group.id && <PrivateFriendGroupConversation group={group} user={user} onChanged={refresh} />}
      </article>)}</div> : !error && <p className="mt-5 rounded-xl bg-slate-950/30 p-4 text-sm leading-relaxed text-white/55">You haven’t created or joined a private group yet. Start one with a few people you trust, or share WellnessCafe with a friend.</p>}
      <p className="mt-4 text-xs text-white/40"><Link to="/settings/practitioner-sharing" className="underline underline-offset-4 hover:text-white/65">Review your sharing choices</Link> whenever you want. Group membership does not change them.</p>
    </section>
  );
}
