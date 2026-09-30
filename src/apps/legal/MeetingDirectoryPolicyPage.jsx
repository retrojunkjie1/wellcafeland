import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "Where listings come from",
    body: "Meeting listings are provided by the A.A. or N.A. service groups responsible for them, or by a source those groups authorize. A.A. and N.A. are separate fellowships, so their listings are presented separately. Online and in-person options are labeled distinctly.",
  },
  {
    title: "Keeping information current",
    body: "Meeting times, locations, access details, and formats can change. WellnessCafe records the source and its latest update when a listing is supplied to our directory. If a source stops updating, we may mark affected listings as needing confirmation or remove them until they can be checked.",
  },
  {
    title: "Using a fellowship’s finder",
    body: "A.A. listings are searched in the official or local live finder. N.A. listings shown in WellnessCafe come from the public BMLT aggregator; online join links, when provided, open the meeting host. Those services operate independently of WellnessCafe.",
  },
  {
    title: "Area information",
    body: "When you search N.A. listings in WellnessCafe, the area you enter is sent securely to the public BMLT meeting search so it can return matching records. We do not save the search area to your account. A.A. searches open an A.A. or local service finder, where you enter your area under that source’s own privacy practices.",
  },
  {
    title: "Permissions and source rights",
    body: "WellnessCafe uses meeting information that a responsible service group intentionally makes available for reuse or has authorized us to use. A public webpage or an archived snapshot is not, by itself, permission to republish its contents. The Meeting Guide JSON format supports sharing, but each source’s data-use permission is handled separately.",
  },
  {
    title: "Corrections",
    body: "If you find a listing that needs attention, contact the local service group responsible for it or write to support@wellnesscafe.net with the listing and source. We will route the correction to the relevant source when possible.",
  },
];

export default function MeetingDirectoryPolicyPage() {
  useEffect(() => {
    document.title = "Meeting Directory Policy - WellnessCafe";
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-8 sm:py-12">
        <Link to="/recovery/meetings" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to meeting search
        </Link>
        <header className="mt-6 max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">WellnessCafe policies</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meeting directory policy</h1>
          <p className="text-base leading-relaxed text-muted-foreground">How we source, refresh, and present A.A. and N.A. meeting information.</p>
        </header>

        <div className="mt-7 grid max-w-4xl gap-3">
          {sections.map((section) => (
            <section key={section.title} className="lux-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75 sm:text-base">{section.body}</p>
            </section>
          ))}
        </div>

        <nav aria-label="Related policies" className="mt-7 flex flex-wrap gap-4 text-sm">
          <Link to="/privacy" className="inline-flex min-h-10 items-center text-amber-200 underline decoration-amber-200/30 underline-offset-4 hover:decoration-amber-200">Privacy policy</Link>
          <Link to="/terms" className="inline-flex min-h-10 items-center text-amber-200 underline decoration-amber-200/30 underline-offset-4 hover:decoration-amber-200">Terms of service</Link>
        </nav>
      </div>
    </main>
  );
}
