import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmailAuthProvider, linkWithCredential, sendEmailVerification } from "firebase/auth";
import { ArrowLeft, Headphones, HeartHandshake, MapPin, PackageCheck, ShieldCheck, Volume2 } from "lucide-react";
import { auth } from "@/firebase";
import {
  applyToCommunityGiving,
  closeCommunityNeed,
  createCommunityNeed,
  createCommunitySupportOffer,
  getMyCommunityGivingStatus,
  listMyCommunityNeeds,
  listMyCommunityOffers,
  listOpenCommunityNeeds,
  respondToCommunityOffer,
  finishCommunityNeed,
  shareCommunityDeliveryDetails,
} from "@/services/communitySupportService";

const STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"], ["DC", "District of Columbia"],
];
const ZONES = [["metro", "Metro area"], ["north", "North"], ["south", "South"], ["east", "East"], ["west", "West"], ["central", "Central"], ["rural", "Rural area"], ["unsure", "I'm not sure"]];
const NEEDS = [
  { id: "transport", label: "Bus fare or pass", amounts: ["One trip", "One week", "Two weeks", "One month"] },
  { id: "food", label: "Food or groceries", amounts: ["One grocery bag", "One week of groceries", "One grocery delivery"] },
  { id: "milk", label: "Milk or everyday essentials", amounts: ["One item", "A few items", "One week of essentials"] },
  { id: "medication-cost", label: "Medication costs", amounts: ["One-time help", "One month of help"] },
  { id: "temporary-stay", label: "A safe place to stay", amounts: ["One night", "One week", "Two weeks"] },
  { id: "housing-start", label: "Starting sober or stable housing", amounts: ["Application fee", "Move-in essentials", "Deposit help"] },
  { id: "clothing", label: "Clothing or basic supplies", amounts: ["One outfit", "Shoes", "Basic supplies"] },
  { id: "wellness-session", label: "A wellness session", amounts: ["One yoga session", "One massage or bodywork session", "One coaching session"] },
  { id: "other-essential", label: "Another basic need", amounts: ["One-time help", "One week of help", "Two weeks of help"] },
];
const QUICK_NEEDS = [
  { id: "transport", label: "Bus pass", hint: "A trip or a few weeks" },
  { id: "food", label: "Food", hint: "Groceries or a meal" },
  { id: "temporary-stay", label: "Safe place", hint: "Somewhere to stay" },
  { id: "medication-cost", label: "Medication", hint: "Help with medicine" },
];
const GIVER_TYPES = [
  ["individual", "Individual giver"], ["organization", "Organization"], ["recovery-coach", "Recovery coach"], ["therapist", "Therapist or counselor"], ["bodywork", "Massage or bodywork"], ["yoga", "Yoga instructor"],
];
const FULFILLMENT = [["digital", "Digital pass or gift card"], ["public-pickup", "Meet at a public place"], ["delivery", "Deliver it"], ["flexible", "Whatever works"]];

const fieldClass = "min-h-14 w-full rounded-xl border-2 border-white/20 bg-[#0B1210] px-4 text-lg text-[#F4F7F5] [color-scheme:dark] focus:border-[#B5E2C9] focus:outline-none focus:ring-4 focus:ring-[#B5E2C9]/20";
const buttonClass = "min-h-14 rounded-xl bg-[#B5E2C9] px-5 text-lg font-semibold text-[#08140F] transition hover:bg-[#D5F2E1] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]";

function displayNeed(need) {
  return NEEDS.find((item) => item.id === need.type)?.label || "Everyday support";
}

function SelectField({ label, value, onChange, options, placeholder = "Choose one" }) {
  return (
    <label className="block space-y-2">
      <span className="block text-base font-semibold text-[#E5EEE8]">{label}</span>
      <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function HearButton({ onClick, speaking }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={speaking} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#B5E2C9]/50 px-4 text-base font-semibold text-[#B5E2C9] hover:bg-[#173428] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]">
      <Volume2 aria-hidden="true" className="h-5 w-5" /> {speaking ? "Stop audio" : "Hear these choices"}
    </button>
  );
}

function NeedCard({ need, onRefresh }) {
  const [busy, setBusy] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [finishChoice, setFinishChoice] = useState("");
  const matched = need.status === "matched";

  const chooseOffer = async (supporterUid, decision) => {
    setBusy(supporterUid);
    setMessage("");
    try {
      await respondToCommunityOffer(need.id, supporterUid, decision);
      setMessage(decision === "accept" ? "Giver accepted. You can decide whether to share delivery details." : "Offer declined.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message || "Could not update this offer. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const shareDetails = async (event) => {
    event.preventDefault();
    setBusy("share");
    setMessage("");
    try {
      await shareCommunityDeliveryDetails(need.id, address, phone);
      setMessage("Shared with your matched giver. Your address was not on the public listing.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message || "Could not share those details. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const closeRequest = async () => {
    setBusy("close");
    setMessage("");
    try {
      await closeCommunityNeed(need.id);
      setMessage("Your request is closed. Givers can no longer see it.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message || "Could not close this request. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const finishRequest = async () => {
    if (!finishChoice) return;
    setBusy("finish");
    setMessage("");
    try {
      await finishCommunityNeed(need.id, finishChoice);
      setMessage(finishChoice === "fulfilled"
        ? "Marked as received. The request is closed and shared delivery details are no longer available to the giver."
        : "The request is closed. Shared delivery details are no longer available to the giver.");
      setFinishChoice("");
      await onRefresh();
    } catch (error) {
      setMessage(error.message || "Could not close this matched request. Please try again.");
    } finally {
      setBusy("");
    }
  };

  return (
    <article className="rounded-2xl border-2 border-white/10 bg-[#121B19] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-[#F4F7F5]">{displayNeed(need)}</h3>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-semibold text-[#DCEFE4]">
          {{ open: "Open", matched: "Matched", fulfilled: "Help received", closed: "Closed" }[need.status] || "Request"}
        </span>
      </div>
      <p className="mt-1 text-lg text-[#C8D3CC]">{need.amount} · {need.state} · {ZONES.find(([id]) => id === need.zone)?.[1] || "Area not listed"}</p>
      <p className="mt-2 text-base text-[#A8B8AF]">{need.fulfillment === "delivery" ? "Delivery preferred" : need.fulfillment === "public-pickup" ? "Public pickup preferred" : need.fulfillment === "digital" ? "Digital gift preferred" : "Flexible delivery"}</p>
      {need.status === "open" && need.offers?.length > 0 && (
        <section className="mt-5 border-t border-white/10 pt-4">
          <h4 className="text-lg font-bold text-[#F4F7F5]">People who offered to help</h4>
          <ul className="mt-3 space-y-3">
            {need.offers.map((offer) => (
              <li key={offer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#173428] p-4">
                <span className="text-base font-medium text-[#E5EEE8]">{offer.displayName}{offer.organization ? ` · ${offer.organization}` : ""}</span>
                <span className="flex gap-2">
                  <button type="button" disabled={!!busy} onClick={() => chooseOffer(offer.supporterUid, "accept")} className="min-h-12 rounded-lg bg-[#B5E2C9] px-4 text-base font-semibold text-[#08140F] disabled:opacity-50">Accept</button>
                  <button type="button" disabled={!!busy} onClick={() => chooseOffer(offer.supporterUid, "decline")} className="min-h-12 rounded-lg border-2 border-white/20 px-4 text-base font-semibold text-[#C8D3CC] disabled:opacity-50">No thanks</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {matched && !need.detailsShared && (
        <form onSubmit={shareDetails} className="mt-5 space-y-3 rounded-xl bg-[#3A2C17] p-4">
          <h4 className="text-lg font-bold text-[#F4F7F5]">Your request has a match</h4>
          <p className="text-base leading-relaxed text-[#C8D3CC]">Only share contact or delivery details if you want this giver to receive them.</p>
          <label className="block space-y-1 text-base font-semibold text-[#E5EEE8]">Delivery address <span className="font-normal">(optional)</span>
            <input value={address} onChange={(event) => setAddress(event.target.value.slice(0, 250))} autoComplete="street-address" className={fieldClass} placeholder="Street address" />
          </label>
          <label className="block space-y-1 text-base font-semibold text-[#E5EEE8]">Phone number <span className="font-normal">(optional)</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value.slice(0, 40))} autoComplete="tel" className={fieldClass} placeholder="Phone number" />
          </label>
          <button className={buttonClass} disabled={!!busy || (!address.trim() && !phone.trim())}>{busy === "share" ? "Sharing…" : "Share with my matched giver"}</button>
        </form>
      )}
      {matched && need.acceptedSupporter && <div className="mt-4 rounded-xl bg-[#173428] p-4"><p className="text-base font-bold text-[#F4F7F5]">Matched giver: {need.acceptedSupporter.displayName}{need.acceptedSupporter.organization ? ` · ${need.acceptedSupporter.organization}` : ""}</p>{need.acceptedSupporter.contactEmail && <a className="mt-1 inline-block min-h-11 py-2 text-base font-semibold text-[#B5E2C9] underline underline-offset-2" href={`mailto:${encodeURIComponent(need.acceptedSupporter.contactEmail)}`}>Email your giver</a>}</div>}
      {need.detailsShared && <p className="mt-4 text-base font-semibold text-[#B5E2C9]">Details shared with your matched giver.</p>}
      {need.status === "open" && <button type="button" disabled={!!busy} onClick={closeRequest} className="mt-4 min-h-12 rounded-xl border-2 border-white/20 px-4 text-base font-semibold text-[#E5EEE8] disabled:opacity-50">{busy === "close" ? "Closing…" : "Close this request"}</button>}
      {matched && !finishChoice && <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-base leading-relaxed text-[#C8D3CC]">When the arrangement is over, close this request to remove the giver’s access to any delivery details you shared.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={!!busy} onClick={() => setFinishChoice("fulfilled")} className="min-h-12 rounded-xl bg-[#B5E2C9] px-4 text-base font-semibold text-[#08140F] disabled:opacity-50">I received the help</button>
          <button type="button" disabled={!!busy} onClick={() => setFinishChoice("cancelled")} className="min-h-12 rounded-xl border-2 border-white/20 px-4 text-base font-semibold text-[#E5EEE8] disabled:opacity-50">Cancel this match</button>
        </div>
      </div>}
      {matched && finishChoice && <div className="mt-5 rounded-xl border border-amber-200/25 bg-[#3A2C17] p-4">
        <p className="text-base font-semibold text-[#F4F7F5]">Close this request and remove the giver’s access to any shared delivery details?</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={!!busy} onClick={finishRequest} className="min-h-12 rounded-xl bg-[#B5E2C9] px-4 text-base font-semibold text-[#08140F] disabled:opacity-50">{busy === "finish" ? "Closing…" : "Yes, close request"}</button>
          <button type="button" disabled={!!busy} onClick={() => setFinishChoice("")} className="min-h-12 rounded-xl border-2 border-white/20 px-4 text-base font-semibold text-[#E5EEE8] disabled:opacity-50">Keep it open</button>
        </div>
      </div>}
      {message && <p role="status" className="mt-3 text-base font-semibold text-[#B5E2C9]">{message}</p>}
    </article>
  );
}

export default function CommunityGivingPage({ initialMode = "need" }) {
  const [mode, setMode] = useState(initialMode === "give" ? "give" : "need");
  const [needStep, setNeedStep] = useState(1);
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [state, setState] = useState("");
  const [zone, setZone] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [publishNeed, setPublishNeed] = useState(false);
  const [myNeeds, setMyNeeds] = useState([]);
  const [giverStatus, setGiverStatus] = useState("loading");
  const [openNeeds, setOpenNeeds] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [filterState, setFilterState] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterType, setFilterType] = useState("");
  const [application, setApplication] = useState({ displayName: "", organization: "", type: "", state: "", zone: "", categories: [] });
  const [giverEmail, setGiverEmail] = useState("");
  const [giverPassword, setGiverPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const refreshMyNeeds = async () => {
    const result = await listMyCommunityNeeds();
    setMyNeeds(result.needs || []);
  };

  const refreshGiverView = async () => {
    const statusResult = await getMyCommunityGivingStatus();
    setGiverStatus(statusResult.status || "not_applied");
    if (statusResult.status === "active") {
      const offerResult = await listMyCommunityOffers();
      setMyOffers(offerResult.offers || []);
    }
  };

  useEffect(() => {
    if (mode === "need") refreshMyNeeds().catch((err) => setError(err.message || "Your requests could not load."));
    if (mode === "give") refreshGiverView().catch((err) => setError(err.message || "Community giving could not load."));
  }, [mode]);

  useEffect(() => {
    if (mode !== "give" || giverStatus !== "active") return;
    listOpenCommunityNeeds({ state: filterState, zone: filterZone, type: filterType })
      .then((result) => setOpenNeeds(result.needs || []))
      .catch((err) => setError(err.message || "Requests could not load."));
  }, [mode, giverStatus, filterState, filterZone, filterType]);

  const sayOptions = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Read aloud is not available in this browser. You can still choose from the large options on screen.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const selectedNeed = NEEDS.find((item) => item.id === type);
    const selectedState = STATES.find(([code]) => code === state)?.[1];
    const selectedZone = ZONES.find(([id]) => id === zone)?.[1];
    const selectedFulfillment = FULFILLMENT.find(([id]) => id === fulfillment)?.[1];
    let text;
    if (mode === "need") {
      if (needStep === 1) text = "Step one of five. Choose bus fare, food, a safe place to stay, medication help, or open the other needs list.";
      else if (needStep === 2) text = `Step two of five. ${selectedNeed?.label || "Your need"}. How much or how long? Choose one: ${selectedNeed?.amounts.join(", ") || "choose a need first"}.`;
      else if (needStep === 3) text = `Step three of five. Choose your state, then choose a broad area: ${ZONES.map(([, label]) => label).join(", ")}.`;
      else if (needStep === 4) text = `Step four of five. How could the gift reach you? Choose one: ${FULFILLMENT.map(([, label]) => label).join(", ")}.`;
      else if (!publishNeed) text = `Step five of five. Review: ${selectedNeed?.label}, ${amount}, ${selectedZone}, ${selectedState}, ${selectedFulfillment}. Your name and exact address will not appear. Check the box to show this need anonymously, then choose Post my need.`;
      else text = `Step five of five. Your need will be shown without your name or exact address. Choose Post my need. You can close it later if nobody has accepted it.`;
    } else if (giverStatus !== "active") {
      text = "This part is for people who want to give. Giver accounts are reviewed before seeing requests. A verified email account is needed. Your application is not visible to people asking for help.";
    } else {
      const filters = [filterType && NEEDS.find((item) => item.id === filterType)?.label, filterState && STATES.find(([code]) => code === filterState)?.[1], filterZone && ZONES.find(([id]) => id === filterZone)?.[1]].filter(Boolean);
      text = `You can browse anonymous needs and choose I can provide this on a request you can meet. ${filters.length ? `Current filters: ${filters.join(", ")}.` : "No filters are set."} ${openNeeds.length} requests are shown.`;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const submitNeed = async (event) => {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      await createCommunityNeed({ type, item: NEEDS.find((item) => item.id === type)?.label, amount, state, zone, fulfillment, publish: publishNeed });
      setType(""); setAmount(""); setState(""); setZone(""); setFulfillment("");
      setNeedStep(1);
      setPublishNeed(false);
      setNotice("Your need is on the community board. It is shown without your name or address.");
      await refreshMyNeeds();
    } catch (err) {
      setError(err.message || "Your request could not be added. Please try again.");
    } finally { setBusy(false); }
  };

  const applyToGive = async (event) => {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      let user = auth.currentUser;
      if (!user) throw new Error("Sign in before applying to give.");
      if (user.isAnonymous) {
        if (!giverEmail.trim() || giverPassword.length < 6) {
          throw new Error("Enter your email and a password with at least 6 characters to create a giver account.");
        }
        const credential = EmailAuthProvider.credential(giverEmail.trim(), giverPassword);
        user = (await linkWithCredential(user, credential)).user;
        await sendEmailVerification(user);
        setVerificationSent(true);
        setNotice("We sent a verification email. Your guest account and requests are kept. Open that email, verify your address, then come back and tap “I’ve verified my email”.");
        return;
      }
      if (!user.emailVerified && verificationSent) {
        await user.reload();
        await user.getIdToken(true);
      }
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        setVerificationSent(true);
        setNotice("We sent a verification email. Open it, verify your address, then come back and tap “I’ve verified my email”.");
        return;
      }
      const result = await applyToCommunityGiving(application);
      setGiverStatus(result.status === "approved" ? "active" : result.status || "pending");
      setNotice(result.status === "approved" ? "Your giver account is ready." : "Application received. We will review your giver account before showing requests.");
    } catch (err) {
      const code = err.code || "";
      setError(code === "auth/email-already-in-use"
        ? "That email already has an account. Your guest requests are still attached to this device. Sign out and use the existing account to give."
        : err.message || "Your application could not be sent.");
    } finally { setBusy(false); }
  };

  const sendOffer = async (needId) => {
    setBusy(true); setError(""); setNotice("");
    try {
      await createCommunitySupportOffer(needId);
      setNotice("Offer sent. The person requesting support decides whether to accept.");
      await refreshGiverView();
    } catch (err) { setError(err.message || "Your offer could not be sent."); }
    finally { setBusy(false); }
  };

  const toggleCategory = (categoryId) => {
    setApplication((previous) => ({
      ...previous,
      categories: previous.categories.includes(categoryId)
        ? previous.categories.filter((item) => item !== categoryId)
        : [...previous.categories, categoryId],
    }));
  };

  const selectedNeed = NEEDS.find((item) => item.id === type);
  const selectedState = STATES.find(([code]) => code === state)?.[1] || state;
  const selectedZone = ZONES.find(([id]) => id === zone)?.[1] || zone;
  const selectedFulfillment = FULFILLMENT.find(([id]) => id === fulfillment)?.[1] || fulfillment;

  return (
    <main className="min-h-full bg-[#0A1110] px-4 py-6 text-[#F4F7F5] sm:px-8 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <Link to="/assistance" className="mb-3 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#B5E2C9] underline underline-offset-2"><ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back to Find Help</Link>
            <p className="text-sm font-bold uppercase tracking-wide text-[#9CCFB1]">Community support</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Real help, from real people</h1>
          </div>
          <HearButton onClick={sayOptions} speaking={speaking} />
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3" role="tablist" aria-label="Community support options">
          <button type="button" role="tab" aria-selected={mode === "need"} onClick={() => { setMode("need"); setError(""); }} className={`min-h-16 rounded-2xl border-2 px-4 text-lg font-bold sm:text-xl ${mode === "need" ? "border-[#B5E2C9]/50 bg-[#B5E2C9] text-[#08140F]" : "border-white/15 bg-[#121B19] text-[#DCEFE4]"}`}><HeartHandshake aria-hidden="true" className="mr-2 inline h-6 w-6" /> I need help</button>
          <button type="button" role="tab" aria-selected={mode === "give"} onClick={() => { setMode("give"); setError(""); }} className={`min-h-16 rounded-2xl border-2 px-4 text-lg font-bold sm:text-xl ${mode === "give" ? "border-[#B5E2C9]/50 bg-[#B5E2C9] text-[#08140F]" : "border-white/15 bg-[#121B19] text-[#DCEFE4]"}`}><PackageCheck aria-hidden="true" className="mr-2 inline h-6 w-6" /> I can give</button>
        </div>

        {error && <p className="mb-4 rounded-xl border-2 border-rose-300/40 bg-[#3B1F25] p-4 text-lg font-semibold text-rose-200" role="alert">{error}</p>}
        {notice && <p className="mb-4 rounded-xl border-2 border-emerald-200/20 bg-[#173428] p-4 text-lg font-semibold text-[#DCEFE4]" role="status">{notice}</p>}

        {mode === "need" ? (
          <div className="space-y-6">
            <form onSubmit={submitNeed} className="space-y-5 rounded-2xl border-2 border-white/10 bg-[#121B19] p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#204735] text-[#B5E2C9]"><HeartHandshake aria-hidden="true" className="h-7 w-7" /></div>
                <div><p className="text-sm font-semibold text-[#9CCFB1]">Step {needStep} of 5</p><h2 className="text-2xl font-bold">{["What do you need?", "How much or how long?", "Where are you?", "How can we get it to you?", "Check before posting"][needStep - 1]}</h2></div>
              </div>
              {needStep === 1 && <div className="space-y-4">
                <p className="text-lg text-[#C8D3CC]">Choose what would help most right now.</p>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_NEEDS.map((need) => (
                    <button key={need.id} type="button" onClick={() => { setType(need.id); setAmount(""); setNeedStep(2); }} className="min-h-24 rounded-2xl border-2 border-white/15 bg-[#0B1210] p-4 text-left transition hover:border-[#B5E2C9]/60 hover:bg-[#173428] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]">
                      <span className="block text-xl font-bold text-[#F4F7F5]">{need.label}</span>
                      <span className="mt-1 block text-base text-[#A8B8AF]">{need.hint}</span>
                    </button>
                  ))}
                </div>
                <details className="rounded-xl border border-white/10 bg-[#0B1210] p-4">
                  <summary className="min-h-11 cursor-pointer py-2 text-lg font-semibold text-[#B5E2C9]">I need a different kind of help</summary>
                  <div className="mt-3"><SelectField label="Choose a need" value={type} onChange={(value) => { setType(value); setAmount(""); }} options={NEEDS.filter((need) => !QUICK_NEEDS.some((quick) => quick.id === need.id)).map(({ id, label }) => [id, label])} /></div>
                </details>
              </div>}
              {needStep === 2 && selectedNeed && <SelectField label={selectedNeed.label} value={amount} onChange={setAmount} options={selectedNeed.amounts.map((item) => [item, item])} />}
              {needStep === 3 && <div className="grid gap-4 sm:grid-cols-2"><SelectField label="State" value={state} onChange={setState} options={STATES} /><SelectField label="Broad area" value={zone} onChange={setZone} options={ZONES} /></div>}
              {needStep === 4 && <SelectField label="Choose one" value={fulfillment} onChange={setFulfillment} options={FULFILLMENT} />}
              {needStep === 5 && <div className="space-y-4"><div className="rounded-xl bg-[#173428] p-4"><p className="text-lg font-bold text-[#DCEFE4]">{selectedNeed?.label} · {amount}</p><p className="mt-1 text-base text-[#DCEFE4]">{selectedZone}, {selectedState} · {selectedFulfillment}</p><p className="mt-3 flex items-start gap-3 text-base leading-relaxed text-[#DCEFE4]"><ShieldCheck aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0" />Your name and exact address are hidden. You choose later if you want to share delivery details with an accepted giver.</p></div><label className="flex min-h-14 items-start gap-3 rounded-xl border-2 border-emerald-200/20 bg-[#173428] p-4 text-base font-semibold leading-relaxed text-[#DCEFE4]"><input type="checkbox" checked={publishNeed} onChange={(event) => setPublishNeed(event.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#B5E2C9]" />Show this need and my broad area anonymously to approved givers.</label></div>}
              <div className="flex flex-wrap gap-3">
                {needStep > 1 && <button type="button" onClick={() => setNeedStep((step) => step - 1)} className="min-h-14 rounded-xl border-2 border-white/20 px-5 text-lg font-semibold text-[#E5EEE8]">Back</button>}
                {needStep < 5 ? <button type="button" onClick={() => setNeedStep((step) => step + 1)} disabled={busy || (needStep === 1 && !type) || (needStep === 2 && !amount) || (needStep === 3 && (!state || !zone)) || (needStep === 4 && !fulfillment)} className={buttonClass}>Next</button> : <button type="submit" disabled={busy || !publishNeed} className={`${buttonClass} w-full sm:w-auto`}>{busy ? "Posting…" : "Post my need"}</button>}
              </div>
            </form>

            <section className="space-y-3" aria-labelledby="my-needs-heading">
              <h2 id="my-needs-heading" className="text-2xl font-bold">My requests</h2>
              {myNeeds.length ? myNeeds.map((need) => <NeedCard key={need.id} need={need} onRefresh={refreshMyNeeds} />) : <p className="rounded-xl bg-[#121B19] p-5 text-lg text-[#C8D3CC]">Requests you add will appear here.</p>}
            </section>
          </div>
        ) : (
          <div className="space-y-5">
            {giverStatus === "loading" && <p className="rounded-xl bg-[#121B19] p-5 text-lg">Loading giver access…</p>}
            {giverStatus === "not_applied" && <form onSubmit={applyToGive} className="space-y-5 rounded-2xl border-2 border-white/10 bg-[#121B19] p-5 sm:p-7">
              <h2 className="text-2xl font-bold">Join as a giver</h2>
              <p className="text-lg leading-relaxed text-[#C8D3CC]">Givers are reviewed before they can see requests. Requests show a need and broad area, not a person’s name or address.</p>
              <label className="block space-y-2 text-base font-semibold">Your name or public giver name<input required maxLength={80} value={application.displayName} onChange={(event) => setApplication({ ...application, displayName: event.target.value })} className={fieldClass} autoComplete="name" /></label>
              {auth.currentUser?.isAnonymous && <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2 text-base font-semibold">Email for giver account<input type="email" required autoComplete="email" value={giverEmail} onChange={(event) => setGiverEmail(event.target.value)} className={fieldClass} /></label><label className="block space-y-2 text-base font-semibold">Create a password<input type="password" required minLength={6} autoComplete="new-password" value={giverPassword} onChange={(event) => setGiverPassword(event.target.value)} className={fieldClass} /><span className="block text-sm font-normal text-[#A8B8AF]">At least 6 characters. This keeps your guest requests with your account.</span></label></div>}
              <label className="block space-y-2 text-base font-semibold">Organization <span className="font-normal">(optional)</span><input maxLength={100} value={application.organization} onChange={(event) => setApplication({ ...application, organization: event.target.value })} className={fieldClass} autoComplete="organization" /></label>
              <SelectField label="I am a…" value={application.type} onChange={(value) => setApplication({ ...application, type: value })} options={GIVER_TYPES} />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="State" value={application.state} onChange={(value) => setApplication({ ...application, state: value })} options={STATES} />
                <SelectField label="Area" value={application.zone} onChange={(value) => setApplication({ ...application, zone: value })} options={ZONES} />
              </div>
              <fieldset>
                <legend className="text-base font-semibold">What can you give?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {NEEDS.map((need) => <label key={need.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/20 px-3 py-2 text-base"><input type="checkbox" className="h-5 w-5 accent-[#B5E2C9]" checked={application.categories.includes(need.id)} onChange={() => toggleCategory(need.id)} />{need.label}</label>)}
                </div>
              </fieldset>
              <p className="text-base leading-relaxed text-[#A8B8AF]">We verify your email before review. Your email stays hidden from the public and is shared with a requester only if they accept your offer. Selecting a professional category does not mean WellnessCafe has verified a license or credential.</p>
              <button disabled={busy || !application.displayName || !application.type || !application.state || !application.zone || !application.categories.length} className={buttonClass}>{busy ? "Working…" : verificationSent ? "I’ve verified my email" : "Apply to give"}</button>
            </form>}
            {giverStatus === "pending" && <section className="rounded-2xl border-2 border-white/10 bg-[#121B19] p-6"><h2 className="text-2xl font-bold">Application received</h2><p className="mt-2 text-lg text-[#C8D3CC]">Our team will review your giver profile. Requests stay private until givers are approved.</p></section>}
            {giverStatus === "declined" && <section className="rounded-2xl border-2 border-white/10 bg-[#121B19] p-6"><h2 className="text-2xl font-bold">Giver access is not active</h2><p className="mt-2 text-lg text-[#C8D3CC]">Contact WellnessCafe support if you think this is a mistake.</p></section>}
            {giverStatus === "active" && <>
              <section className="rounded-2xl border-2 border-white/10 bg-[#121B19] p-5 sm:p-6">
                <h2 className="text-2xl font-bold">Find a need you can meet</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <SelectField label="State" value={filterState} onChange={setFilterState} options={STATES} placeholder="All states" />
                  <SelectField label="Area" value={filterZone} onChange={setFilterZone} options={ZONES} placeholder="All areas" />
                  <SelectField label="Need type" value={filterType} onChange={setFilterType} options={NEEDS.map(({ id, label }) => [id, label])} placeholder="All needs" />
                </div>
                <p className="mt-4 flex items-start gap-3 rounded-xl bg-[#173428] p-4 text-base leading-relaxed text-[#DCEFE4]"><MapPin aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0" />Only the state, broad area, and selected need are shown here. Address and contact details stay private.</p>
              </section>
              {openNeeds.length ? <div className="space-y-3">{openNeeds.map((need) => <article key={need.id} className="rounded-2xl border-2 border-white/10 bg-[#121B19] p-5 sm:p-6"><h3 className="text-xl font-bold">{displayNeed(need)}</h3><p className="mt-1 text-lg text-[#C8D3CC]">{need.amount} · {need.state} · {ZONES.find(([id]) => id === need.zone)?.[1]}</p><p className="mt-2 text-base text-[#A8B8AF]">{need.fulfillment === "delivery" ? "Delivery preferred" : need.fulfillment === "public-pickup" ? "Public pickup preferred" : need.fulfillment === "digital" ? "Digital gift preferred" : "Flexible delivery"}</p><button type="button" onClick={() => sendOffer(need.id)} disabled={busy} className={`mt-4 ${buttonClass}`}>{busy ? "Sending…" : "I can provide this"}</button></article>)}</div> : <p className="rounded-xl bg-[#121B19] p-5 text-lg text-[#C8D3CC]">No open requests match those filters right now.</p>}
              <section className="space-y-3 pt-2"><h2 className="text-2xl font-bold">My offers</h2>{myOffers.length ? myOffers.map((offer) => <article key={offer.id} className="rounded-xl border-2 border-white/10 bg-[#121B19] p-5"><h3 className="text-lg font-bold">{displayNeed(offer)} · {offer.amount}</h3><p className="mt-1 text-base text-[#C8D3CC]">{{ accepted: "Your offer was accepted", pending: "Waiting for the requester", completed: "The requester marked the help received. Shared delivery details are no longer available.", closed_by_requester: "The requester closed this match. Shared delivery details are no longer available.", declined: "The requester declined this offer", closed: "This request was closed" }[offer.status] || "Offer status updated"}</p>{offer.details && <div className="mt-3 rounded-lg bg-[#173428] p-4 text-base text-[#F4F7F5]"><p>{offer.details.address}</p>{offer.details.phone && <p className="mt-1">{offer.details.phone}</p>}</div>}</article>) : <p className="rounded-xl bg-[#121B19] p-5 text-lg text-[#C8D3CC]">Offers you make will appear here.</p>}</section>
            </>}
          </div>
        )}
        <footer className="mt-6 rounded-xl border border-white/20 bg-[#121B19] p-4 text-base leading-relaxed text-[#C8D3CC]">
          <p className="flex items-start gap-3"><Headphones aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-[#9CCFB1]" />Need help using this? Tap “Hear these choices.” You can stop at any time.</p>
        </footer>
      </div>
    </main>
  );
}
