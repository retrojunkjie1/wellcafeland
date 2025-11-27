// src/apps/social/DirectMessagePage.jsx
// Direct messaging page (safe mode, text-only)

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, User, Circle } from "lucide-react";
import { listDMThreads, listMessages, sendMessage } from "@/services/socialService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import PageHeader from "@/components/navigation/PageHeader";

const DirectMessagePage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { userId } = useSessionIdentity();
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadThreads();
  }, [userId]);

  useEffect(() => {
    if (threadId) {
      loadMessages();
      // Refresh messages every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const threadsData = await listDMThreads(userId);
      setThreads(threadsData);
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await listMessages(threadId);
      setMessages(messagesData);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !threadId || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(threadId, userId, newMessage);
      if (result.ok) {
        setNewMessage("");
        await loadMessages();
      } else {
        alert(result.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Direct Messages" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Threads Sidebar */}
      <div className="w-64 border-r border-white/10 bg-slate-900">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Messages</h2>
        </div>
        <div className="overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-sm text-white/50">No messages yet</div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate(`/social/dm/${thread.id}`)}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition ${
                  threadId === thread.id ? "bg-white/10" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-wcGold/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-wcGold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {thread.otherParticipant ? `User ${thread.otherParticipant.slice(0, 8)}` : "Unknown"}
                    </div>
                    <div className="text-xs text-white/50">
                      {thread.updatedAt ? new Date(thread.updatedAt).toLocaleDateString() : "Recently"}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {threadId ? (
          <>
            <PageHeader title="Direct Message" />
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto lux-shell py-6">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 py-12">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.userId === userId ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.userId === userId
                          ? "bg-wcGold/20 text-wcGold"
                          : "bg-white/5 text-white"
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className="text-xs opacity-50 mt-1">
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ""}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-white/10 bg-slate-950 px-4 sm:px-6 py-4">
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message (text only)..."
                  rows={2}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="flex-shrink-0 px-4 py-2 rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/30 hover:bg-wcGold/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Messages are moderated for safety. No images or videos.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/50">
              <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagePage;

