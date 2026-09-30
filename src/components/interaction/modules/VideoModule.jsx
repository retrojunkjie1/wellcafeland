import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export default function VideoModule({ module }) {
  const { videoUrl, title, description } = module?.payload || {};

  return (
    <section className="animate-slide-up rounded-2xl border border-white/10 bg-white/[0.05] p-4 sm:p-5" aria-label={title || "Video guidance"}>
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-200">
          <Play className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium text-white">{title || "Video guidance"}</h3>
          {description && <p className="mt-1 text-sm leading-relaxed text-white/70">{description}</p>}
        </div>
      </div>
      {videoUrl ? (
        <video src={videoUrl} controls playsInline className="mt-4 w-full rounded-xl bg-black" aria-label={title || "Video guidance"} />
      ) : (
        <div className="mt-4 rounded-xl border border-amber-200/15 bg-amber-100/[0.04] p-4">
          <p className="text-sm text-white/80">There is no video attached to this guidance, so we won't show a sample clip.</p>
          <Link to="/tools" className="mt-3 inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm text-white hover:bg-white/10">Browse guided practices</Link>
        </div>
      )}
    </section>
  );
}
