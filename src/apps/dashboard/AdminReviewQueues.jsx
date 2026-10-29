import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Database, HandHeart, MapPinned } from "lucide-react";
import { QueueVolumeBar } from "./components/ConsoleVisuals";

const QUEUES = [
  {
    key: "practitioner",
    title: "Practitioner applications",
    description: "Review profiles and publish approved support providers.",
    path: "/admin/practitioners",
    Icon: BadgeCheck,
  },
  {
    key: "giver",
    title: "Community giver applications",
    description: "Review people and organizations offering practical support.",
    path: "/admin/community-givers",
    Icon: HandHeart,
  },
  {
    key: "meetingSources",
    title: "Meeting feed permissions",
    description: "Review source authority before separate technical validation.",
    path: "/admin/recovery-meeting-sources",
    Icon: Database,
  },
  {
    key: "helpDirectory",
    title: "Local help directory",
    description: "Review, publish, refresh, and retire source-backed help listings.",
    path: "/admin/help-directory",
    Icon: MapPinned,
  },
];

export default function AdminReviewQueues({ practitionerCount, giverCount, meetingSourceCount }) {
  const counts = {
    practitioner: practitionerCount,
    giver: giverCount,
    meetingSources: meetingSourceCount,
  };
  const maxCount = Math.max(...Object.values(counts).filter(Number.isInteger), 0);

  return (
    <section aria-label="Application review queues" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {QUEUES.map(({ key, title, description, path, Icon }) => {
        const count = counts[key] ?? null;
        return (
          <article key={key} className="rounded-2xl border border-amber-200/12 bg-amber-100/[0.025] p-4 transition-colors hover:border-amber-200/20 hover:bg-amber-100/[.04]">
            <p className="sr-only">{description}</p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200/[.08] text-amber-100">{React.createElement(Icon, { "aria-hidden": true, className: "h-5 w-5" })}</span>
                <h2 className="text-sm font-semibold leading-snug">{title}</h2>
              </div>
              <strong className="text-2xl font-semibold tabular-nums text-amber-50">{key === "helpDirectory" || count === null ? "—" : count}</strong>
            </div>
            {key === "helpDirectory" ? (
              <p role="status" className="mt-5 text-xs text-amber-100/65">Source-reviewed listings</p>
            ) : (
              <div className="mt-4 space-y-2">
                <QueueVolumeBar count={count} maxCount={maxCount} />
                <p role="status" className="text-xs text-white/45">{count === null ? "Queue count unavailable" : count === 0 ? "Nothing waiting" : `${count} waiting for review`}</p>
              </div>
            )}
            <Link to={path} aria-label={`Open ${title}`} className="mt-4 inline-flex min-h-9 items-center justify-center rounded-xl border border-amber-200/15 px-3 text-xs font-medium text-amber-100/85 transition hover:bg-amber-200/[.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
              Open queue
            </Link>
          </article>
        );
      })}
    </section>
  );
}
