import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ToolsPageCinematic from "./ToolsPageCinematic";

const mocks = vi.hoisted(() => ({
  listMyDailyPractice: vi.fn(),
  markPractitionerSupportSeen: vi.fn(),
  submitPractitionerPracticeProgress: vi.fn(),
  getPublicPracticeAvailability: vi.fn(),
  user: { uid: "client-1", isAnonymous: false },
  authLoading: false,
}));

vi.mock("@/services/practitionerRegistry", () => mocks);
vi.mock("@/services/practiceAvailability", () => ({ getPublicPracticeAvailability: mocks.getPublicPracticeAvailability }));
vi.mock("@/services/telemetry", () => ({ trackPageView: vi.fn() }));
vi.mock("@/components/tools/CinematicContainer", () => ({ default: ({ children, className }) => <div className={className}>{children}</div> }));
vi.mock("@/components/system/RouteGuard", () => ({ default: ({ children }) => children }));
vi.mock("@/components/PractitionerSupportInbox", () => ({ default: () => <div data-testid="incoming-practice-inbox" /> }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, loading: mocks.authLoading }) }));
vi.mock("./toolsRegistry", () => ({ TOOLS: [
  { id: "breathing", name: "Breathing Practice", description: "Choose a comfortable rhythm.", category: "body-breath", duration: "1-10 min" },
  { id: "grounding", name: "Choose an Anchor", description: "A simple way to choose an anchor.", category: "body-breath", duration: "~5 min" },
  { id: "body-scan", name: "Steady Ground", description: "Choose a small movement or support.", category: "body-breath", duration: "~10 min" },
  { id: "acuwellness", name: "Acupressure-Inspired Self-Care", description: "Explore gentle self-touch as a comfort cue.", category: "body-breath", duration: "Optional" },
  { id: "journaling", name: "Journaling", description: "Choose an open page or focused reflection.", category: "mind-thoughts", duration: "~10 min" },
  { id: "self-surgeon", name: "Self-Inquiry", description: "Untangle one situation into facts and needs.", category: "mind-thoughts", duration: "~10 min" },
  { id: "education", name: "Education", description: "Read practical explainers at your own pace.", category: "mind-thoughts", duration: "~5 min" },
  { id: "affirmations", name: "Supportive Phrases", description: "Find editable words for a chosen concern.", category: "mind-thoughts", duration: "Optional" },
  { id: "urge-surfing", name: "Urge Support", description: "Choose a practical next move.", category: "stress-crisis", duration: "Optional 3 min" },
  { id: "meditation", name: "Visualization & Imagery", description: "Use optional imagery or quiet attention.", category: "sleep-winddown", duration: "5-20 min" },
  { id: "low-energy-plan", name: "One Small Step", description: "Plan one manageable task.", category: "everyday-support", duration: "2-10 min" },
] }));

function CurrentPath() {
  const location = useLocation();
  return <><output data-testid="current-path">{location.pathname}</output><output data-testid="current-state">{JSON.stringify(location.state || null)}</output></>;
}

function renderPage(entry = "/tools") {
  return render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="/tools" element={<><ToolsPageCinematic /><CurrentPath /></>} /><Route path="/tools/:toolId" element={<CurrentPath />} /><Route path="/login" element={<CurrentPath />} /></Routes></MemoryRouter>);
}

afterEach(() => cleanup());
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { uid: "client-1", isAnonymous: false };
  mocks.authLoading = false;
  mocks.listMyDailyPractice.mockResolvedValue({ items: [] });
  mocks.markPractitionerSupportSeen.mockResolvedValue({ ok: true });
  mocks.submitPractitionerPracticeProgress.mockResolvedValue({ ok: true });
  mocks.getPublicPracticeAvailability.mockResolvedValue({ toolsCatalog: true });
});

describe("Daily Practice library", () => {
  it("uses the dedicated appearance-aware workspace shell", () => {
    const { container } = renderPage();
    expect(container.querySelector(".wc-daily-practice")).toBeInTheDocument();
  });

  it("keeps practice choices closed by default and shows a simple empty personal shelf", async () => {
    renderPage();

    expect(await screen.findByText("Your practice space is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /explore practice collections/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /body & breath/i })).not.toBeInTheDocument();
    expect(mocks.listMyDailyPractice).toHaveBeenCalledOnce();
  });

  it("pauses only optional collections while keeping saved and practitioner-shared practices usable", async () => {
    mocks.getPublicPracticeAvailability.mockResolvedValue({ toolsCatalog: false });
    mocks.listMyDailyPractice.mockResolvedValue({ items: [{ id: "saved-1", toolId: "grounding", practitionerName: "Avery" }] });
    renderPage();

    expect(await screen.findByRole("heading", { name: "Choose an Anchor" })).toBeInTheDocument();
    expect(await screen.findByText(/Optional practice collections are paused/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open practice/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /explore practice collections/i })).not.toBeInTheDocument();
  });

  it("shows five meaningful practice categories with their own descriptions and real counts", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /explore practice collections/i }));

    expect(screen.getByRole("button", { name: /body & breath.*4 practices/i })).toBeInTheDocument();
    expect(screen.getByText(/breath, orientation, gentle movement, and self-care choices/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mind & reflection.*4 practices/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /urges & stress.*1 practice/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sleep & rest.*1 practice/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /everyday support.*1 practice/i })).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("opens one focused category at a time instead of dumping every practice into one list", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /explore practice collections/i }));

    const bodyGroup = screen.getByRole("button", { name: /body & breath.*4 practices/i });
    fireEvent.click(bodyGroup);
    expect(bodyGroup).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /^Breathing Practice/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Acupressure-Inspired Self-Care/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Journaling/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /urges & stress.*1 practice/i }));
    expect(screen.getByRole("button", { name: /^Urge Support/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Breathing Practice/ })).not.toBeInTheDocument();
  });

  it("routes a practice from its own category to its actual tool page", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /explore practice collections/i }));
    fireEvent.click(screen.getByRole("button", { name: /mind & reflection.*4 practices/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Journaling/ }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/tools/journaling");
  });

  it("shows saved practitioner practices first and lets the client remove one", async () => {
    mocks.listMyDailyPractice.mockResolvedValue({ items: [{ id: "saved-1", toolId: "grounding", practitionerName: "Avery", message: "Try this if it feels useful.", savedAt: "2026-09-25T10:00:00.000Z" }] });
    renderPage();

    expect(await screen.findByRole("heading", { name: "Choose an Anchor" })).toBeInTheDocument();
    expect(screen.getByText(/shared by Avery/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    await waitFor(() => expect(mocks.markPractitionerSupportSeen).toHaveBeenCalledWith("saved-1", "removed"));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Choose an Anchor" })).not.toBeInTheDocument());
  });

  it("lands on and spotlights the practice accepted from the practitioner inbox", async () => {
    mocks.listMyDailyPractice.mockResolvedValue({ items: [
      { id: "saved-other", toolId: "journaling", practitionerName: "Jordan" },
      { id: "support-accepted", toolId: "grounding", practitionerName: "Avery", message: "Try this if it feels useful." },
    ] });
    renderPage({ pathname: "/tools", state: { newlyAddedPracticeId: "support-accepted" } });

    expect(await screen.findByText("Added to your Daily Practice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose an Anchor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open this practice/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("current-state")).toHaveTextContent("null"));

    fireEvent.click(screen.getByRole("button", { name: /open this practice/i }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/tools/grounding");
  });

  it("explains a delayed saved-practice result and lets the client refresh", async () => {
    mocks.listMyDailyPractice
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ items: [{ id: "support-late", toolId: "grounding", practitionerName: "Avery" }] });
    renderPage({ pathname: "/tools", state: { newlyAddedPracticeId: "support-late" } });

    expect(await screen.findByRole("alert")).toHaveTextContent("has not appeared in your saved list yet");
    fireEvent.click(screen.getByRole("button", { name: /refresh practices/i }));

    expect(await screen.findByText("Added to your Daily Practice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open this practice/i })).toBeInTheDocument();
  });

  it("hides the previous account shelf immediately and ignores its late response", async () => {
    let finishFirstRequest;
    mocks.listMyDailyPractice
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirstRequest = resolve; }))
      .mockResolvedValueOnce({ items: [{ id: "client-2-item", toolId: "journaling", practitionerName: "Jordan" }] });
    const view = renderPage();
    await waitFor(() => expect(finishFirstRequest).toBeTypeOf("function"));

    mocks.user = { uid: "client-2", isAnonymous: false };
    view.rerender(<MemoryRouter initialEntries={["/tools"]}><Routes><Route path="/tools" element={<><ToolsPageCinematic /><CurrentPath /></>} /><Route path="/tools/:toolId" element={<CurrentPath />} /><Route path="/login" element={<CurrentPath />} /></Routes></MemoryRouter>);

    expect(screen.queryByText(/shared by Avery/i)).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Journaling" })).toBeInTheDocument();
    finishFirstRequest({ items: [{ id: "client-1-item", toolId: "grounding", practitionerName: "Avery" }] });
    await waitFor(() => expect(screen.queryByText(/shared by Avery/i)).not.toBeInTheDocument());
    expect(screen.getByText(/shared by Jordan/i)).toBeInTheDocument();
  });

  it("sends a client-authored weekly update only after an explicit submit", async () => {
    mocks.listMyDailyPractice.mockResolvedValue({ items: [{ id: "saved-followup", toolId: "grounding", practitionerName: "Avery", followUpDays: 7, followUpDueAt: "2026-10-02T10:00:00.000Z" }] });
    renderPage();

    expect(await screen.findByText(/A check-in was invited for after a week/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /share a progress update/i }));
    fireEvent.click(screen.getByLabelText("It wasn’t a fit"));
    fireEvent.change(screen.getByLabelText(/anything you want them to know/i), { target: { value: "Could we try a shorter one?" } });
    fireEvent.click(screen.getByRole("button", { name: /send update/i }));

    await waitFor(() => expect(mocks.submitPractitionerPracticeProgress).toHaveBeenCalledWith("saved-followup", "not-a-fit", "Could we try a shorter one?"));
    expect(await screen.findByText(/Your update was sent to Avery/)).toBeInTheDocument();
  });

  it("keeps category details nearby and expands only the selected category contents", async () => {
    renderPage();
    const browse = screen.getByRole("button", { name: /explore practice collections/i });
    fireEvent.click(browse);

    expect(browse).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/write, understand a situation, learn, or find words that feel true/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /body & breath.*4 practices/i }));
    expect(screen.getByRole("button", { name: /^Choose an Anchor/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Choose an Anchor/ }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/tools/grounding");
  });
});
