import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";

const SeedDataPage = () => (
  <div className="flex h-screen flex-col bg-slate-950 text-white">
    <PageHeader
      title="Help directory data"
      subtitle="Source-reviewed listings only"
      showBack={true}
    />

    <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-200/20 bg-emerald-100/[0.04] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-200/10 text-emerald-200">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white">Sample listings are retired</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              The old demo data included invented organizations and contact details. It can no longer be added to the public help directory. Additions need a reviewed source and real contact information.
            </p>
            <Link
              to="/assistance"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-wcGold px-4 text-sm font-semibold text-slate-950 transition hover:bg-wcGold/90"
            >
              Open Find Help
            </Link>
          </div>
        </div>
      </section>
    </main>
  </div>
);

export default SeedDataPage;
