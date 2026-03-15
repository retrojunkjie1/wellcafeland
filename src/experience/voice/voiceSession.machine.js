// src/experience/voice/voiceSession.machine.js
// Phase 56: reducer-based state machine for voice session (framework-agnostic).

export const STATES = {
  idle: "idle",
  permission: "permission",
  ready: "ready",
  listening: "listening",
  processing: "processing",
  speaking: "speaking",
  error: "error",
};

export const EVENTS = {
  REQUEST_PERMISSION: "REQUEST_PERMISSION",
  PERMISSION_GRANTED: "PERMISSION_GRANTED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  START_LISTENING: "START_LISTENING",
  STOP_LISTENING: "STOP_LISTENING",
  START_PROCESSING: "START_PROCESSING",
  START_SPEAKING: "START_SPEAKING",
  STOP_SPEAKING: "STOP_SPEAKING",
  ERROR: "ERROR",
  RESET: "RESET",
};

const TRANSITIONS = {
  [STATES.idle]: {
    [EVENTS.REQUEST_PERMISSION]: STATES.permission,
    [EVENTS.RESET]: STATES.idle,
  },
  [STATES.permission]: {
    [EVENTS.PERMISSION_GRANTED]: STATES.ready,
    [EVENTS.PERMISSION_DENIED]: STATES.error,
    [EVENTS.ERROR]: STATES.error,
    [EVENTS.RESET]: STATES.idle,
  },
  [STATES.ready]: {
    [EVENTS.START_LISTENING]: STATES.listening,
    [EVENTS.RESET]: STATES.idle,
    [EVENTS.ERROR]: STATES.error,
  },
  [STATES.listening]: {
    [EVENTS.STOP_LISTENING]: STATES.ready,
    [EVENTS.START_PROCESSING]: STATES.processing,
    [EVENTS.ERROR]: STATES.error,
    [EVENTS.RESET]: STATES.idle,
  },
  [STATES.processing]: {
    [EVENTS.START_SPEAKING]: STATES.speaking,
    [EVENTS.STOP_LISTENING]: STATES.ready,
    [EVENTS.ERROR]: STATES.error,
    [EVENTS.RESET]: STATES.idle,
  },
  [STATES.speaking]: {
    [EVENTS.STOP_SPEAKING]: STATES.idle,
    [EVENTS.STOP_LISTENING]: STATES.idle,
    [EVENTS.RESET]: STATES.idle,
    [EVENTS.ERROR]: STATES.error,
  },
  [STATES.error]: {
    [EVENTS.RESET]: STATES.idle,
    [EVENTS.REQUEST_PERMISSION]: STATES.permission,
  },
};

export function transition(state, event) {
  const next = TRANSITIONS[state]?.[event];
  return next ?? state;
}

export const initialState = STATES.idle;

export function createReducer(initialStateOverride = STATES.idle) {
  return (state = initialStateOverride, action) => {
    if (!action?.type) return state;
    return transition(state, action.type);
  };
}
