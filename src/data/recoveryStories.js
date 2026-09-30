export const RECOVERY_STORY_SOURCES = {
  ap: {
    label: "Associated Press · 2024",
    url: "https://apnews.com/article/supporting-actor-2024-oscars-5320c80b0206acddf8cc0698ad70a4b7",
  },
  vanityFair: {
    label: "Vanity Fair · 2014 interview",
    url: "https://www.vanityfair.com/hollywood/2014/09/robert-downey-jr-cover",
  },
  christianScienceMonitor: {
    label: "The Christian Science Monitor · 2003 interview",
    url: "https://www.csmonitor.com/2003/1024/p17s02-almo.html",
  },
  pbsJamieLeeCurtis: {
    label: "PBS · 2019 interview",
    url: "https://www.pbs.org/wnet/amanpour-and-company/video/actress-jamie-lee-curtis-on-her-career-2/",
  },
  newYorkerJamieLeeCurtis: {
    label: "The New Yorker · 2019 interview",
    url: "https://www.newyorker.com/culture/the-new-yorker-interview/jamie-lee-curtis-has-never-worked-hard-a-day-in-her-life",
  },
  eltonFreshAir: {
    label: "NPR Fresh Air · 2013 interview",
    url: "https://freshairarchive.org/segments/elton-john-fresh-air-interview",
  },
  apEltonJohn: {
    label: "Associated Press · 2024 interview",
    url: "https://apnews.com/article/4028b453dc2e50558e7ca4c10756d1c8",
  },
  laTimesEltonJohn: {
    label: "Los Angeles Times · 1992 interview",
    url: "https://www.latimes.com/archives/la-xpm-1992-08-23-ca-7209-story.html",
  },
  eltonJohnFoundation: {
    label: "Elton John AIDS Foundation · History",
    url: "https://www.eltonjohnaidsfoundation.org/about-us/our-history/",
  },
};

export const RECOVERY_STORIES = [
  {
    id: "robert-downey-jr",
    sourcesCheckedOn: "2026-09-26",
    name: "Robert Downey Jr.",
    descriptor: "A public story of setbacks, support, and rebuilding",
    summary: "His public account spans years, not a single turning point. Here we separate what reporting says from ideas you might choose to adapt.",
    chapters: [
      {
        title: "A long and difficult chapter",
        publicAccount: "News reporting and interviews describe years of substance-use struggles, repeated setbacks, legal consequences, and treatment. Public reporting is only a partial view of a person's life.",
        reflection: "A difficult chapter does not have to become the whole story of who you are.",
        sources: ["ap", "christianScienceMonitor", "vanityFair"],
      },
      {
        title: "Change took time",
        publicAccount: "A 2003 interview was published as Downey returned to film work after prison. In that interview, he described change as a process and said recovery had not been simple.",
        reflection: "A next step can be small. Progress does not need to look dramatic to count.",
        sources: ["christianScienceMonitor"],
      },
      {
        title: "Support was part of the story he shared",
        publicAccount: "At the 2024 Oscars, Downey publicly thanked his wife for her support. That is one thing he chose to share; it does not tell us his complete private care plan.",
        reflection: "You get to decide who belongs in your support circle, and what kind of help feels right for you.",
        sources: ["ap"],
      },
    ],
  },
  {
    id: "jamie-lee-curtis",
    sourcesCheckedOn: "2026-09-26",
    name: "Jamie Lee Curtis",
    descriptor: "A public story of asking for help and finding peer connection",
    summary: "Curtis has spoken publicly about becoming sober in 1999, reaching out to friends, and finding support in recovery meetings. Her account is personal; it is not a blueprint that everyone should follow.",
    chapters: [
      {
        title: "She recognized she needed help",
        publicAccount: "In a 2019 PBS interview, Curtis described looking in the mirror, recognizing a problem, and reaching out to friends before finding recovery support.",
        reflection: "Noticing that something needs to change can be a meaningful step, even before you know the whole path.",
        sources: ["pbsJamieLeeCurtis"],
      },
      {
        title: "Peer connection mattered to her",
        publicAccount: "Curtis has described finding recovery in meetings. In a 2019 interview, she also reflected on the fear and vulnerability she experienced when getting sober.",
        reflection: "You can explore support at your own pace and decide which people or settings feel safe enough to try.",
        sources: ["pbsJamieLeeCurtis", "newYorkerJamieLeeCurtis"],
      },
      {
        title: "She kept choosing recovery over time",
        publicAccount: "In 2019, Curtis said she was approaching 20 years sober. That is her own milestone and does not set a timeline for anyone else.",
        reflection: "Your progress is yours. A hard day or a different timeline does not erase the effort you have made.",
        sources: ["pbsJamieLeeCurtis", "newYorkerJamieLeeCurtis"],
      },
    ],
  },
  {
    id: "elton-john",
    sourcesCheckedOn: "2026-09-26",
    name: "Elton John",
    descriptor: "A public story of treatment, recovery, and changing priorities",
    summary: "John has spoken about seeking treatment, becoming sober in 1990, and later finding greater connection and purpose. Public interviews leave out much of any person's private care and support.",
    chapters: [
      {
        title: "He sought treatment",
        publicAccount: "In a 1992 interview, John discussed treatment and attending recovery meetings. A later NPR interview records him reflecting on becoming sober in 1990.",
        reflection: "Professional care and peer support are options people can explore with qualified help; a public story cannot tell you which care is right for you.",
        sources: ["laTimesEltonJohn", "eltonFreshAir", "apEltonJohn"],
      },
      {
        title: "He described change as a longer process",
        publicAccount: "John has described his life and priorities changing after sobriety. In 2024, he spoke about the difference between outward success and feeling connected.",
        reflection: "Recovery can include rebuilding parts of life that matter to you. You get to define what a meaningful life looks like.",
        sources: ["apEltonJohn", "eltonFreshAir"],
      },
      {
        title: "Purpose became part of his public life",
        publicAccount: "John established the Elton John AIDS Foundation in 1992. This is a public milestone in his life, not evidence that service or philanthropy is a treatment method.",
        reflection: "If purpose or helping others matters to you, it can be one part of your life—not a requirement for recovery.",
        sources: ["eltonJohnFoundation"],
      },
    ],
  },
];

export const RECOVERY_STORY_NEXT_STEPS = [
  { id: "trusted-person", label: "Reach out to someone I trust", detail: "Start with one person and one simple ask.", path: "/guide", action: "Find a few words" },
  { id: "peer-support", label: "Find peer support", detail: "Explore recovery meetings, online or nearby.", path: "/recovery/meetings", action: "Browse meetings" },
  { id: "professional", label: "Explore professional support", detail: "Look for a practitioner whose approach fits you.", path: "/providers", action: "Browse practitioners" },
  { id: "daily-rhythm", label: "Choose one steadying practice", detail: "Pick something that fits your day and energy.", path: "/tools", action: "Open Daily Practice" },
  { id: "practical", label: "Start with a practical need", detail: "Food, housing, transport, and local support count too.", path: "/assistance", action: "Find practical support" },
];

export function buildRecoveryInspiredPlan({ story, direction, firstMove = "", timing = "When I’m ready" }) {
  if (!story || !direction) return null;
  const personalizedMove = String(firstMove).trim().slice(0, 240);
  return {
    storyName: story.name,
    directionLabel: direction.label,
    directionDetail: direction.detail,
    directionPath: direction.path,
    directionAction: direction.action,
    firstMove: personalizedMove || direction.detail,
    timing,
  };
}

export function formatRecoveryInspiredPlan(plan) {
  if (!plan) return "";
  return [
    "MY WELLNESSCAFE NEXT STEP",
    "",
    `Inspired by: ${plan.storyName}’s public account`,
    `Support I chose: ${plan.directionLabel}`,
    `My first move: ${plan.firstMove}`,
    `Timing I chose: ${plan.timing}`,
    "",
    "This is my own, optional next step—not a treatment plan or a copy of another person’s recovery.",
    "This file was created only because I chose to download it. My choices were not sent to a practitioner.",
  ].join("\n");
}

export function matchRecoveryStoryRequest(value) {
  const text = String(value || "").toLowerCase();
  const asksForStory = /(recovery story|recovery journey|model.{0,50}(recovery|path|journey)|learn.{0,35}(recovery|journey|sober|clean)|how.{0,25}(recover|got sober|got clean)|follow.{0,30}(recovery|path))/i.test(text);
  if (!asksForStory) return null;

  const personId = /(robert\s+downey|\brdj\b)/i.test(text)
    ? "robert-downey-jr"
    : /jamie\s+lee\s+curtis/i.test(text)
      ? "jamie-lee-curtis"
      : /elton\s+john/i.test(text)
        ? "elton-john"
        : null;
  return { personId };
}
