// src/apps/provider/CarePlanEditor.jsx
// Care plan editor

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { createCarePlan, updateCarePlan, getCarePlan } from "@/services/carePlanService";
import PageHeader from "@/components/navigation/PageHeader";
import { Save, X, Plus, Trash2 } from "lucide-react";

const CarePlanEditor = () => {
  const { clientId, planId } = useParams();
  const navigate = useNavigate();
  const { providerId, userId, orgId } = useSessionIdentity();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([{ id: Date.now(), label: "", description: "", frequency: "daily", active: true }]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const plan = await getCarePlan(planId);
      if (plan) {
        setTitle(plan.title);
        setItems(plan.items.length > 0 ? plan.items : [{ id: Date.now(), label: "", description: "", frequency: "daily", active: true }]);
      }
    } catch (err) {
      console.error("Failed to load plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), label: "", description: "", frequency: "daily", active: true }]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please fill in title");
      return;
    }

    const validItems = items.filter((item) => item.label.trim());
    if (validItems.length === 0) {
      alert("Please add at least one care plan item");
      return;
    }

    setSaving(true);
    try {
      const providerIdToUse = providerId || userId;
      const itemsToSave = validItems.map(({ id: _id, ...rest }) => rest);

      if (planId) {
        const result = await updateCarePlan(planId, {
          title: title.trim(),
          items: itemsToSave,
        });
        if (result.ok) {
          navigate(`/provider/clients/${clientId}`);
        } else {
          alert("Failed to save plan: " + result.error);
        }
      } else {
        const result = await createCarePlan({
          clientId,
          providerId: providerIdToUse,
          orgId,
          title: title.trim(),
          items: itemsToSave,
        });
        if (result.ok) {
          navigate(`/provider/clients/${clientId}`);
        } else {
          alert("Failed to create plan: " + result.error);
        }
      }
    } catch (err) {
      console.error("Failed to save plan:", err);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Care Plan" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading plan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title={planId ? "Edit Care Plan" : "New Care Plan"}
        subtitle={`Client: ${clientId?.substring(0, 8)}...`}
      />
      <div className="lux-shell py-10">
        <div className="lux-card p-6 border border-white/10 bg-white/5 max-w-3xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Plan Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              placeholder="Care plan title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white">Plan Items</label>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(item.id, "label", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20 text-sm"
                      placeholder="Item label"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none text-sm"
                    placeholder="Description"
                  />
                  <select
                    value={item.frequency}
                    onChange={(e) => updateItem(item.id, "frequency", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20 text-sm"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Plan"}
            </button>
            <button
              onClick={() => navigate(`/provider/clients/${clientId}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlanEditor;

