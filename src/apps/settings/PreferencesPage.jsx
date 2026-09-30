import React from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useOSStore } from "@/stores/useOSStore";

const themeOptions = [
  { id: "deep-night", title: "Deep Night", detail: "A dark, low-glare workspace.", icon: Moon, swatch: "from-slate-950 to-indigo-950" },
  { id: "dawn", title: "Dawn", detail: "A bright page with dark, clear text.", icon: Sun, swatch: "from-amber-100 to-sky-100" },
  { id: "system", title: "Follow my device", detail: "Changes when your device theme changes.", icon: Laptop, swatch: "from-slate-800 via-slate-100 to-slate-800" },
];

function ChoiceCard({ selected, onClick, title, detail, icon: Icon, swatch }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className={`flex min-h-28 items-center gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${selected ? "border-amber-300/70 bg-amber-200/[0.08]" : "border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.05]"}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${swatch} ${title === "Dawn" ? "text-slate-800" : "text-white"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-white/55">{detail}</span>
      </span>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-amber-200 bg-amber-200 text-slate-950" : "border-white/20 text-transparent"}`} aria-hidden="true">
        {selected && <Check className="h-4 w-4" />}
      </span>
    </button>
  );
}

const PreferencesPage = () => {
  const settings = useOSStore((state) => state.settings);
  const setThemeMode = useOSStore((state) => state.setThemeMode);
  const setInterfaceDensity = useOSStore((state) => state.setInterfaceDensity);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/70">Your space</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Look & feel</h1>
        <p className="mt-2 text-sm text-white/60">Change the page appearance and spacing. You’ll see the change right away.</p>
      </header>
      <div className="space-y-5">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6" aria-labelledby="appearance-heading">
          <div className="mb-4">
            <h2 id="appearance-heading" className="text-lg font-semibold text-white">Appearance</h2>
            <p className="mt-1 text-sm text-white/55">Choose the colors that feel easiest to use.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map(({ id, ...option }) => (
              <ChoiceCard key={id} {...option} selected={settings.themeMode === id} onClick={() => setThemeMode(id)} />
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6" aria-labelledby="spacing-heading">
          <div className="mb-4">
            <h2 id="spacing-heading" className="text-lg font-semibold text-white">Page spacing</h2>
            <p className="mt-1 text-sm text-white/55">This changes the space around cards and controls throughout the app.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: "cozy", title: "Roomy", detail: "More breathing room between sections." },
              { id: "compact", title: "Compact", detail: "Tighter cards and less scrolling." },
            ].map((choice) => (
              <button key={choice.id} type="button" aria-pressed={settings.interfaceDensity === choice.id}
                onClick={() => setInterfaceDensity(choice.id)}
                className={`rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${settings.interfaceDensity === choice.id ? "border-amber-300/70 bg-amber-200/[0.08]" : "border-white/10 bg-white/[0.025] hover:border-white/25"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">{choice.title}</span>
                  {settings.interfaceDensity === choice.id && <Check className="h-4 w-4 text-amber-200" aria-hidden="true" />}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-white/55">{choice.detail}</span>
                <span className={`mt-3 flex items-center gap-1.5 rounded-xl border p-2 ${choice.id === "compact" ? "gap-1" : "gap-2"}`} aria-hidden="true">
                  <i className="h-6 w-1/3 rounded bg-white/20" />
                  <i className="h-6 w-1/3 rounded bg-amber-200/35" />
                  <i className="h-6 w-1/3 rounded bg-white/20" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default PreferencesPage;
