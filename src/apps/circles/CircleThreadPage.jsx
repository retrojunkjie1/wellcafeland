// src/apps/circles/CircleThreadPage.jsx
// Circle thread page with messages and reactions

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, Smile, User, Eye, EyeOff } from "lucide-react";
import { getThreadMessages, postMessage, reactToMessage } from "@/services/circlesService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import PageHeader from "@/components/navigation/PageHeader";

const CircleThreadPage = () => {
  const { circleId, threadId } = useParams();
  const { userId } = useSessionIdentity();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Refresh messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const messagesData = await getThreadMessages(circleId, threadId);
      setMessages(messagesData);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const result = await postMessage(circleId, threadId, newMessage, anonymous, userId);
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

  const handleReaction = async (messageId, emoji) => {
    try {
      await reactToMessage(circleId, threadId, messageId, emoji, userId);
      // Reload messages to show new reaction
      await loadMessages();
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
  };

  const reactions = ["💙", "🌱", "🙏", "✨"];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Thread" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <PageHeader
        title="Thread"
        backTo={`/circles/${circleId}`}
      />
      
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
                className="lux-card p-4 border border-white/10 bg-white/5"
              >
                <div className="flex items-start gap-3 mb-2">
                  {message.anonymous ? (
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                      <EyeOff className="h-4 w-4 text-white/50" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-wcGold/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-wcGold" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/50 mb-1">
                      {message.anonymous ? "Anonymous" : `User ${message.userId?.slice(0, 8) || "Unknown"}`}
                    </div>
                    <p className="text-white text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {reactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message.id, emoji)}
                          className="text-lg hover:scale-110 transition"
                          title={emoji === "💙" ? "Here with you" : 
                                 emoji === "🌱" ? "Breathing with you" :
                                 emoji === "🙏" ? "Thank you for sharing" :
                                 "Grateful"}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
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
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setAnonymous(!anonymous)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition ${
                  anonymous
                    ? "bg-wcGold/20 text-wcGold border border-wcGold/30"
                    : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                }`}
              >
                {anonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{anonymous ? "Anonymous" : "Visible"}</span>
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/30 hover:bg-wcGold/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircleThreadPage;

