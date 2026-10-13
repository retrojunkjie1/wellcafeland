import React from "react";
import ClientUpcomingAppointments from "@/components/ClientUpcomingAppointments";
import PageHeader from "@/components/navigation/PageHeader";
import { Link } from "react-router-dom";
import { ClipboardList, HandHeart } from "lucide-react";

export default function ClientSessionsPage() {
  return (
    <main className="min-h-[70vh] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="My sessions"
          subtitle="Manage appointments and requests with practitioners you’re connected to."
          showBack
          backTo="/home"
        />
        <Link to="/tools/visit-prep" className="mb-5 flex min-h-16 items-center gap-3 rounded-2xl border border-emerald-900/15 bg-gradient-to-r from-emerald-50 to-white p-4 text-slate-900 shadow-sm transition hover:border-emerald-800/30">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white"><ClipboardList className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold">Prepare for a visit</span><span className="mt-0.5 block text-sm text-slate-600">Bring your questions. Choose what stays private.</span></span>
          <span aria-hidden="true" className="text-xl text-emerald-900">→</span>
        </Link>
        <Link to="/tools/care-coordination" className="mb-5 flex min-h-16 items-center gap-3 rounded-2xl border border-sky-900/15 bg-gradient-to-r from-sky-50 to-white p-4 text-slate-900 shadow-sm transition hover:border-sky-800/30">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-900 text-white"><HandHeart className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold">Ask for practical help</span><span className="mt-0.5 block text-sm text-slate-600">Choose a connected practitioner and track one next step.</span></span>
          <span aria-hidden="true" className="text-xl text-sky-900">→</span>
        </Link>
        <ClientUpcomingAppointments />
      </div>
    </main>
  );
}
