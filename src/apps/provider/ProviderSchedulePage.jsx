// src/apps/provider/ProviderSchedulePage.jsx
// Provider schedule/appointments page

import React, { useState, useEffect } from "react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { listAppointmentsForProvider, createAppointment } from "@/services/appointmentService";
import PageHeader from "@/components/navigation/PageHeader";
import { Calendar, Plus, Clock, User } from "lucide-react";

const ProviderSchedulePage = () => {
  const { providerId, userId, orgId } = useSessionIdentity();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    startAt: "",
    endAt: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const providerIdToUse = providerId || userId;
      if (!providerIdToUse) {
        setLoading(false);
        return;
      }

      const [appointmentsData, assignments] = await Promise.all([
        listAppointmentsForProvider(providerIdToUse, {
          from: new Date(),
        }),
        listAssignmentsForProvider(providerIdToUse),
      ]);

      setAppointments(appointmentsData);
      setClients(assignments.map((a) => ({ id: a.clientId, alias: `Client ${a.clientId.substring(0, 8)}` })));
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!formData.clientId || !formData.startAt || !formData.endAt) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const providerIdToUse = providerId || userId;
      const result = await createAppointment({
        clientId: formData.clientId,
        providerId: providerIdToUse,
        orgId,
        startAt: new Date(formData.startAt),
        endAt: new Date(formData.endAt),
        note: formData.note || null,
      });

      if (result.ok) {
        setShowForm(false);
        setFormData({ clientId: "", startAt: "", endAt: "", note: "" });
        loadData();
      } else {
        alert("Failed to create appointment: " + result.error);
      }
    } catch (err) {
      console.error("Failed to create appointment:", err);
      alert("Failed to create appointment");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Schedule"
        subtitle="Manage appointments with clients"
      />
      <div className="lux-shell py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-white">Upcoming Appointments</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </button>
        </div>

        {showForm && (
          <div className="lux-card p-6 border border-white/10 bg-white/5 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Create Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Client</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.alias}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Note (optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                  placeholder="Appointment notes..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateAppointment}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Appointment"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ clientId: "", startAt: "", endAt: "", note: "" });
                  }}
                  className="px-6 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-white/50">Loading schedule...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="lux-card p-12 text-center border border-white/10 bg-white/5">
            <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No upcoming appointments</h3>
            <p className="text-sm text-white/50">Create your first appointment to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="lux-card p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-4 w-4 text-white/50" />
                      <span className="text-base font-medium text-white">
                        {formatDateTime(apt.startAt)}
                      </span>
                      <span className="text-sm text-white/50">
                        - {formatDateTime(apt.endAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <User className="h-3 w-3" />
                      <span>Client {apt.clientId.substring(0, 8)}</span>
                    </div>
                    {apt.note && (
                      <div className="text-sm text-white/50 mt-2">{apt.note}</div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      apt.status === "scheduled"
                        ? "bg-green-500/20 text-green-400"
                        : apt.status === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSchedulePage;

