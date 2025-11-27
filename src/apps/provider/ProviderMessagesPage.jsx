// src/apps/provider/ProviderMessagesPage.jsx
// Provider-client messaging page

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getOrCreateConversationId, sendMessage, listenToMessages } from "@/services/messagingService";
import PageHeader from "@/components/navigation/PageHeader";
import { Send, MessageSquare, Users } from "lucide-react";

const ProviderMessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { providerId, userId } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const clientIdParam = searchParams.get("clientId");
    if (clientIdParam) {
      setSelectedClientId(clientIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadClients();
  }, [providerId, userId]);

  useEffect(() => {
    if (selectedClientId) {
      loadMessages();
    }
  }, [selectedClientId, providerId, userId]);

  const loadClients = async () => {
    try {
      const providerIdToUse = providerId || userId;
      if (!providerIdToUse) return;

      const assignments = await listAssignmentsForProvider(providerIdToUse);
      setClients(assignments.map((a) => ({ id: a.clientId, alias: `Client ${a.clientId.substring(0, 8)}` })));
    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  };

  const loadMessages = () => {
    if (!selectedClientId || !providerId || !userId) return;

    const providerIdToUse = providerId || userId;
    const conversationId = getOrCreateConversationId(selectedClientId, providerIdToUse);

    const unsubscribe = listenToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedClientId || sending) return;

    setSending(true);
    try {
      const providerIdToUse = providerId || userId;
      const result = await sendMessage({
        clientId: selectedClientId,
        providerId: providerIdToUse,
        senderId: providerIdToUse,
        senderRole: "provider",
        content: messageText.trim(),
        type: "text",
      });

      if (result.ok) {
        setMessageText("");
      } else {
        alert("Failed to send message: " + result.error);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <PageHeader title="Messages" subtitle="Communicate with your clients" />
      <div className="flex-1 flex overflow-hidden">
        {/* Client List */}
        <div className="w-64 border-r border-white/10 bg-white/5 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selectedClientId === client.id
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="text-sm font-medium">{client.alias}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedClientId ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === "provider" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.senderRole === "provider"
                          ? "bg-wcGold/20 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim() || sending}
                    className="px-4 py-2 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/50">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Select a client to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderMessagesPage;

