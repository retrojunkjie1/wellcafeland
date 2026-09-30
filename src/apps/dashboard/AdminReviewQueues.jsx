import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Database, HandHeart, MapPinned } from "lucide-react";

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

  return (
    <section aria-label="Application review queues" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {QUEUES.map(({ key, title, description, path, Icon }) => {
        const count = counts[key] ?? null;
        return (
          <article key={key} className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200/15 bg-amber-100/[0.035] p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200/10 text-amber-100">{React.createElement(Icon, { "aria-hidden": true, className: "h-5 w-5" })}</span>
              <div>
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                <p role="status" className="mt-1 text-xs text-amber-100/75">{key === "helpDirectory" ? "Source-reviewed listings" : count === null ? "Queue count unavailable" : `${count} waiting for review`}</p>
              </div>
            </div>
            <Link to={path} aria-label={`Open ${title}`} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/20 px-3 text-xs font-medium text-amber-100 hover:bg-amber-200/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
              Open review
            </Link>
          </article>
        );
      })}
    </section>
  );
}
