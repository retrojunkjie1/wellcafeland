import { describe, expect, it } from "vitest";
import {
  getJourneyNodes,
  getJourneyFollowUps,
  pickNextTopicJourneyNode,
} from "./interactiveJourneyEngine";

describe("getJourneyFollowUps", () => {
  it("returns new details nested under the selected perspective, not its visible siblings", () => {
    const visiblePerspectives = getJourneyNodes("sleep-and-recovery", "why-sleep-matters");
    const selected = visiblePerspectives[0];
    const details = getJourneyFollowUps(selected);

    expect(details.map((detail) => detail.angleTitle)).toEqual([
      "Sleep and Learning",
      "Progress Is Bigger Than Sleep",
    ]);
    expect(details.map((detail) => detail.angleTitle)).not.toContain(visiblePerspectives[1].angleTitle);
    expect(details.every((detail) => detail.parentAngleTitle === selected.angleTitle)).toBe(true);
    expect(details.every((detail) => detail.tileId === selected.tileId)).toBe(true);
  });

  it("returns no details for perspectives without authored follow-ups", () => {
    const selected = getJourneyNodes("shame-and-recovery", "what-shame-really-is")[0];
    expect(getJourneyFollowUps(selected)).toEqual([]);
  });
});

describe("pickNextTopicJourneyNode", () => {
  it("advances to the next sleep section when surprise-me starts from a section", () => {
    const first = getJourneyNodes("sleep-and-recovery", "why-sleep-matters")[0];
    const next = pickNextTopicJourneyNode("sleep-and-recovery", first.tileId);

    expect(next).toBeTruthy();
    expect(next.nodeId).not.toBe(first.nodeId);
    expect(next.tileId).not.toBe(first.tileId);
  });

  it("advances sequentially and wraps to the first perspective after the last", () => {
    const topicNodes = [
      ...getJourneyNodes("sleep-and-recovery", "why-sleep-matters"),
      ...getJourneyNodes("sleep-and-recovery", "sleep-and-nervous-system"),
      ...getJourneyNodes("sleep-and-recovery", "sleep-hygiene"),
      ...getJourneyNodes("sleep-and-recovery", "nighttime-anxiety"),
      ...getJourneyNodes("sleep-and-recovery", "sleep-and-cravings"),
      ...getJourneyNodes("sleep-and-recovery", "sleep-medications"),
      ...getJourneyNodes("sleep-and-recovery", "rest-as-practice"),
    ];
    const last = topicNodes.at(-1);
    const wrapped = pickNextTopicJourneyNode("sleep-and-recovery", last.tileId, last.nodeId);

    expect(wrapped.nodeId).toBe(topicNodes[0].nodeId);
  });

  it("returns null when a topic has no distinct perspective", () => {
    expect(pickNextTopicJourneyNode("missing-topic", "missing-tile")).toBeNull();
  });
});
