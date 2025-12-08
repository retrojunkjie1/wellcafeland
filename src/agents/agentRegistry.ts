/**
 * WellnessCafe OS - Phase 55
 * Multi-Agent Fusion Protocol - Agent Registry
 * 
 * Static registry of core agents and their capabilities.
 * Each agent represents a persona/role in the system.
 */

import type { AgentProfile } from './agentTypes';

export const agentRegistry: AgentProfile[] = [
  {
    id: 'overseer',
    displayName: 'Overseer',
    primaryCapabilities: ['risk_assessment', 'escalation_guard'],
    description:
      'Monitors the whole system, watches risk, and decides when to slow down, intervene, or escalate.',
  },
  {
    id: 'seer',
    displayName: 'Seer',
    primaryCapabilities: ['pattern_insight', 'reflection_prompt'],
    description:
      'Notices patterns over time and offers gentle, insight-based reflections without judgment.',
  },
  {
    id: 'healer',
    displayName: 'Healer',
    primaryCapabilities: ['ritual_selection', 'grounding_guidance'],
    description:
      'Guides the user into nervous-system-safe rituals, grounding sequences, and somatic resets.',
  },
  {
    id: 'sentinel',
    displayName: 'Sentinel',
    primaryCapabilities: ['escalation_guard', 'risk_assessment'],
    description:
      'Acts as a guardian at the gate, especially in high or critical risk states, preventing overwhelm.',
  },
  {
    id: 'towncrier',
    displayName: 'Towncrier',
    primaryCapabilities: ['reflection_prompt'],
    description:
      'Handles announcements, summaries, and gentle nudges about progress—never shaming, always supportive.',
  },
];

/**
 * Gets an agent profile by ID.
 * Returns the first agent (overseer) as fallback if not found.
 */
export const getAgentProfile = (id: AgentProfile['id']): AgentProfile =>
  agentRegistry.find((a) => a.id === id) ?? agentRegistry[0];

