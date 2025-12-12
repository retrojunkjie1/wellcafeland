/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - Intervention Registry
 * 
 * Library of core, clinically-sensible interventions.
 * Trauma-informed, non-judgmental, shame-safe.
 * 
 * This is a solid base set that can be expanded later.
 */

import type { HealerIntervention } from './healerTypes';

export const healerRegistry: HealerIntervention[] = [
  {
    id: 'ground_5_4_3_2_1',
    name: '5-4-3-2-1 Senses Grounding',
    category: 'grounding',
    intensity: 'low',
    suitableForSignals: ['anxious', 'overwhelmed', 'panic', 'freeze'],
    suitableForRisk: ['medium', 'high', 'critical'],
    approximateDurationSeconds: 240,
    summary:
      'A short, sensory grounding sequence to help reconnect to the present moment when things feel too loud inside.',
    steps: [
      {
        id: 'step1',
        label: 'Look Around',
        description: 'Gently look around and name 5 things you can see, either out loud or silently.',
      },
      {
        id: 'step2',
        label: 'Touch',
        description: 'Notice 4 things you can feel through touch (your feet on the floor, clothing on your skin, the chair, etc.).',
      },
      {
        id: 'step3',
        label: 'Listen',
        description: 'Name 3 sounds you can hear right now, even very faint ones.',
      },
      {
        id: 'step4',
        label: 'Smell',
        description: 'Notice 2 things you can smell, or remember a smell you find calming if none are obvious.',
      },
      {
        id: 'step5',
        label: 'Taste',
        description: 'Notice 1 thing about the taste in your mouth, or imagine a taste you find comforting.',
      },
    ],
    notes: 'Keep pace gentle, no forcing. If any step feels like too much, it is okay to stop early.',
    linkedRitualSequenceKey: 'orientingProtocol',
  },
  {
    id: 'breath_box_4_4_4_4',
    name: '4x4 Box Breathing',
    category: 'breathwork',
    intensity: 'low',
    suitableForSignals: ['anxious', 'overwhelmed', 'shame', 'grief'],
    suitableForRisk: ['low', 'medium', 'high'],
    approximateDurationSeconds: 180,
    summary:
      'A simple, structured breathing pattern to help the nervous system settle without strain.',
    steps: [
      {
        id: 'step1',
        label: 'Inhale',
        description: 'Inhale gently through the nose for a count of 4.',
      },
      {
        id: 'step2',
        label: 'Hold',
        description: 'Hold the breath softly for a count of 4 (no straining).',
      },
      {
        id: 'step3',
        label: 'Exhale',
        description: 'Exhale slowly through the mouth for a count of 4.',
      },
      {
        id: 'step4',
        label: 'Rest',
        description: 'Pause and rest for a count of 4 before the next breath cycle.',
      },
    ],
    notes: 'If holding feels uncomfortable, skip the hold step and move from inhale to slow exhale.',
    linkedRitualSequenceKey: 'standardSequence',
  },
  {
    id: 'shame_hand_on_heart',
    name: 'Hand-on-Heart Shame Soften',
    category: 'shame_rescue',
    intensity: 'low',
    suitableForSignals: ['shame', 'overwhelmed', 'numb'],
    suitableForRisk: ['medium', 'high'],
    approximateDurationSeconds: 240,
    summary:
      'A gentle self-contact and self-talk protocol for when shame feels heavy or the mind is attacking itself.',
    steps: [
      {
        id: 'step1',
        label: 'Hand Placement',
        description: 'Place a hand over your chest or another area that feels safe to touch.',
      },
      {
        id: 'step2',
        label: 'Anchor Breath',
        description: 'Take 3 slow, natural breaths, just noticing your hand rise and fall.',
      },
      {
        id: 'step3',
        label: 'Gentle Statement',
        description:
          'Quietly repeat a kind phrase such as "It makes sense that I feel this way," or "I am allowed to be human in this moment."',
      },
      {
        id: 'step4',
        label: 'Stay With Warmth',
        description:
          'Stay with the feeling of your hand resting there, imagining warmth or soft light around the area.',
      },
    ],
    notes: 'Language must never blame. All phrases should validate experience, not dismiss it.',
    linkedRitualSequenceKey: 'selfCompassionProtocol',
  },
  {
    id: 'panic_anchoring_feet',
    name: 'Panic Anchoring: Feet and Breath',
    category: 'panic_calm',
    intensity: 'low',
    suitableForSignals: ['panic', 'overwhelmed', 'freeze'],
    suitableForRisk: ['high', 'critical'],
    approximateDurationSeconds: 180,
    summary:
      'A short reset to help the body remember it has ground and breath when panic or fear spikes.',
    steps: [
      {
        id: 'step1',
        label: 'Find Your Feet',
        description: 'Notice your feet on the floor or any surface. Press them down gently and feel the contact.',
      },
      {
        id: 'step2',
        label: 'Short Exhale',
        description: 'Take a slow breath in, then a longer, softer exhale, as if gently fogging a mirror.',
      },
      {
        id: 'step3',
        label: 'Name Safety Cues',
        description: 'Look for 2 or 3 signs that you are physically safe right now (a closed door, trusted objects, your own breathing).',
      },
    ],
    notes: 'Keep voice and pacing calm. No pressure to "fix" anything quickly.',
    linkedRitualSequenceKey: 'anchoringProtocol',
  },
  {
    id: 'grief_wave_seat',
    name: 'Grief Wave Seat',
    category: 'grief_support',
    intensity: 'low',
    suitableForSignals: ['grief', 'overwhelmed', 'numb'],
    suitableForRisk: ['medium', 'high'],
    approximateDurationSeconds: 300,
    summary:
      'A practice for sitting with a wave of grief in a way that honors it without drowning in it.',
    steps: [
      {
        id: 'step1',
        label: 'Choose a Position',
        description: 'Sit or lie in a position that feels as safe as possible for a few minutes.',
      },
      {
        id: 'step2',
        label: 'Name the Wave',
        description:
          'Quietly name the wave: "A wave of grief is here," or whatever language feels right to you.',
      },
      {
        id: 'step3',
        label: 'Stay Close to Breath',
        description: 'Let your breath move naturally, as if you are breathing alongside the grief instead of against it.',
      },
      {
        id: 'step4',
        label: 'Set a Gentle Limit',
        description:
          'You might tell yourself: "For these next few minutes I will just stay with this wave, and it does not have to be resolved."',
      },
    ],
    notes: 'This is not exposure therapy; it is accompaniment. Emphasize permission to stop at any time.',
  },
];
