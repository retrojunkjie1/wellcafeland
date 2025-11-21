// src/apps/ai/AssistantConsole.jsx

import React,{useState} from "react";
import {X,ArrowUp,MessageCircle,Loader2,MessageSquare} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useAIStore} from "./useAIStore";
import SessionHistorySidebar from "./SessionHistorySidebar";
import { getLastSession } from "../../services/sessionHistory";
import { apiFetch } from "../../lib/apiHelpers";

const sendToAI = async (text,setThinking,addAssistant,setError) => {
  try {
    setThinking(true);
    setError(null);
    const res = await apiFetch("/aiSession",{
      method:"POST",
      body:{
        prompt:text,
        mode:"session"
      }
    });
    if(!res.ok){
      const body = await res.text();
      console.error("AI error:",body);
      setError("AI is overloaded or unavailable. Try again in a moment.");
      addAssistant("I ran into a hiccup talking to the main brain. Try asking in a simpler way or in a few seconds.");
      return;
    }
    const data = await res.json();
    const reply = data.reply || data.summary || data.message || "I've processed that. Let's take your next step together.";
    addAssistant(reply);
  } catch(err){
    console.error("AI request failed:",err);
    setError("Network error reaching the AI brain.");
    addAssistant("I couldn't reach the cloud right now, but I'm still here with you. Try again in a bit.");
  } finally {
    setThinking(false);
  }
};

const AssistantConsole = () => {
  const navigate = useNavigate();
  const {isConsoleOpen,messages,addUserMessage,addAssistantMessage,closeConsole,toggleConsole,isThinking,setThinking,error,setError} = useAIStore();
  const [input,setInput] = useState("");
  const [lastSentId,setLastSentId] = useState(null);
  const [showHistory,setShowHistory] = useState(false);
  const [lastSession, setLastSession] = React.useState(null);

  React.useEffect(() => {
    const sess = getLastSession();
    setLastSession(sess);
  }, []);

  // Auto-send when console opens with a new user message from startWithPrompt
  React.useEffect(() => {
    if(!isConsoleOpen || isThinking) return;
    const lastMsg = messages[messages.length - 1];
    if(lastMsg && lastMsg.role === "user" && lastMsg.id !== lastSentId){
      setLastSentId(lastMsg.id);
      sendToAI(lastMsg.content,setThinking,addAssistantMessage,setError);
    }
  },[isConsoleOpen,messages,isThinking,lastSentId,setThinking,addAssistantMessage,setError]);

  const handleSend = async () => {
    const text = input.trim();
    if(!text) return;
    addUserMessage(text);
    setInput("");
    await sendToAI(text,setThinking,addAssistantMessage,setError);
  };

  const handleKeyDown = async (e) => {
    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      await handleSend();
    }
  };

  function handleRepeatFromConsole() {
    if (!lastSession) return;
    navigate(
      `/sessions/view/${encodeURIComponent(
        lastSession.id || "last-session"
      )}`,
      { state: { session: lastSession, from: "console_last_session" } }
    );
  }

  return (
    <div className={`
      w-full
      ${isConsoleOpen ? 'h-[50vh] sm:h-[60vh]' : 'h-14'}
      transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
      border-t border-amber-400/30 bg-slate-950/95 backdrop-blur-xl
      flex flex-col
      shadow-2xl
      ${isConsoleOpen ? 'shadow-amber-500/20' : 'shadow-amber-500/5'}
    `}
    style={{
      transform: isConsoleOpen ? 'translateY(0)' : 'translateY(0)',
      boxShadow: isConsoleOpen 
        ? '0 -20px 60px -15px rgba(251, 191, 36, 0.3), 0 0 0 1px rgba(251, 191, 36, 0.1)' 
        : '0 -4px 20px -5px rgba(251, 191, 36, 0.1)',
    }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Session History Sidebar */}
        {isConsoleOpen && showHistory && (
          <div className="absolute left-0 top-0 bottom-0 w-64 border-r border-amber-400/20 bg-slate-950/98 z-10">
            <SessionHistorySidebar />
          </div>
        )}
        {/* Header - Collapsible */}
        <div 
          className={`flex items-center justify-between px-4 py-3 border-b border-amber-400/20 cursor-pointer hover:bg-slate-900/50 transition-colors ${showHistory ? 'pl-72' : ''}`}
          onClick={isConsoleOpen ? undefined : toggleConsole}
        >
          <div className="flex items-center gap-3">
            {isConsoleOpen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistory(!showHistory);
                }}
                className="h-7 w-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0"
                title="Toggle conversation history"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="h-8 w-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            {isConsoleOpen && (
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-amber-300">
                  Your Wellness Guide
                </div>
                <div className="text-[11px] text-amber-100/80">
                  Living AI • Ancient Wise • Present With You
                </div>
              </div>
            )}
            {!isConsoleOpen && (
              <span className="text-sm text-amber-300 font-medium">Your Wellness Guide</span>
            )}
          </div>
          {isConsoleOpen && (
            <button
              type="button"
              onClick={closeConsole}
              className="h-7 w-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Messages - Only show when open */}
        {isConsoleOpen && (
          <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950 ${showHistory ? 'ml-64' : ''}`}>
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-2xl rounded-br-md bg-amber-400 text-slate-950 px-3 py-2 text-sm shadow-sm"
                    : "inline-block rounded-2xl rounded-bl-md bg-slate-800/80 text-slate-100 px-3 py-2 text-sm border border-slate-700/60"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-amber-200/90">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking with the higher councils…
            </div>
          )}
          {error && (
            <div className="text-xs text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          </div>
        )}

        {/* Input - Always visible when open */}
        {isConsoleOpen && (
          <div className={`border-t border-amber-400/20 bg-slate-950/95 px-3 py-2 flex-shrink-0 ${showHistory ? 'ml-64' : ''}`}>
          <div className="flex items-end gap-2">
            <label htmlFor="wellness-guide-input" className="sr-only">
              Message input for Wellness Guide
            </label>
            <textarea
              id="wellness-guide-input"
              name="wellness-guide-input"
              rows={1}
              className="flex-1 resize-none rounded-xl bg-slate-900/80 border border-slate-700/70 text-sm text-slate-100 px-3 py-2 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 placeholder:text-slate-500"
              placeholder="Tell me what's real for you right now…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="h-9 w-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
            {lastSession && (
              <button
                type="button"
                className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 hover:text-amber-200 transition-colors"
                onClick={handleRepeatFromConsole}
              >
                Repeat last session
              </button>
            )}
            <button
              type="button"
              className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 hover:text-amber-200 transition-colors"
              onClick={() => useAIStore.getState().startWithPrompt("I feel overwhelmed. Help me stabilize my mind and body right now.")}
            >
              "I feel overwhelmed"
            </button>
            <button
              type="button"
              className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 hover:text-amber-200 transition-colors"
              onClick={() => useAIStore.getState().startWithPrompt("Design a 5-minute grounding practice I can do right now.")}
            >
              "Design a 5-minute practice"
            </button>
            <button
              type="button"
              className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 hover:text-amber-200 transition-colors"
              onClick={() => useAIStore.getState().startWithPrompt("I think I might relapse. Help me think clearly about this urge and my options.")}
            >
              "Talk me off the ledge"
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantConsole;

