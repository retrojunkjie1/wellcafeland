import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";
import { acceptPrivateFriendCircleInvite, previewPrivateFriendCircleInvite } from "@/services/friendCirclesService";
import { useAuth } from "@/context/AuthContext";

function invitationErrorMessage(error) {
  if (error?.code === "functions/unauthenticated") return "Sign in to see and accept this private invitation.";
  if (error?.code === "functions/failed-precondition" && /verify your email/i.test(error.message || "")) return "Verify your email before joining a private group.";
  if (error?.code === "functions/failed-precondition") return "This invitation has expired, was already used, or was replaced by a newer link.";
  if (error?.code === "functions/not-found") return "This invitation link is no longer available.";
  return "We couldn’t check this invitation. Try again, or ask the person who invited you for a fresh link.";
}

export default function PrivateFriendInvitePage() {
  const { inviteToken = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const loadInvite = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setInvitation(await previewPrivateFriendCircleInvite(inviteToken));
    } catch (loadError) {
      setInvitation(null);
      setError(invitationErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [inviteToken]);

  useEffect(() => { loadInvite(); }, [loadInvite]);

  const joinGroup = async () => {
    if (joining) return;
    setJoining(true);
    setError("");
    try {
      await acceptPrivateFriendCircleInvite(inviteToken);
      navigate("/circles", { replace: true, state: { joinedFriendGroup: invitation?.circle?.name || "your group" } });
    } catch (joinError) {
      setError(invitationErrorMessage(joinError));
    } finally {
      setJoining(false);
    }
  };

  return <div className="min-h-screen bg-slate-950 text-white"><PageHeader title="Friend group invitation" />
    <main className="lux-shell py-10 sm:py-16">
      <section className="mx-auto max-w-xl rounded-3xl border border-emerald-100/15 bg-gradient-to-br from-emerald-100/[0.07] via-white/[0.035] to-white/[0.02] p-6 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-100/20 bg-emerald-100/[0.07] text-emerald-100"><Users className="h-6 w-6" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/65">A private invitation</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{loading ? "Checking your invite…" : invitation?.alreadyMember ? "You’re already in this group" : invitation?.circle?.name || "Join a friend group"}</h1>
        {loading || authLoading ? <p className="mt-3 text-sm text-white/55" role="status">Confirming this invitation is active.</p> : invitation && <>
          {invitation.circle.description && <p className="mt-3 leading-relaxed text-white/70">{invitation.circle.description}</p>}
          <p className="mt-4 text-sm text-white/55">{invitation.circle.memberCount} {invitation.circle.memberCount === 1 ? "person" : "people"} in the group</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-relaxed text-white/65">Joining shares your group membership only. It does not share your check-ins, reflections, or practitioner information. This invite link is for one person and expires after seven days.</div>
        </>}
        {error && <div className="mt-5 rounded-xl border border-amber-100/20 bg-amber-100/[0.05] p-4 text-sm leading-relaxed text-amber-50/85" role="alert"><p>{error}</p>{error.includes("Verify your email") && <Link to="/verify-email" state={{ destination: `/circles/invite/${inviteToken}` }} className="mt-3 inline-flex min-h-10 items-center text-amber-100 underline underline-offset-4">Verify your email</Link>}</div>}
        {!loading && !authLoading && invitation?.alreadyMember && <button type="button" onClick={() => navigate("/circles", { replace: true })} className="mt-5 min-h-11 rounded-xl border border-white/15 px-4 text-sm text-white/80 hover:bg-white/[0.05]">Open my groups</button>}
        {!loading && !authLoading && invitation && !invitation.alreadyMember && (!user || user.isAnonymous) && <div className="mt-5 flex flex-wrap gap-3"><Link to="/signup" state={{ from: { pathname: location.pathname } }} className="inline-flex min-h-11 items-center rounded-xl bg-emerald-100 px-5 text-sm font-semibold text-slate-950 hover:bg-emerald-50">Create account to join</Link><Link to="/login" state={{ from: { pathname: location.pathname } }} className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm text-white/80 hover:bg-white/[0.05]">Sign in</Link></div>}
        {!loading && !authLoading && invitation && !invitation.alreadyMember && user && !user.isAnonymous && !user.emailVerified && <Link to="/verify-email" state={{ destination: location.pathname }} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-100 px-5 text-sm font-semibold text-slate-950 hover:bg-emerald-50">Verify email to join</Link>}
        {!loading && !authLoading && invitation && !invitation.alreadyMember && user && !user.isAnonymous && user.emailVerified && <button type="button" onClick={joinGroup} disabled={joining} className="mt-5 min-h-11 rounded-xl bg-emerald-100 px-5 text-sm font-semibold text-slate-950 hover:bg-emerald-50 disabled:opacity-50">{joining ? "Joining group…" : "Join this group"}</button>}
        {!loading && !invitation && <button type="button" onClick={loadInvite} className="mt-5 min-h-11 rounded-xl border border-white/15 px-4 text-sm text-white/80 hover:bg-white/[0.05]">Check invitation again</button>}
        <p className="mt-6 text-xs leading-relaxed text-white/40">Group membership never changes your separate sharing settings.</p>
      </section>
    </main>
  </div>;
}
