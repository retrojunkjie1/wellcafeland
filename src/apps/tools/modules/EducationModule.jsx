// src/apps/tools/modules/EducationModule.jsx
// Education content with high-quality snippets

import React, { useState, useEffect, useCallback } from "react";
import { Volume2, X } from "lucide-react";
import { guideEngine, speakText } from "@/services/multimodalClient";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const TOPICS = [
  "Shame and Recovery",
  "Cravings and Urges",
  "Nervous System Regulation",
  "Trauma and Recovery",
  "Sleep and Recovery",
  "Boundaries in Recovery",
  "Grief and Loss",
  "Self-Compassion",
];

const EducationModule = ({ onComplete, onCancel, _initialContext, isEmbedded = false, topic: initialTopic = null }) => {
  const [topic, setTopic] = useState(initialTopic || TOPICS[0]);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled] = useState(true);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (topic) {
      loadContent(topic);
    }
  }, [topic]);

  const loadContent = async (selectedTopic) => {
    setIsLoading(true);
    try {
      const result = await guideEngine(`Teach me about ${selectedTopic} at a level suitable for people in recovery. Make it accessible, trauma-informed, and practical. Provide 2-3 short paragraphs and 1 reflection question.`, {
        mode: "education",
      });

      if (result.ok && result.content) {
        // Try to parse as JSON, fallback to text
        let data;
        try {
          data = typeof result.content === "object" ? result.content : JSON.parse(result.content);
        } catch {
          // If parsing fails, create structure from text
          data = {
            title: selectedTopic,
            sections: [
              {
                heading: "Understanding",
                content: result.content,
              },
            ],
            keyPoints: [],
            reflectionQuestions: ["What resonates with you about this?"],
          };
        }
        setContent(data);
      } else {
        // Fallback content
        setContent({
          title: selectedTopic,
          sections: [
            {
              heading: "Understanding",
              content: "This topic is important for recovery. Let's explore it together with compassion and curiosity.",
            },
          ],
          keyPoints: [],
          reflectionQuestions: ["What resonates with you?"],
        });
      }
    } catch (err) {
      console.error("Failed to load content:", err);
      setContent({
        title: selectedTopic,
        sections: [{ heading: "Introduction", content: "Content loading failed. Please try again." }],
        keyPoints: [],
        reflectionQuestions: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playContent = async () => {
    if (!content || !audioEnabled) return;

    const summary = [
      content.title,
      ...content.sections.map((s) => `${s.heading}. ${s.content}`),
      ...(content.keyPoints || []),
    ].join(". ");

    try {
      await speakText(summary);
    } catch (err) {
      console.error("Failed to play content:", err);
    }
  };

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    const result = createToolResult(
      "education",
      "Education",
      `Explored ${topic}. Read ${content?.sections?.length || 0} sections.`,
      {
        topic,
        sectionsRead: content?.sections?.length || 0,
        hasReflection: (content?.reflectionQuestions?.length || 0) > 0,
      },
      durationSeconds
    );

    // Log telemetry (non-blocking)
    logToolUsage("education", {
      startedAt: startTime,
      completedAt: endTime,
      durationMs: durationSeconds * 1000,
      context: {
        topic,
        sectionsRead: content?.sections?.length || 0,
      },
    }).catch(err => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [startTime, topic, content, onComplete]);

  const handleCancel = useCallback(() => {
    safeCancel(onCancel);
  }, [onCancel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-base text-white/60">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Education</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Topic Selector */}
      <div>
        <h3 className="text-base font-medium text-white/70 mb-3">Choose a Topic</h3>
        <div className="grid grid-cols-2 gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                topic === t
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {content && (
        <div className="space-y-6 animate-fade-in">
          {/* Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-white">{content.title}</h2>
            {audioEnabled && (
              <button
                type="button"
                onClick={playContent}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 transition"
              >
                <Volume2 className="h-4 w-4" />
                Read to me
              </button>
            )}
          </div>

          {/* Sections */}
          {content.sections && content.sections.length > 0 && (
            <div className="space-y-4">
              {content.sections.map((section, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-medium text-white mb-3">{section.heading}</h3>
                  <div className="text-base text-white/80 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                </div>
              ))}
            </div>
          )}

          {/* Key Points */}
          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="text-lg font-medium text-white mb-3">Key Points</h3>
              <ul className="space-y-2">
                {content.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-base text-white/80 flex items-start gap-2">
                    <span className="text-wcGold mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reflection Questions */}
          {content.reflectionQuestions && content.reflectionQuestions.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-medium text-white mb-3">Reflection</h3>
              <div className="space-y-3">
                {content.reflectionQuestions.map((question, idx) => (
                  <p key={idx} className="text-base text-white/70 italic">
                    {question}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Complete Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleComplete}
              className="w-full rounded-lg bg-white/10 px-6 py-3 text-base font-medium text-white transition hover:bg-white/20"
            >
              I've finished reading
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationModule;
