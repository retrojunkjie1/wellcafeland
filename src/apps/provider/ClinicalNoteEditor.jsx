// src/apps/provider/ClinicalNoteEditor.jsx
// Clinical note editor

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { createNote, updateNote, getNote } from "@/services/clinicalNotesService";
import PageHeader from "@/components/navigation/PageHeader";
import { Save, X } from "lucide-react";

const ClinicalNoteEditor = () => {
  const { clientId, noteId } = useParams();
  const navigate = useNavigate();
  const { providerId, userId, orgId } = useSessionIdentity();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const note = await getNote(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setNoteType(note.noteType);
        setTags(note.tags.join(", "));
      }
    } catch (err) {
      console.error("Failed to load note:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in title and content");
      return;
    }

    setSaving(true);
    try {
      const providerIdToUse = providerId || userId;
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

      if (noteId) {
        const result = await updateNote(noteId, {
          title: title.trim(),
          content: content.trim(),
          noteType,
          tags: tagsArray,
        });
        if (result.ok) {
          navigate(`/provider/clients/${clientId}`);
        } else {
          alert("Failed to save note: " + result.error);
        }
      } else {
        const result = await createNote({
          clientId,
          providerId: providerIdToUse,
          orgId,
          noteType,
          title: title.trim(),
          content: content.trim(),
          tags: tagsArray,
        });
        if (result.ok) {
          navigate(`/provider/clients/${clientId}`);
        } else {
          alert("Failed to create note: " + result.error);
        }
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Clinical Note" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading note...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title={noteId ? "Edit Note" : "New Clinical Note"}
        subtitle={`Client: ${clientId?.substring(0, 8)}...`}
      />
      <div className="lux-shell py-10">
        <div className="lux-card p-6 border border-white/10 bg-white/5 max-w-3xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              placeholder="Note title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Note Type</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
            >
              <option value="general">General</option>
              <option value="soap">SOAP</option>
              <option value="progress">Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
              placeholder="Note content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Note"}
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

export default ClinicalNoteEditor;

