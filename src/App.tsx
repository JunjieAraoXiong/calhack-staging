import { Component, useState, type ReactNode } from "react";
import { useConvexConnectionState, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  Hotel,
  Luggage,
  Moon,
  PlaneLanding,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  TrainFront,
  X,
} from "lucide-react";
import type {
  HotelState,
  Mode,
  Receipt,
  Snapshot,
  TransportState,
  TripStatus,
} from "../shared/contracts";
import { localTime, TIME } from "../shared/contracts";
import { SYNTHETIC_CONFIRMATIONS } from "../shared/fixtures";
import { PROCEDURES } from "../shared/procedures";

const STORAGE_KEY = "yoru.scenario.v1";
const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;
const timeOnly = (at: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
const statusLabels: Record<TripStatus, string> = {
  needs_information: "A few details first",
  evaluating: "Finding your way through",
  awaiting_decision: "One decision for you",
  executing: "Taking care of the changes",
  partially_confirmed: "Part of your arrival is ready",
  arrangements_confirmed: "Your arrival is arranged",
  needs_help: "Your arrival needs attention",
};

function storedScenario() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function rememberScenario(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* Persistence remains on the backend if local storage is disabled. */
  }
}
function Tag({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}

export class ArrivalErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="setup-page">
        <Brand />
        <div className="setup-card">
          <p className="eyebrow">CONNECTION NEEDS ATTENTION</p>
          <h1>Your saved arrival couldn’t be opened.</h1>
          <p>
            Check that the local backend is running. If this scenario belongs to
            a previous backend, you can clear this browser’s selection and start
            again. Existing backend records are retained.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch {
                /* Storage may be disabled. */
              }
              window.location.reload();
            }}
          >
            Return to a fresh arrival <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }
}

export function SetupRequired() {
  return (
    <div className="setup-page">
      <Brand />
      <div className="setup-card">
        <p className="eyebrow">LOCAL DEVELOPMENT</p>
        <h1>Let’s connect your arrival.</h1>
        <p>
          Yoru needs its Convex backend before it can keep track of your
          journey.
        </p>
        <ol>
          <li>
            Start the local backend with <code>npm run backend</code>.
          </li>
          <li>
            Set <code>VITE_CONVEX_URL</code> to the backend URL in{" "}
            <code>.env.local</code>.
          </li>
          <li>
            Restart <code>npm run dev</code>.
          </li>
        </ol>
        <p className="fine-print">
          See the repository README for complete setup. No trip or booking has
          been created.
        </p>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Moon size={22} fill="currentColor" strokeWidth={1.4} />
      </span>
      <span>
        yoru<span className="brand-dot">.</span>
      </span>
    </div>
  );
}

export default function App() {
  const connection = useConvexConnectionState();
  const [scenarioId, setScenarioId] = useState<string | null>(storedScenario);
  const [tab, setTab] = useState<"journey" | "providers">("journey");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("replay");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const snapshot = useQuery(
    api.trips.snapshot,
    scenarioId ? { scenarioId } : "skip",
  ) as Snapshot | null | undefined;
  const createScenario = useMutation(api.trips.createScenario);
  const importConfirmations = useMutation(api.trips.importConfirmations);
  const sendEvent = useMutation(api.trips.event);
  const configure = useMutation(api.trips.configure);

  async function act(task: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "That action could not be completed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function newScenario(
    nextMode: Mode = mode,
    hotelPolicy: "accepted" | "pending" | "declined" = "accepted",
  ) {
    await act(async () => {
      const id = await createScenario({ mode: nextMode, hotelPolicy });
      setScenarioId(id);
      rememberScenario(id);
      setMode(nextMode);
      setTab("journey");
    });
  }
  async function change(key: string, value: unknown) {
    if (!scenarioId) return;
    await act(() => configure({ scenarioId, change: key, value }));
  }
  async function event(kind: string, duplicate = false) {
    if (!scenarioId) return;
    const eventId = duplicate ? "demo-delay-event" : crypto.randomUUID();
    await act(() => sendEvent({ scenarioId, eventId, kind }));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a
          className="brand-link"
          href="#"
          aria-label="Yoru, your journey"
          onClick={(e) => {
            e.preventDefault();
            setTab("journey");
          }}
        >
          <Brand />
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={tab === "journey" ? "selected" : ""}
            onClick={() => setTab("journey")}
          >
            Your journey
          </button>
          <button
            className={tab === "providers" ? "selected" : ""}
            onClick={() => setTab("providers")}
          >
            Provider records <ArrowUpRight size={13} />
          </button>
        </nav>
        <button
          className={`controls-toggle ${controlsOpen ? "active" : ""}`}
          aria-label="Demo controls"
          onClick={() => setControlsOpen((v) => !v)}
          aria-expanded={controlsOpen}
          aria-controls="demo-controls"
        >
          <SlidersHorizontal size={16} />
          <span>Demo controls</span>
        </button>
      </header>

      <div className="simulation-strip">
        <span>
          <span className="status-dot" />
          Controlled simulation · Synthetic bookings, payments & flight events
        </span>
        <span>
          {(snapshot?.trip.mode ?? mode) === "live"
            ? "Live model mode"
            : "Deterministic replay mode"}{" "}
          <span className="strip-divider">/</span> Tokyo · JST
        </span>
      </div>

      {!connection.isWebSocketConnected ? (
        <div className="connection-banner" role="status">
          <Clock3 size={15} />
          Connecting to the local backend. Saved records will refresh when the
          connection returns.
        </div>
      ) : null}
      {error ? (
        <div className="error-banner" role="alert">
          <CircleHelp size={18} />
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      ) : null}

      {controlsOpen ? (
        <section id="demo-controls" className="demo-controls">
          <div className="controls-heading">
            <div>
              <p className="eyebrow">SCENARIO LAB</p>
              <h2>Try a different arrival.</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Close demo controls"
              onClick={() => setControlsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="control-grid">
            <div className="control-group">
              <h3>New isolated scenario</h3>
              <label>
                Model mode
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  <option value="replay">Deterministic replay</option>
                  <option value="live">Live model</option>
                </select>
              </label>
              <div className="button-row">
                <button
                  className="small-button"
                  disabled={busy}
                  onClick={() => newScenario(mode)}
                >
                  Reset · accepted hotel
                </button>
                <button
                  className="small-button"
                  disabled={busy}
                  onClick={() => newScenario(mode, "pending")}
                >
                  New · pending hotel
                </button>
                <button
                  className="small-button"
                  disabled={busy}
                  onClick={() => newScenario(mode, "declined")}
                >
                  New · declined hotel
                </button>
              </div>
              <p>
                Each reset creates a separate scenario. Previous records stay
                intact.
              </p>
            </div>
            <div className="control-group">
              <h3>Flight & time</h3>
              <div className="button-row">
                <button
                  className="small-button"
                  disabled={busy || !snapshot?.trip.imported}
                  onClick={() => event("delay", true)}
                >
                  Inject delay
                </button>
                <button
                  className="small-button"
                  disabled={busy || !snapshot?.trip.imported}
                  onClick={() => event("delay", true)}
                >
                  Duplicate same event
                </button>
                <button
                  className="small-button"
                  disabled={busy || !snapshot?.trip.imported}
                  onClick={() => event("later_delay")}
                >
                  Later material delay
                </button>
                <button
                  className="small-button"
                  disabled={busy || !snapshot}
                  onClick={() => change("clock", TIME.cutoff + 1)}
                >
                  Advance past original cutoff
                </button>
                <button
                  className="small-button"
                  disabled={busy || !snapshot}
                  onClick={() => event("retry")}
                >
                  Wake / reconcile
                </button>
              </div>
              <p>
                Fixture clock:{" "}
                {snapshot
                  ? `${localTime(snapshot.trip.now)} JST (frozen)`
                  : "No scenario yet"}
              </p>
            </div>
            {snapshot ? (
              <>
                <div className="control-group">
                  <h3>Provider responses</h3>
                  <label>
                    Hotel decision
                    <select
                      value={
                        snapshot.hotel.booking.decision === "not_requested"
                          ? snapshot.hotel.responsePolicy
                          : snapshot.hotel.booking.decision
                      }
                      onChange={(e) =>
                        change(
                          snapshot.hotel.booking.requestId
                            ? "hotelDecision"
                            : "hotelPolicy",
                          e.target.value,
                        )
                      }
                      disabled={busy}
                    >
                      <option value="accepted">Accepted</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={snapshot.trip.faults.lostTransportResponse}
                      disabled={busy}
                      onChange={(e) =>
                        change("lostTransportResponse", e.target.checked)
                      }
                    />
                    Lose response after transport commit
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={snapshot.trip.faults.lookupUnavailable}
                      disabled={busy}
                      onChange={(e) =>
                        change("lookupUnavailable", e.target.checked)
                      }
                    />
                    Operation lookup unavailable
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={snapshot.trip.faults.providerUnavailable}
                      disabled={busy}
                      onChange={(e) =>
                        change("providerUnavailable", e.target.checked)
                      }
                    />
                    Provider unavailable
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={snapshot.trip.faults.pauseBeforeCommit}
                      disabled={busy}
                      onChange={(e) =>
                        change("pauseBeforeCommit", e.target.checked)
                      }
                    />
                    Pause before provider commit
                  </label>
                  <button
                    className="small-button"
                    disabled={busy}
                    onClick={() => change("removeInventory", "S-target")}
                  >
                    Remove 01:40 inventory
                  </button>
                </div>
                <div className="control-group">
                  <h3>Access & changing intent</h3>
                  <label>
                    Bus management access
                    <select
                      value={
                        !snapshot.trip.transportAccess.available
                          ? "missing"
                          : snapshot.trip.transportAccess.bookingId !== "B-001"
                            ? "wrong_booking"
                            : snapshot.trip.transportAccess.expiresAt <
                                snapshot.trip.now
                              ? "expired"
                              : snapshot.trip.transportAccess.channel ===
                                  "member"
                                ? "member"
                                : "valid"
                      }
                      disabled={busy}
                      onChange={(e) =>
                        change("transportAccess", e.target.value)
                      }
                    >
                      <option value="valid">Valid guest access</option>
                      <option value="missing">Missing access</option>
                      <option value="expired">Expired access</option>
                      <option value="wrong_booking">Wrong booking</option>
                      <option value="member">Member channel</option>
                    </select>
                  </label>
                  <div className="button-row">
                    <button
                      className="small-button"
                      disabled={busy}
                      onClick={() =>
                        change("readiness", TIME.readyTo + 60 * 60_000)
                      }
                    >
                      Need 1 extra hour
                    </button>
                    <button
                      className="small-button"
                      disabled={busy}
                      onClick={() =>
                        change("grantActive", !snapshot.trip.grant.active)
                      }
                    >
                      {snapshot.trip.grant.active
                        ? "Revoke action grant"
                        : "Restore action grant"}
                    </button>
                    <button
                      className="small-button danger"
                      disabled={busy || !snapshot.trip.active}
                      onClick={() => change("cancel", true)}
                    >
                      Stop future changes
                    </button>
                  </div>
                  <p>
                    Existing effects remain visible after a correction or stop.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      {!scenarioId ? (
        <Welcome
          mode={mode}
          setMode={setMode}
          busy={busy}
          start={() => newScenario(mode)}
        />
      ) : snapshot === undefined ? (
        <main className="loading-state" aria-live="polite">
          <span className="loading-orbit" />
          <h2>Opening your journey…</h2>
          <p>Connecting to your saved arrival and provider records.</p>
        </main>
      ) : snapshot === null ? (
        <main className="empty-state">
          <h1>This scenario isn’t on this backend.</h1>
          <p>You can create a fresh isolated arrival.</p>
          <button
            className="primary-button"
            disabled={busy}
            onClick={() => newScenario(mode)}
          >
            Create new scenario <ArrowRight size={18} />
          </button>
        </main>
      ) : tab === "providers" ? (
        <ProviderInspector scenarioId={scenarioId} />
      ) : (
        <Journey
          snapshot={snapshot}
          busy={busy}
          importTrip={(text) =>
            act(() => importConfirmations({ scenarioId, text }))
          }
          delay={() => event("delay", true)}
          change={change}
          retry={() => event("retry")}
        />
      )}

      <footer className="app-footer">
        <span>Yoru · A little less to carry.</span>
        <span>One traveler · One arrival · Tokyo</span>
        <span>Local demo. No commercial bookings.</span>
      </footer>
    </div>
  );
}

function Welcome({
  mode,
  setMode,
  busy,
  start,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  busy: boolean;
  start: () => void;
}) {
  return (
    <main className="welcome">
      <div className="welcome-copy">
        <p className="eyebrow">
          <span className="tiny-line" /> YOUR PERSONAL ARRIVAL COMPANION
        </p>
        <h1>
          A softer
          <br />
          landing.
        </h1>
        <p className="welcome-description">
          Flights change. Your evening shouldn’t fall apart.
          <br />
          Bring your bookings. We’ll take care of what comes next.
        </p>
        <div className="welcome-route">
          <span>Haneda</span>
          <span className="route-stroke" />
          <span>Your hotel</span>
          <Tag>Tokyo</Tag>
        </div>
        <label className="mode-label">
          Run this demo with
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="replay">Deterministic replay</option>
            <option value="live">Live model</option>
          </select>
        </label>
        <button className="primary-button" disabled={busy} onClick={start}>
          {busy ? "Preparing your journey…" : "Prepare my arrival"}
          <ArrowRight size={19} />
        </button>
        <p className="fine-print">
          An existing flight, bus ticket and hotel room.
          <br />
          No new booking. No real payment.
        </p>
      </div>
      <ArrivalIllustration />
      <div className="welcome-bottom">
        <div>
          <ShieldCheck size={21} />
          <span>Your bookings stay yours</span>
        </div>
        <div>
          <Luggage size={21} />
          <span>Built around your real constraints</span>
        </div>
        <div>
          <Moon size={21} />
          <span>Help through the unexpected</span>
        </div>
      </div>
    </main>
  );
}

function ArrivalIllustration() {
  return (
    <div
      className="arrival-illustration"
      aria-label="Illustration of a route from Haneda Airport to a Tokyo hotel"
    >
      <div className="illustration-caption">
        <span>35.5494° N, 139.7798° E</span>
        <span>東京</span>
      </div>
      <div className="map-circle circle-one" />
      <div className="map-circle circle-two" />
      <svg viewBox="0 0 520 510" className="route-map" aria-hidden="true">
        <path
          d="M -30 410 C 130 355 40 210 205 230 S 260 330 420 140 S 470 35 550 20"
          className="river"
        />
        <path
          d="M 90 368 Q 145 328 235 345 T 335 240 T 410 155"
          className="route-path"
        />
        <circle cx="90" cy="368" r="7" className="map-point" />
        <circle cx="410" cy="155" r="7" className="map-point" />
        <path
          d="M 120 80 L 360 480 M 180 20 L 455 470 M 20 230 L 510 70 M 0 300 L 550 130"
          className="map-street"
        />
      </svg>
      <div className="map-label airport-label">
        <PlaneLanding size={18} />
        <div>
          <small>THE BEGINNING</small>
          <strong>Haneda Airport</strong>
        </div>
      </div>
      <div className="map-label hotel-label">
        <Hotel size={18} />
        <div>
          <small>YOUR EVENING</small>
          <strong>A room waiting for you</strong>
        </div>
      </div>
      <div className="illustration-note">
        <span className="note-icon">
          <Check size={16} />
        </span>
        <span>A plan that moves with you.</span>
      </div>
      <span className="illustration-footer">
        Schematic illustration · Not for navigation
      </span>
    </div>
  );
}

function Journey({
  snapshot,
  busy,
  importTrip,
  delay,
  change,
  retry,
}: {
  snapshot: Snapshot;
  busy: boolean;
  importTrip: (text: string) => Promise<void>;
  delay: () => Promise<void>;
  change: (key: string, value: unknown) => Promise<void>;
  retry: () => Promise<void>;
}) {
  const { trip, transport, hotel } = snapshot;
  const [importText, setImportText] = useState(SYNTHETIC_CONFIRMATIONS);
  const [showImport, setShowImport] = useState(false);
  const confirmed = trip.status === "arrangements_confirmed";
  const moving = trip.status === "evaluating" || trip.status === "executing";
  const hotelAccepted = hotel.booking.decision === "accepted";
  const roomPending = hotel.booking.decision === "pending";
  const additionalCapacity = Math.max(
    0,
    trip.grant.cap - trip.charged - trip.held,
  );
  return (
    <main className="journey-page">
      <div className="journey-heading">
        <div>
          <p className="eyebrow">YOUR ARRIVAL, TAKEN CARE OF</p>
          <h1>
            Good evening, Tokyo<span>.</span>
          </h1>
          <p>
            Haneda Airport <ArrowRight size={15} /> Your hotel{" "}
            <span className="inline-divider">/</span> 14–15 November 2026
          </p>
        </div>
        <div className="journey-meta">
          <Tag tone={trip.mode === "live" ? "green" : ""}>
            {trip.mode === "live" ? "Live model" : "Replay"}
          </Tag>
          <span>
            <Clock3 size={14} /> {localTime(trip.now)} JST
          </span>
          <small>Scenario clock · paused between advances</small>
        </div>
      </div>

      {!trip.imported ? (
        <section className="import-card">
          <div className="import-title">
            <span className="round-icon">
              <FileText size={22} />
            </span>
            <div>
              <p className="eyebrow">START WITH WHAT’S ALREADY BOOKED</p>
              <h2>Three confirmations. One arrival.</h2>
              <p>
                Verify your flight, guest bus ticket and original hotel night.
              </p>
            </div>
          </div>
          <div className="import-bookings">
            <div>
              <PlaneLanding size={20} />
              <strong>Flight F-001</strong>
              <span>Haneda arrival · Nov 14</span>
            </div>
            <div>
              <Ticket size={20} />
              <strong>Bus B-001</strong>
              <span>Guest booking · 23:00</span>
            </div>
            <div>
              <Hotel size={20} />
              <strong>Hotel H-001</strong>
              <span>Service night · Nov 14</span>
            </div>
          </div>
          <div className="import-actions">
            <button
              className="primary-button"
              disabled={busy}
              onClick={() => importTrip(importText)}
            >
              {busy
                ? "Verifying confirmations…"
                : "Import & verify confirmations"}
              <ArrowRight size={18} />
            </button>
            <button
              className="text-button"
              onClick={() => setShowImport((v) => !v)}
              aria-expanded={showImport}
            >
              {showImport ? "Hide" : "Review or edit"} supplied confirmations{" "}
              <ChevronDown size={15} />
            </button>
          </div>
          {showImport ? (
            <label className="import-editor">
              Synthetic confirmation JSON
              <textarea
                rows={12}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                spellCheck={false}
              />
            </label>
          ) : null}
          {trip.unresolved.length ? (
            <div className="unresolved" role="status">
              <strong>Needs your attention</strong>
              <ul>
                {trip.unresolved.map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="fine-print">
            These supplied confirmations belong to the controlled demo
            providers. Imported details are verified before changes.
          </p>
        </section>
      ) : null}

      <div className="journey-grid">
        <div className="journey-main">
          <section
            className={`status-card ${confirmed ? "is-confirmed" : ""}`}
            aria-live="polite"
          >
            <div className="status-topline">
              <span className={`status-symbol ${moving ? "spinning" : ""}`}>
                {confirmed ? (
                  <Check size={21} />
                ) : moving ? (
                  <RefreshCw size={20} />
                ) : (
                  <Sparkles size={21} />
                )}
              </span>
              <Tag tone={confirmed ? "green" : moving ? "amber" : ""}>
                {confirmed
                  ? "ARRANGEMENTS CONFIRMED"
                  : !trip.imported
                    ? "GETTING READY"
                    : moving
                      ? "WORKING ON IT"
                      : trip.status.replaceAll("_", " ").toUpperCase()}
              </Tag>
              <span className="status-ordinal">01 / ARRIVAL</span>
            </div>
            <h2>
              {!trip.imported
                ? "Let’s bring your plans together."
                : statusLabels[trip.status]}
            </h2>
            <p className="status-description">{trip.message}</p>
            {trip.faults.providerUnavailable ? (
              <p className="stale-record-note">
                <Clock3 size={14} />
                Provider communication is unavailable. Displayed bookings are
                persisted records; fresh verification is pending.
              </p>
            ) : null}
            {trip.imported && !trip.delayed ? (
              <div className="delay-callout">
                <div>
                  <strong>A change of plans?</strong>
                  <p>Try the demo: your flight is now due at 23:40.</p>
                </div>
                <button
                  className="primary-button compact"
                  disabled={busy}
                  onClick={delay}
                >
                  Simulate flight delay <ArrowRight size={16} />
                </button>
              </div>
            ) : null}
            {trip.imported && trip.delayed ? (
              <div className="outcome-grid">
                <div>
                  <span>Airport bus</span>
                  <strong>{localTime(transport.booking.departureAt)}</strong>
                  <small>
                    {transport.amendments > 0
                      ? "Amended ticket verified"
                      : "Original reservation retained"}
                  </small>
                </div>
                <div>
                  <span>Hotel arrival</span>
                  <strong>
                    {hotelAccepted
                      ? `Accepted until ${timeOnly(hotel.booking.acceptedUntil!)}`
                      : roomPending
                        ? "Waiting for acceptance"
                        : hotel.booking.decision === "declined"
                          ? "Late arrival declined"
                          : "No late-arrival agreement yet"}
                  </strong>
                  <small>Original Nov 14 night preserved</small>
                </div>
              </div>
            ) : null}
            {roomPending && !trip.grant.allowTransportWhileHotelPending ? (
              <div className="decision-callout">
                <strong>
                  Change the bus while the hotel is still deciding?
                </strong>
                <p>
                  The hotel has not accepted late arrival. A bus change can cost
                  up to {yen(trip.grant.cap)}, within your existing cap. Your
                  room may still need attention. Bus changes must commit by{" "}
                  {localTime(transport.booking.cutoff)} JST.
                </p>
                <button
                  className="small-button"
                  disabled={busy}
                  onClick={() =>
                    change("allowTransportWhileHotelPending", true)
                  }
                >
                  Allow bus change with hotel pending
                </button>
              </div>
            ) : null}
            {trip.status === "needs_help" ||
            trip.status === "awaiting_decision" ||
            trip.held > 0 ? (
              <button className="text-button" disabled={busy} onClick={retry}>
                <RefreshCw size={14} />
                Check latest provider outcomes
              </button>
            ) : null}
            {confirmed ? (
              <p className="confirmed-note">
                <ShieldCheck size={15} />
                Verified arrangements. Your physical arrival is still ahead.
              </p>
            ) : null}
          </section>

          <section className="timeline-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE EVENING AHEAD</p>
                <h2>Your arrival, step by step.</h2>
              </div>
              <span>ALL TIMES JST</span>
            </div>
            <ol className="timeline">
              <TimelineStep
                icon={<PlaneLanding size={20} />}
                time={localTime(trip.landingAt)}
                title="Touch down at Haneda"
                badge={trip.delayed ? "Delayed estimate" : "Original estimate"}
              >
                <p>{trip.flightId} · One adult, two suitcases</p>
                {trip.delayed ? (
                  <p className="muted">Original estimate: Nov 14, 21:30</p>
                ) : null}
              </TimelineStep>
              <TimelineStep
                icon={<Luggage size={19} />}
                time={`${localTime(trip.readyFrom)}–${timeOnly(trip.readyTo)}`}
                title="Collect bags. Find the right stop."
                badge="Assumed readiness"
              >
                <p>Immigration, baggage collection and walking included.</p>
                <p className="muted">
                  A fixture assumption, plus 10 minutes for boarding.
                </p>
              </TimelineStep>
              <TimelineStep
                icon={<TrainFront size={20} />}
                time={localTime(transport.booking.departureAt)}
                title="Your airport bus"
                badge={
                  transport.amendments
                    ? "Amended & verified"
                    : "Existing ticket"
                }
                tone={transport.amendments ? "green" : ""}
              >
                <p>
                  {transport.booking.id} · {transport.booking.channel}{" "}
                  reservation · {yen(transport.booking.fare)}
                </p>
                <p className="muted">
                  {transport.booking.activeTickets} valid ticket · Hotel arrival
                  estimate {localTime(transport.booking.hotelArrivalAt)}
                </p>
              </TimelineStep>
              <TimelineStep
                icon={<Hotel size={20} />}
                time={`Nov 14 · original night`}
                title="Your room stays yours"
                badge={
                  hotelAccepted
                    ? "Late arrival accepted"
                    : roomPending
                      ? "Acceptance pending"
                      : hotel.booking.decision === "declined"
                        ? "Late arrival declined"
                        : "Existing reservation"
                }
                tone={hotelAccepted ? "green" : roomPending ? "amber" : ""}
              >
                <p>
                  {hotel.booking.id} · {hotel.booking.room}
                </p>
                <p className="muted">
                  Checkout {localTime(hotel.booking.checkoutAt)} ·{" "}
                  {hotelAccepted
                    ? `Accepted until ${localTime(hotel.booking.acceptedUntil!)}`
                    : `Usual arrival limit ${localTime(hotel.booking.defaultLatestArrival)}`}
                </p>
              </TimelineStep>
            </ol>
          </section>
          <Evidence snapshot={snapshot} />
        </div>

        <aside className="journey-aside">
          <section className="next-card">
            <p className="eyebrow">ONE THING AT A TIME</p>
            <span className="next-icon">
              <ArrowUpRight size={28} />
            </span>
            <h2>Your next step.</h2>
            <p>{trip.nextAction}</p>
            <div className="next-footnote">
              <Moon size={16} />
              <span>We’ll keep the rest in view.</span>
            </div>
          </section>
          <section className="budget-card">
            <div className="section-heading">
              <h3>Your change budget</h3>
              <ShieldCheck size={18} />
            </div>
            <div className="budget-amount">
              {yen(additionalCapacity)}
              <span>remaining</span>
            </div>
            <div
              className="budget-track"
              role="img"
              aria-label={`${yen(trip.charged)} charged and ${yen(trip.held)} reserved of ${yen(trip.grant.cap)} cap`}
            >
              <span
                className="charged-track"
                style={{
                  width: `${Math.min(100, (trip.charged / Math.max(trip.grant.cap, 1)) * 100)}%`,
                }}
              />
              <span
                className="held-track"
                style={{
                  width: `${Math.min(100, (trip.held / Math.max(trip.grant.cap, 1)) * 100)}%`,
                }}
              />
            </div>
            <dl className="amount-list">
              <div>
                <dt>Additional charges</dt>
                <dd>{yen(trip.charged)}</dd>
              </div>
              <div>
                <dt>Reserved / unresolved</dt>
                <dd>{yen(trip.held)}</dd>
              </div>
              <div className="total">
                <dt>Authorized cap</dt>
                <dd>{yen(trip.grant.cap)}</dd>
              </div>
            </dl>
            <p>
              Original bus payment of {yen(transport.booking.priorPaid)} is
              separate.
            </p>
          </section>
          <section className="preferences-card">
            <p className="eyebrow">WHAT MATTERS TO YOU</p>
            <div className="preference-line">
              <Luggage size={17} />
              <span>One adult · two suitcases</span>
            </div>
            <div className="preference-line">
              <ArrowRight size={17} />
              <span>Fewer transfers preferred</span>
            </div>
            <div className="preference-line">
              <Hotel size={17} />
              <span>Keep the original hotel night</span>
            </div>
            <div className="scope-summary">
              <strong>
                {trip.grant.active && trip.active
                  ? "Permission in place"
                  : "Changes are stopped"}
              </strong>
              <p>
                Amend B-001 and request late arrival for H-001 within{" "}
                {yen(trip.grant.cap)}. No new ticket or hotel cancellation.
              </p>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={trip.grant.allowTransportWhileHotelPending}
                disabled={busy || !trip.active}
                onChange={(e) =>
                  change("allowTransportWhileHotelPending", e.target.checked)
                }
              />
              <span>Allow bus changes before hotel acceptance</span>
            </label>
          </section>
        </aside>
      </div>
    </main>
  );
}

function TimelineStep({
  icon,
  time,
  title,
  badge,
  tone = "",
  children,
}: {
  icon: ReactNode;
  time: string;
  title: string;
  badge: string;
  tone?: string;
  children: ReactNode;
}) {
  return (
    <li className="timeline-step">
      <span className="timeline-icon">{icon}</span>
      <div>
        <span className="step-time">{time}</span>
        <div className="step-title">
          <h3>{title}</h3>
          <Tag tone={tone}>{badge}</Tag>
        </div>
        {children}
      </div>
    </li>
  );
}

function Evidence({ snapshot }: { snapshot: Snapshot }) {
  return (
    <details className="evidence-panel">
      <summary>
        <span>
          <FileText size={17} />
          Details & evidence
        </span>
        <span>
          Sources, decisions, operations <ChevronDown size={16} />
        </span>
      </summary>
      <div className="evidence-content">
        <p className="fine-print">
          Read directly from persisted scenario records. A request submission
          alone does not establish business acceptance.
        </p>
        <h3>Local procedures</h3>
        {PROCEDURES.map((procedure) => (
          <div className="procedure-record" key={procedure.id}>
            <strong>
              {procedure.title} · v{procedure.version}
            </strong>
            <p>{procedure.applicability}</p>
            {procedure.sources.map((source) => (
              <div key={source.url}>
                {source.url.startsWith("https://") ? (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <ArrowUpRight size={13} />
                  </a>
                ) : (
                  <small>{source.title}</small>
                )}
                <p>{source.rule}</p>
                <small>
                  Retrieved {source.retrievedAt} · Reviewed{" "}
                  {procedure.reviewedAt}
                </small>
              </div>
            ))}
            <small>{procedure.fixtureBoundary}</small>
            <details className="procedure-conditions">
              <summary>Applicability checks & failure branches</summary>
              <ul>
                {procedure.preconditions.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
              <ul>
                {procedure.failureBranches.map((branch) => (
                  <li key={branch}>{branch}</li>
                ))}
              </ul>
            </details>
          </div>
        ))}
        <h3>Imported facts</h3>
        <div className="evidence-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fact</th>
                <th>Value</th>
                <th>Scope / evidence</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.trip.facts.map((fact, i) => (
                <tr key={`${fact.name}-${i}`}>
                  <td>{fact.name}</td>
                  <td>{fact.value}</td>
                  <td>
                    {fact.scope} · {fact.verified ? "verified" : "candidate"}
                    <small>{fact.source}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Model decisions</h3>
        {snapshot.traces.length ? (
          snapshot.traces.map((trace, i) => (
            <div className="trace-record" key={`${trace.at}-${i}`}>
              <Tag tone={trace.mode === "live" ? "green" : ""}>
                {trace.mode === "live"
                  ? "Actual model call"
                  : "Deterministic replay"}
              </Tag>
              <strong>
                {trace.decision.action}{" "}
                {trace.decision.serviceId
                  ? `· ${trace.decision.serviceId}`
                  : ""}
              </strong>
              <p>{trace.decision.reason}</p>
              <small>
                {trace.provider} / {trace.model} · intent {trace.intentRevision}{" "}
                · {localTime(trace.at)}
                {trace.requestId ? ` · request ${trace.requestId}` : ""}
              </small>
            </div>
          ))
        ) : (
          <p className="muted">No model decision has been recorded.</p>
        )}
        <h3>Operations & receipts</h3>
        {snapshot.operations.length ? (
          snapshot.operations.map((op) => (
            <div className="operation-record" key={op.operationId}>
              <div>
                <strong>
                  {op.provider} · {op.args.bookingId}
                </strong>
                <Tag
                  tone={
                    op.status === "confirmed"
                      ? "green"
                      : op.status === "unknown"
                        ? "amber"
                        : ""
                  }
                >
                  {op.status}
                </Tag>
              </div>
              <code>{op.operationId}</code>
              <p>{op.reason || "Awaiting authoritative outcome."}</p>
              <small>
                Reserved {yen(op.hold)} · intent {op.intentRevision} · grant{" "}
                {op.grantRevision}
              </small>
              {snapshot.receipts
                .filter((r) => r.operationId === op.operationId)
                .map((r, i) => (
                  <p className="receipt-line" key={i}>
                    <ShieldCheck size={14} />
                    {r.evidence} · {r.outcome} · {yen(r.additionalCharged)}
                  </p>
                ))}
            </div>
          ))
        ) : (
          <p className="muted">No provider effect has been prepared.</p>
        )}
        <h3>Event history</h3>
        <ul className="event-list">
          {snapshot.events.map((event, i) => (
            <li key={`${event.eventId}-${i}`}>
              <span>{localTime(event.at)}</span>
              <strong>{event.kind}</strong>
              <span>{event.state}</span>
              <p>{event.detail}</p>
            </li>
          ))}
        </ul>
        <p className="fine-print">
          Checkpoint: {snapshot.trip.checkpoint} · Intent revision{" "}
          {snapshot.trip.intentRevision} · Scenario {snapshot.scenarioId}
        </p>
      </div>
    </details>
  );
}

function ProviderInspector({ scenarioId }: { scenarioId: string }) {
  const transport = useQuery(api.providers.inspectTransport, { scenarioId }) as
    { state: TransportState; receipts: Receipt[] } | null | undefined;
  const hotel = useQuery(api.providers.inspectHotel, { scenarioId }) as
    { state: HotelState; receipts: Receipt[] } | null | undefined;
  if (!transport || !hotel)
    return (
      <main className="loading-state">
        <h2>Reading provider records…</h2>
      </main>
    );
  return (
    <main className="provider-page">
      <div className="journey-heading">
        <div>
          <p className="eyebrow">INDEPENDENT PROVIDER RECORDS</p>
          <h1>
            What actually changed<span>.</span>
          </h1>
          <p>
            These views read each controlled provider’s own records and
            receipts.
          </p>
        </div>
        <Tag>Controlled providers</Tag>
      </div>
      <div className="provider-grid">
        <section className="provider-card">
          <span className="provider-icon">
            <Ticket size={25} />
          </span>
          <div className="section-heading">
            <h2>Airport transport</h2>
            <Tag tone="green">Authoritative record</Tag>
          </div>
          <dl className="record-list">
            <div>
              <dt>Booking</dt>
              <dd>{transport.state.booking.id}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{transport.state.booking.serviceId}</dd>
            </div>
            <div>
              <dt>Departure</dt>
              <dd>{localTime(transport.state.booking.departureAt)} JST</dd>
            </div>
            <div>
              <dt>Service date</dt>
              <dd>{transport.state.booking.serviceDate}</dd>
            </div>
            <div>
              <dt>Valid tickets</dt>
              <dd>{transport.state.booking.activeTickets}</dd>
            </div>
            <div>
              <dt>Fare</dt>
              <dd>{yen(transport.state.booking.fare)}</dd>
            </div>
            <div>
              <dt>Additional charged</dt>
              <dd>{yen(transport.state.totalAdditionalCharged)}</dd>
            </div>
            <div>
              <dt>Amendment effects</dt>
              <dd>{transport.state.amendments}</dd>
            </div>
            <div>
              <dt>Booking revision</dt>
              <dd>{transport.state.booking.revision}</dd>
            </div>
            <div>
              <dt>Current cutoff</dt>
              <dd>{localTime(transport.state.booking.cutoff)} JST</dd>
            </div>
          </dl>
          <ProviderReceipts receipts={transport.receipts} />
          <details className="raw-record">
            <summary>Inspect raw provider record</summary>
            <pre>{JSON.stringify(transport, null, 2)}</pre>
          </details>
        </section>
        <section className="provider-card">
          <span className="provider-icon">
            <Hotel size={25} />
          </span>
          <div className="section-heading">
            <h2>Your hotel</h2>
            <Tag tone="green">Authoritative record</Tag>
          </div>
          <dl className="record-list">
            <div>
              <dt>Booking</dt>
              <dd>{hotel.state.booking.id}</dd>
            </div>
            <div>
              <dt>Original service night</dt>
              <dd>{hotel.state.booking.serviceNight}</dd>
            </div>
            <div>
              <dt>Checkout</dt>
              <dd>{localTime(hotel.state.booking.checkoutAt)} JST</dd>
            </div>
            <div>
              <dt>Room</dt>
              <dd>{hotel.state.booking.room}</dd>
            </div>
            <div>
              <dt>Late-arrival decision</dt>
              <dd>{hotel.state.booking.decision.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Requested until</dt>
              <dd>
                {hotel.state.booking.requestedUntil
                  ? `${localTime(hotel.state.booking.requestedUntil)} JST`
                  : "Not requested"}
              </dd>
            </div>
            <div>
              <dt>Accepted until</dt>
              <dd>
                {hotel.state.booking.acceptedUntil
                  ? `${localTime(hotel.state.booking.acceptedUntil)} JST`
                  : "No accepted extension"}
              </dd>
            </div>
            <div>
              <dt>Request effects</dt>
              <dd>{hotel.state.requests}</dd>
            </div>
            <div>
              <dt>Booking revision</dt>
              <dd>{hotel.state.booking.revision}</dd>
            </div>
          </dl>
          <ProviderReceipts receipts={hotel.receipts} />
          <details className="raw-record">
            <summary>Inspect raw provider record</summary>
            <pre>{JSON.stringify(hotel, null, 2)}</pre>
          </details>
        </section>
      </div>
      <p className="provider-note">
        <ShieldCheck size={17} />
        Providers own their outcomes. A submitted request, a model explanation
        and a confirmed booking are different things.
      </p>
    </main>
  );
}

function ProviderReceipts({ receipts }: { receipts: Receipt[] }) {
  return (
    <div className="provider-receipts">
      <h3>Provider receipts</h3>
      {receipts.length ? (
        receipts.map((r, i) => (
          <div key={`${r.operationId}-${i}`}>
            <Tag tone={r.outcome === "committed" ? "green" : "amber"}>
              {r.outcome}
            </Tag>
            <p>{r.evidence}</p>
            <code>{r.operationId}</code>
          </div>
        ))
      ) : (
        <p>No provider effect recorded.</p>
      )}
    </div>
  );
}
