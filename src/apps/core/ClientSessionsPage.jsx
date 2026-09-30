import React from "react";
import ClientUpcomingAppointments from "@/components/ClientUpcomingAppointments";
import PageHeader from "@/components/navigation/PageHeader";

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
        <ClientUpcomingAppointments />
      </div>
    </main>
  );
}
