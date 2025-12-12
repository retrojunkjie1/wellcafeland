/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - Narrative Layer (Oracle)
 * 
 * Transforms analytical patterns into gentle, reflective, human language.
 * Trauma-informed, non-blaming, shame-safe, wise.
 */

import type { SeerAnalyticsSummary, SeerNarrativeInsight } from './seerTypes';

/**
 * Generates narrative insight from analytical summary.
 * 
 * This is the oracle layer - turning data into wisdom.
 * Language is gentle, reflective, non-judgmental.
 * Patterns are information, not verdicts.
 */
export function generateNarrativeInsight(
  analytics: SeerAnalyticsSummary
): SeerNarrativeInsight | null {
  if (!analytics) return null;

  // Build insight based on patterns
  const insights: string[] = [];
  let tone: SeerNarrativeInsight['tone'] = 'informative';

  // Dominant signal reflection
  if (analytics.dominantSignal) {
    const signalReflections: Record<string, { title: string; body: string; tone: SeerNarrativeInsight['tone'] }> = {
      steady: {
        title: 'A Steady Presence',
        body: 'It looks like your system has been finding moments of steadiness. This could mean your capacity for regulation is present, not a measure of how you should always feel.',
        tone: 'supportive',
      },
      anxious: {
        title: 'Anxious Waves',
        body: 'It may be that anxiety has been present in your experience. This could mean your nervous system is responding to what it perceives as threat or uncertainty. It makes sense, and support is available.',
        tone: 'gentle',
      },
      overwhelmed: {
        title: 'Feeling Overwhelmed',
        body: 'It looks like your system has been carrying a lot. This could mean your capacity is being stretched. Overwhelm is information, not a failure—an invitation to slow down, not a verdict on your strength.',
        tone: 'gentle',
      },
      numb: {
        title: 'Numbness as Protection',
        body: 'It may be that numbness has been present. This could mean your system is protecting itself when things feel too much. It is not a sign that you do not care—it may be a sign that you have cared deeply.',
        tone: 'gentle',
      },
      shame: {
        title: 'Shame Patterns',
        body: 'It looks like shame has been showing up. Shame thrives in isolation and often distorts reality. You are not your shame. This pattern could mean information about what your system is carrying, not who you are.',
        tone: 'gentle',
      },
      panic: {
        title: 'Panic Responses',
        body: 'It may be that panic has been part of your experience. Panic could mean your nervous system is in override mode—it feels overwhelming, but it is temporary. You have survived panic moments before, and support is here.',
        tone: 'supportive',
      },
      freeze: {
        title: 'Freeze States',
        body: 'It looks like freeze responses have been present. This could mean your system is trying to protect you when fight or flight feels impossible. Freeze is not weakness—it is information, not a judgment.',
        tone: 'gentle',
      },
      grief: {
        title: 'Grief Waves',
        body: 'It may be that grief has been moving through you. Grief exists because something mattered. This could mean an experience to honor with presence and care, not a problem to solve.',
        tone: 'supportive',
      },
    };

    const reflection = signalReflections[analytics.dominantSignal];
    if (reflection) {
      insights.push(reflection.body);
      tone = reflection.tone;
    }
  }

  // Stress level reflection
  if (analytics.averageStress >= 7) {
    insights.push(
      'It looks like your stress levels have been elevated. This could mean information about what your system is managing, not a measure of your ability to cope. Elevated stress may be a signal that support and rest could be helpful.'
    );
    tone = 'gentle';
  } else if (analytics.averageStress >= 5) {
    insights.push(
      'It may be that your stress levels have been moderate. This could mean information about your current experience. Moderate stress is normal in difficult times, and it is okay to need support.'
    );
  }

  // Rising stress trend
  if (analytics.risingStressTrend) {
    insights.push(
      'It looks like there has been a gradual increase in stress over time. This could mean a pattern worth noticing, not a cause for alarm. Rising stress may be information that your system could benefit from additional support or rest.'
    );
    tone = 'supportive';
  }

  // Evening bias
  if (analytics.eveningBias) {
    insights.push(
      'It may be that difficult feelings tend to surface more in the evening. This could mean evenings are when your system finally slows down enough to feel what has been held during the day. This is not a flaw—it could be information about your rhythm.'
    );
  }

  // Distribution insights
  if (analytics.distribution.length > 1) {
    const topTwo = analytics.distribution.slice(0, 2);
    if (topTwo[0].percentage >= 40 && topTwo[1].percentage >= 20) {
      insights.push(
        `It looks like your emotional experience has been varied, with ${topTwo[0].tag} and ${topTwo[1].tag} both present. This variety could mean your system is responding to what is happening in your life. You are not meant to feel one way all the time.`
      );
    }
  }

  // Max stress reflection
  if (analytics.maxStress >= 9) {
    insights.push(
      'It may be that there have been moments of very high stress. These moments are intense, but they are temporary. You have survived them, and support is here. High stress moments could mean information about what your system is managing, not a measure of your resilience.'
    );
    tone = 'supportive';
  }

  // Build final narrative
  if (insights.length === 0) {
    return {
      title: 'Patterns and Presence',
      body: 'It looks like patterns are emerging. These patterns could mean information about your experience, not verdicts on your worth. Every pattern may make sense in context, and every feeling is valid.',
      tone: 'informative',
    };
  }

  // Combine insights with gentle transitions
  const body = insights.join(' ');

  // Generate title based on dominant pattern
  let title = 'Patterns and Presence';
  if (analytics.dominantSignal) {
    const titleMap: Record<string, string> = {
      steady: 'Steady Moments',
      anxious: 'Anxious Waves',
      overwhelmed: 'Feeling Overwhelmed',
      numb: 'Numbness as Protection',
      shame: 'Shame Patterns',
      panic: 'Panic Responses',
      freeze: 'Freeze States',
      grief: 'Grief Waves',
    };
    title = titleMap[analytics.dominantSignal] || title;
  }

  return {
    title,
    body,
    tone,
  };
}

