// src/apps/ai/useAIStore.js

import {create} from "zustand";

// Load sessions from localStorage
const loadSessions = () => {
  try {
    const saved = localStorage.getItem('wc-ai-sessions');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save sessions to localStorage
const saveSessions = (sessions) => {
  try {
    localStorage.setItem('wc-ai-sessions', JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save sessions:', err);
  }
};

const welcomeMessage = {
  id:"welcome",
  role:"system",
  content:"Welcome to WellnessCafe OS. I am your living guide. Tell me what's happening in your world right now."
};

export const useAIStore = create((set,get) => ({
  isConsoleOpen:false,
  isThinking:false,
  currentSessionId:null,
  sessions:loadSessions(),
  messages:[welcomeMessage],
  error:null,
  
  openConsole:() => set({isConsoleOpen:true}),
  closeConsole:() => set({isConsoleOpen:false}),
  toggleConsole:() => set({isConsoleOpen:!get().isConsoleOpen}),
  
  addUserMessage:(text) => {
    if(!text?.trim()) return;
    const msg = {id:`user-${Date.now()}`,role:"user",content:text.trim()};
    const newMessages = [...get().messages,msg];
    set({messages:newMessages,error:null});
    get().saveCurrentSession();
  },
  
  addAssistantMessage:(text) => {
    const msg = {id:`assistant-${Date.now()}`,role:"assistant",content:text};
    const newMessages = [...get().messages,msg];
    set({messages:newMessages});
    get().saveCurrentSession();
  },
  
  setError:(err) => set({error:err}),
  setThinking:(flag) => set({isThinking:flag}),
  
  startWithPrompt:(prompt) => {
    const base = [welcomeMessage];
    const userMsg = {id:`user-${Date.now()}`,role:"user",content:prompt};
    const sessionId = `session-${Date.now()}`;
    const sessionTitle = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
    
    set({
      isConsoleOpen:true,
      currentSessionId:sessionId,
      messages:[...base,userMsg],
      error:null
    });
    
    get().saveCurrentSession(sessionTitle);
  },
  
  saveCurrentSession:(title) => {
    const state = get();
    const sessionId = state.currentSessionId || `session-${Date.now()}`;
    const sessionTitle = title || state.messages.find(m => m.role === 'user')?.content?.substring(0, 50) || 'New conversation';
    
    const session = {
      id:sessionId,
      title:sessionTitle,
      messages:state.messages,
      updatedAt:Date.now(),
      createdAt:state.sessions.find(s => s.id === sessionId)?.createdAt || Date.now()
    };
    
    const sessions = state.sessions.filter(s => s.id !== sessionId);
    sessions.unshift(session);
    
    // Keep only last 50 sessions
    const limitedSessions = sessions.slice(0, 50);
    
    set({sessions:limitedSessions,currentSessionId:sessionId});
    saveSessions(limitedSessions);
  },
  
  loadSession:(sessionId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if(session) {
      set({
        currentSessionId:sessionId,
        messages:session.messages,
        isConsoleOpen:true,
        error:null
      });
    }
  },
  
  newSession:() => {
    set({
      currentSessionId:null,
      messages:[welcomeMessage],
      isConsoleOpen:true,
      error:null
    });
  },
  
  deleteSession:(sessionId) => {
    const sessions = get().sessions.filter(s => s.id !== sessionId);
    set({sessions});
    saveSessions(sessions);
    if(get().currentSessionId === sessionId) {
      get().newSession();
    }
  }
}));

