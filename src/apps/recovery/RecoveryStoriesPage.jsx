import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  ExternalLink,
  Heart,
  Map,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/navigation/PageHeader";
import {
  RECOVERY_STORIES,
  RECOVERY_STORY_NEXT_STEPS,
  RECOVERY_STORY_SOURCES,
  buildRecoveryInspiredPlan,
  formatRecoveryInspiredPlan,
} from "@/data/recoveryStories";
import sunrisePath from "@/assets/recovery-dawn-journey.jpg";

function SourceLinks({ ids }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {ids.map((id) => {
        const source = RECOVERY_STORY_SOURCES[id];
        return (
          <a
            key={id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.035] px-3 text-sm text-slate-200 transition hover:border-wcGold/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold"
          >
            {source.label}<ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

function downloadPlan(plan) {
  const file = new Blob([formatRecoveryInspiredPlan(plan)], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "my-wellnesscafe-next-step.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

function PlanBuilder({ story }) {
  const [selectedDirection, setSelectedDirection] = useState("");
  const [firstMove, setFirstMove] = useState("");
  const [timing, setTiming] = useState("When I’m ready");
  const [planReady, setPlanReady] = useState(false);
  const direction = RECOVERY_STORY_NEXT_STEPS.find((step) => step.id === selectedDirection);
  const plan = useMemo(() => direction && buildRecoveryInspiredPlan({ story, direction, firstMove, timing }), [story, direction, firstMove, timing]);

  function resetPlan() {
    setSelectedDirection("");
    setFirstMove("");
    setTiming("When I’m ready");
    setPlanReady(false);
  }

  return (
    <section className="mt-7 overflow-hidden rounded-[2rem] border border-amber-100/15 bg-gradient-to-br from-[#182238] via-[#111827] to-[#102720] shadow-[0_24px_80px_rgba(0,0,0,0.28)]" aria-labelledby="plan-builder-title">
      <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-100/20 bg-amber-100/10 text-amber-100">
            <Map aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-100/80">A private, self-directed guide</p>
            <h2 id="plan-builder-title" className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Borrow an idea. Make it yours.</h2>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-200">A public story can open a door, but your path belongs to you. Choose one kind of support and shape a next step that fits your life today.</p>
          </div>
        </div>
      </div>

      <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
        <fieldset>
          <legend className="text-lg font-semibold text-white">1. What kind of support feels useful?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {RECOVERY_STORY_NEXT_STEPS.map((step) => {
              const isSelected = selectedDirection === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => { setSelectedDirection(step.id); setPlanReady(false); }}
                  className={`group min-h-[112px] rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold sm:p-5 ${isSelected ? "border-amber-200/65 bg-amber-100/[0.10] shadow-[0_0_0_1px_rgba(253,230,138,0.16)]" : "border-white/12 bg-white/[0.035] hover:border-amber-100/35 hover:bg-white/[0.06]"}`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-base font-semibold leading-snug text-white sm:text-lg">{step.label}</span>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-amber-200 bg-amber-200 text-slate-950" : "border-white/25 text-transparent group-hover:border-amber-100/50"}`}>
                      {isSelected && <Check aria-hidden="true" className="h-4 w-4" />}
                    </span>
                  </span>
                  <span className="mt-2 block text-[15px] leading-relaxed text-slate-300">{step.detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <label htmlFor="personal-first-move" className="text-lg font-semibold text-white">2. What could your first move be?</label>
            <p id="personal-first-move-help" className="mt-1 text-[15px] leading-relaxed text-slate-300">Keep it small and in your own words. You can leave this blank.</p>
            <textarea
              id="personal-first-move"
              value={firstMove}
              onChange={(event) => { setFirstMove(event.target.value); setPlanReady(false); }}
              aria-describedby="personal-first-move-help"
              maxLength={240}
              rows={3}
              placeholder="For example: text Maya and ask if she can talk tonight."
              className="mt-3 min-h-[112px] w-full resize-y rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-3 text-base leading-relaxed text-white placeholder:text-slate-400 focus:border-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-100/20"
            />
            <p className="mt-1 text-right text-sm text-slate-400">{firstMove.length}/240</p>
          </div>

          <fieldset>
            <legend className="text-lg font-semibold text-white">3. When might it fit?</legend>
            <div className="mt-3 grid gap-2">
              {["Today", "This week", "When I’m ready"].map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={timing === option}
                  onClick={() => { setTiming(option); setPlanReady(false); }}
                  className={`min-h-12 rounded-xl border px-4 text-left text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold ${timing === option ? "border-emerald-200/50 bg-emerald-200/[0.10] text-white" : "border-white/12 bg-white/[0.025] text-slate-300 hover:border-white/25 hover:text-white"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {!planReady ? (
          <button
            type="button"
            disabled={!direction}
            onClick={() => setPlanReady(true)}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-300 px-6 text-lg font-bold text-slate-950 shadow-lg shadow-amber-950/20 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            Build my next step <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : plan ? (
          <section className="rounded-3xl border border-emerald-200/25 bg-emerald-200/[0.08] p-5 sm:p-6" aria-live="polite" aria-labelledby="personal-plan-title">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-emerald-100/80"><Sparkles aria-hidden="true" className="h-4 w-4" /> Your plan, your pace</p>
                <h3 id="personal-plan-title" className="mt-2 text-xl font-semibold text-white sm:text-2xl">One direction to carry forward</h3>
                <dl className="mt-4 space-y-3 text-base leading-relaxed">
                  <div><dt className="inline font-semibold text-emerald-50">Support: </dt><dd className="inline text-slate-100">{plan.directionLabel}</dd></div>
                  <div><dt className="inline font-semibold text-emerald-50">My first move: </dt><dd className="inline text-slate-100">{plan.firstMove}</dd></div>
                  <div><dt className="inline font-semibold text-emerald-50">Timing: </dt><dd className="inline text-slate-100">{plan.timing}</dd></div>
                  <div><dt className="inline font-semibold text-emerald-50">Inspired by: </dt><dd className="inline text-slate-100">{plan.storyName}’s public account—adapted by you, not copied.</dd></div>
                </dl>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:min-w-52">
                <Link to={direction.path} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 text-base font-bold text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{direction.action}<ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
                <button type="button" onClick={() => downloadPlan(plan)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-950/25 px-4 text-base font-semibold text-white transition hover:bg-slate-950/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"><Download aria-hidden="true" className="h-5 w-5" /> Download my plan</button>
                <button type="button" onClick={resetPlan} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-300 transition hover:text-white"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Start again</button>
              </div>
            </div>
          </section>
        ) : null}

        <p className="flex items-start gap-2 border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-300"><ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />Your choices stay on this page until you leave. Nothing is saved or sent to a practitioner. Download only if you want a copy for yourself.</p>
      </div>
    </section>
  );
}

export default function RecoveryStoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChapter, setSelectedChapter] = useState(0);
  const requestedPerson = searchParams.get("person");
  const story = requestedPerson
    ? RECOVERY_STORIES.find((candidate) => candidate.id === requestedPerson)
    : RECOVERY_STORIES[0];
  const chapter = story?.chapters[selectedChapter];

  function selectStory(storyId) {
    setSelectedChapter(0);
    setSearchParams({ person: storyId });
  }

  return (
    <main className="mx-auto min-h-full w-full max-w-5xl px-4 py-5 text-white sm:px-6 sm:py-7">
      <PageHeader title="Recovery stories" subtitle="Real lives are not recipes. Keep what fits; leave the rest." showBack backTo="/guide" />

      <section className="relative isolate mt-5 min-h-[290px] overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:min-h-[350px]" aria-labelledby="story-hero-title">
        <img src={sunrisePath} alt="A sunlit path winding toward a warm dawn over a calm lake" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080d18]/90 via-[#101827]/72 to-[#101827]/10" />
        <div className="flex min-h-[290px] max-w-3xl flex-col justify-end p-6 sm:min-h-[350px] sm:justify-center sm:p-10">
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-amber-100/30 bg-slate-950/35 px-3 py-1.5 text-sm font-semibold text-amber-100 backdrop-blur"><BookOpen aria-hidden="true" className="h-4 w-4" /> Stories of change, told in public</span>
          <h1 id="story-hero-title" className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white drop-shadow sm:text-5xl">Other people’s stories can open a door.</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-white/90 drop-shadow sm:text-lg">Take an idea that matters. Shape a next step around your life, your needs, and your timing.</p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-amber-100/15 bg-gradient-to-r from-amber-100/[0.09] via-slate-900/90 to-emerald-100/[0.07] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-amber-100/10 p-2.5 text-amber-100"><ShieldCheck aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-semibold text-white">Inspiration—not a treatment plan</h2>
            <p className="mt-1 max-w-3xl text-[15px] leading-relaxed text-slate-200">These public accounts are partial. They are not complete care records, instructions from the person, or promises about what will work for you. WellnessCafe separates reporting from our own reflections.</p>
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="choose-story-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-100/75">The story library</p>
            <h2 id="choose-story-heading" className="mt-1 text-2xl font-semibold text-white">Choose a life to learn from</h2>
          </div>
          <p className="text-sm text-slate-400">{RECOVERY_STORIES.length} sourced public stories</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {RECOVERY_STORIES.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={story?.id === candidate.id}
              onClick={() => selectStory(candidate.id)}
              className={`min-h-[106px] rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold sm:p-5 ${story?.id === candidate.id ? "border-amber-200/60 bg-amber-100/[0.08] shadow-[0_10px_34px_rgba(217,164,65,0.08)]" : "border-white/12 bg-white/[0.025] hover:border-white/30 hover:bg-white/[0.05]"}`}
            >
              <span className="block text-lg font-semibold text-white">{candidate.name}</span>
              <span className="mt-1 block text-[15px] leading-relaxed text-slate-300">{candidate.descriptor}</span>
            </button>
          ))}
        </div>
      </section>

      {!story ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <p className="text-lg font-semibold">We don’t have a sourced story for that person yet.</p>
          <p className="mt-2 text-base text-slate-300">You can explore the public accounts we’ve reviewed so far.</p>
          <Link to="/recovery/stories" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-wcGold px-5 text-base font-semibold text-slate-950">See available stories <ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
        </section>
      ) : (
        <>
          <article key={`story-${story.id}`} className="mt-6 overflow-hidden rounded-[2rem] border border-white/12 bg-[#111827] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <header className="border-b border-white/10 bg-gradient-to-r from-[#222c3e] via-[#172132] to-[#18251f] p-5 sm:p-8">
              <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-amber-100/90"><BookOpen aria-hidden="true" className="h-4 w-4" /> Public account · Sources checked {new Date(`${story.sourcesCheckedOn}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{story.name}</h2>
              <p className="mt-1 text-base text-slate-300">{story.descriptor}</p>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">{story.summary}</p>
            </header>

            <div className="p-4 sm:p-7">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-100/75">A path in chapters</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Explore one part at a time</h3>
                </div>
                <p className="text-sm font-medium text-slate-300" aria-live="polite">Chapter {selectedChapter + 1} of {story.chapters.length}</p>
              </div>
              <div className="mb-4 grid gap-2 2xl:grid-cols-3" role="tablist" aria-label={`${story.name} story chapters`}>
                {story.chapters.map((item, index) => {
                  const active = selectedChapter === index;
                  return (
                    <button
                      key={item.title}
                      id={`recovery-story-tab-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="recovery-story-chapter"
                      onClick={() => setSelectedChapter(index)}
                      className={`flex min-h-[72px] items-start gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold sm:p-4 ${active ? "border-emerald-200/55 bg-emerald-200/[0.09]" : "border-white/10 bg-white/[0.025] hover:border-white/25"}`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-emerald-100 text-slate-900" : "border border-white/20 text-slate-200"}`}>{index + 1}</span>
                      <span className="pt-0.5 text-[15px] font-semibold leading-snug text-white">{item.title}</span>
                    </button>
                  );
                })}
              </div>

              <section id="recovery-story-chapter" role="tabpanel" aria-labelledby={`recovery-story-tab-${selectedChapter}`} key={`${story.id}-${selectedChapter}`} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.045] to-emerald-100/[0.035] p-5 sm:p-7">
                {chapter && (
                  <>
                    <h4 className="text-xl font-semibold text-white sm:text-2xl">{chapter.title}</h4>
                    <p className="mt-4 text-base leading-relaxed text-slate-100 sm:text-lg">{chapter.publicAccount}</p>
                    <p className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100/15 bg-amber-100/[0.055] p-4 text-base leading-relaxed text-amber-50 sm:text-lg"><Heart aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />{chapter.reflection}</p>
                    <SourceLinks ids={chapter.sources} />
                  </>
                )}
              </section>
              <div className="mt-4 flex justify-between gap-3">
                <button type="button" disabled={selectedChapter === 0} onClick={() => setSelectedChapter((current) => Math.max(0, current - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-base font-medium text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Previous</button>
                <button type="button" disabled={selectedChapter === story.chapters.length - 1} onClick={() => setSelectedChapter((current) => Math.min(story.chapters.length - 1, current + 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-base font-medium text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40">Next chapter <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
              </div>
            </div>
          </article>

          <PlanBuilder key={`plan-${story.id}`} story={story} />
        </>
      )}

      <Link to="/guide" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full px-3 text-base font-medium text-slate-300 transition hover:text-white"><ArrowLeft aria-hidden="true" className="h-5 w-5" />Back to the guide</Link>
    </main>
  );
}
