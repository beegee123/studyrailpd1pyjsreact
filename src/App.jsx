import { useState, useEffect } from "react";
import { supabase, useSession, useTheme, setTheme } from "./pd1hub.js";

const SUPABASE_TABLE = "study_tracker_progress";

const TRACK_NAMES = {
  py: "Python",
  js: "JavaScript",
  rx: "React",
  pd1: "PD1 (Apex)",
  ai: "AI Engineering",
};

const TRACK_COLORS = {
  light: { py: "#2E6DA4", js: "#B8860B", rx: "#1B9C93", pd1: "#B5563C", ai: "#7A5FBF" },
  dark: { py: "#6FA8DC", js: "#E3BE55", rx: "#4DD0C4", pd1: "#E0876A", ai: "#AD93E8" },
};

const PALETTE = {
  light: {
    page: "#F1F3F4",
    card: "#FFFFFF",
    border: "#E1E4E6",
    borderStrong: "#C7CCD1",
    text: "#1C2226",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    rowHover: "#F7F8F9",
    chipBg: "#F1F3F4",
    chipHover: "#E9ECEE",
    barTrack: "#EDEFF0",
    emptyDot: "#E1E4E6",
    currentBadgeBg: "#1C2226",
    currentBadgeText: "#FFFFFF",
  },
  dark: {
    page: "#14171A",
    card: "#1C2024",
    border: "#2A2E33",
    borderStrong: "#3A3F45",
    text: "#ECEEF0",
    textSecondary: "#9AA1A9",
    textMuted: "#6B7280",
    rowHover: "#22262B",
    chipBg: "#22262B",
    chipHover: "#2A2E33",
    barTrack: "#2A2E33",
    emptyDot: "#2A2E33",
    currentBadgeBg: "#ECEEF0",
    currentBadgeText: "#14171A",
  },
};

const WEEKS = [
  { n: 1, items: [
    { id: "py-w1", track: "py", label: "Wk1 — Fundamentals" },
    { id: "js-w1", track: "js", label: "Wk1 — Fundamentals" },
    { id: "pd1-w1", track: "pd1", label: "Wk1-2 — Fundamentals, Classes (finish)" },
  ]},
  { n: 2, items: [
    { id: "py-w2", track: "py", label: "Wk2 — Data structures, OOP, errors" },
    { id: "js-w2", track: "js", label: "Wk2 — Real gaps (this, closures)" },
    { id: "pd1-w2", track: "pd1", label: "Wk2 — Collections, SOQL/SOSL" },
  ]},
  { n: 3, items: [
    { id: "py-w3", track: "py", label: "Wk3 — Files, modules, APIs" },
    { id: "js-w3", track: "js", label: "Wk3 — Async, event loop" },
    { id: "pd1-w3", track: "pd1", label: "Wk3 — DML, Triggers, Order of Execution" },
  ]},
  { n: 4, items: [
    { id: "py-w4", track: "py", label: "Wk4 — Testing, debugging, DBs" },
    { id: "js-w4", track: "js", label: "Wk4 — APIs, debugging, capstone" },
    { id: "rx-w1", track: "rx", label: "Wk1 — Fast pass basics" },
    { id: "pd1-w4", track: "pd1", label: "Wk4 — Bulkification, Governor Limits" },
  ]},
  { n: 5, items: [
    { id: "py-w5", track: "py", label: "Wk5 — Async, decorators" },
    { id: "rx-w2", track: "rx", label: "Wk2 — Real gaps (effects, re-renders)" },
    { id: "pd1-w5", track: "pd1", label: "Wk5 — Testing, Test Classes" },
  ]},
  { n: 6, items: [
    { id: "py-w6", track: "py", label: "Wk6 — Data tools + capstone" },
    { id: "rx-w3", track: "rx", label: "Wk3 — Hooks, Context" },
    { id: "pd1-w6", track: "pd1", label: "Wk6 — Async Apex" },
  ]},
  { n: 7, items: [
    { id: "rx-w4", track: "rx", label: "Wk4 — API integration, capstone" },
    { id: "pd1-w7", track: "pd1", label: "Wk7 — Security, CRUD/FLS, Sharing" },
  ]},
  { n: 8, items: [
    { id: "pd1-w8", track: "pd1", label: "Wk8 — Practice exams, remediation" },
    { id: "ai-w1", track: "ai", label: "Wk1 — Model mechanics" },
  ]},
  { n: 9, items: [
    { id: "ai-w2", track: "ai", label: "Wk2 — Prompt & context engineering" },
  ]},
  { n: 10, items: [
    { id: "ai-w3", track: "ai", label: "Wk3 — RAG under the hood" },
  ]},
  { n: 11, items: [
    { id: "ai-w4", track: "ai", label: "Wk4 — Evaluation & reliability" },
  ]},
  { n: 12, items: [
    { id: "ai-w5", track: "ai", label: "Wk5 — Agents & tool use" },
  ]},
  { n: 13, items: [
    { id: "ai-w6", track: "ai", label: "Wk6 — Production + capstone" },
  ]},
];

const ALL_IDS = WEEKS.flatMap((w) => w.items.map((i) => i.id));
const STORAGE_KEY = "study-progress-v1";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function App() {
  const userId = useSession().user.id;
  const [done, setDone] = useState(loadProgress);
  const [error, setError] = useState(false);
  // Theme is shared with PD1 Hub and the other apps (cookie on the parent domain).
  const theme = useTheme();

  const isDark = theme === "dark";
  const C = PALETTE[theme];
  const trackColor = (key) => TRACK_COLORS[theme][key];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load from Supabase on mount. If you have no cloud row yet,
  // upload whatever this browser already has in localStorage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: loadError } = await supabase
        .from(SUPABASE_TABLE)
        .select("done")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (loadError) {
        console.error("Supabase load failed", loadError);
        return;
      }
      if (data) {
        setDone(data.done || {});
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.done || {}));
        } catch {
          // ignore
        }
      } else {
        const local = loadProgress();
        await supabase
          .from(SUPABASE_TABLE)
          .upsert({ user_id: userId, done: local }, { onConflict: "user_id" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = async (next) => {
    let ok = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      ok = false;
    }
    const { error: saveError } = await supabase
      .from(SUPABASE_TABLE)
      .upsert(
        { user_id: userId, done: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (saveError) {
      console.error("Supabase save failed", saveError);
      ok = false;
    }
    setError(!ok);
  };

  const toggle = (id) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    persist(next);
  };

  const resetAll = () => {
    if (!window.confirm("Reset all progress? This clears every checkbox.")) return;
    setDone({});
    persist({});
  };

  const trackStats = (key) => {
    const ids = ALL_IDS.filter((id) => id.startsWith(key + "-"));
    const completed = ids.filter((id) => done[id]).length;
    return { completed, total: ids.length };
  };

  const overallCompleted = ALL_IDS.filter((id) => done[id]).length;
  const overallTotal = ALL_IDS.length;
  const overallPct = overallTotal ? Math.round((overallCompleted / overallTotal) * 100) : 0;
  const currentWeek = WEEKS.find((w) => w.items.some((i) => !done[i.id]));

  return (
    <div style={{ minHeight: "100vh", padding: "2.5rem 1rem", display: "flex", justifyContent: "center", background: C.page, transition: "background .15s ease" }}>
      <style>{`
        .st-check { appearance: none; width: 20px; height: 20px; border-radius: 5px; border: 1.5px solid ${C.borderStrong}; background: ${C.card}; cursor: pointer; flex-shrink: 0; position: relative; transition: all .12s ease; }
        .st-check:checked { border-color: var(--tc); background: var(--tc); }
        .st-check:checked::after { content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
        .st-row:hover { background: ${C.rowHover}; }
        .st-reset:hover { background: ${C.chipHover}; }
        .st-toggle-track { transition: background .15s ease; }
        .st-toggle-thumb { transition: transform .15s ease; }
        @media (max-width: 640px) { .st-rail { overflow-x: auto; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: "900px", fontFamily: "'Inter', sans-serif", color: C.text }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", gap: "1rem" }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.01em" }}>
              Study rail
            </div>
            <div style={{ fontSize: "14px", color: C.textSecondary, marginTop: "4px" }}>
              Python · JavaScript · React · PD1 (Apex) · AI Engineering — 13-week combined track
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              flexShrink: 0, width: "52px", height: "28px", borderRadius: "14px",
              border: `1px solid ${C.borderStrong}`, background: isDark ? "#3A3F45" : "#E1E4E6",
              cursor: "pointer", position: "relative", padding: 0,
            }}
            className="st-toggle-track"
          >
            <div
              className="st-toggle-thumb"
              style={{
                position: "absolute", top: "2px", left: isDark ? "26px" : "2px",
                width: "22px", height: "22px", borderRadius: "50%",
                background: isDark ? "#ECEEF0" : "#FFFFFF",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        {/* Summary row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ fontSize: "14px", color: C.textSecondary }}>
            {currentWeek ? `Currently in week ${currentWeek.n}` : "All tracks complete"}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "30px", fontWeight: 500, lineHeight: 1 }}>{overallPct}%</div>
            <div style={{ fontSize: "12px", color: C.textSecondary }}>{overallCompleted} of {overallTotal} sessions</div>
          </div>
        </div>

        {/* Per-track bars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
          {Object.entries(TRACK_NAMES).map(([key, name]) => {
            const { completed, total } = trackStats(key);
            const pct = total ? (completed / total) * 100 : 0;
            return (
              <div key={key} style={{ background: C.card, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 500 }}>{name}</span>
                  <span style={{ color: C.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{completed}/{total}</span>
                </div>
                <div style={{ height: "5px", borderRadius: "3px", background: C.barTrack, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: trackColor(key), borderRadius: "3px", transition: "width .2s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rail visualization */}
        <div className="st-rail" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px 16px", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(13, 1fr)", rowGap: "8px", columnGap: "4px", minWidth: "480px" }}>
            {Object.entries(TRACK_NAMES).map(([key, name]) => (
              <div key={key} style={{ display: "contents" }}>
                <div style={{ fontSize: "11px", color: C.textSecondary, display: "flex", alignItems: "center" }}>{name.split(" ")[0]}</div>
                {WEEKS.map((w) => {
                  const item = w.items.find((i) => i.track === key);
                  return (
                    <div key={key + "-" + w.n} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item ? (
                        <div
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            background: done[item.id] ? trackColor(key) : C.card,
                            border: `1.5px solid ${done[item.id] ? trackColor(key) : C.borderStrong}`,
                          }}
                          title={`Week ${w.n}: ${item.label}`}
                        />
                      ) : (
                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: C.emptyDot }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div />
            {WEEKS.map((w) => (
              <div key={"n" + w.n} style={{ fontSize: "10px", color: C.textMuted, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
                {w.n}
              </div>
            ))}
          </div>
        </div>

        {/* Week list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {WEEKS.map((w) => {
            const isCurrent = currentWeek && w.n === currentWeek.n;
            return (
              <div
                key={w.n}
                style={{
                  background: C.card,
                  borderRadius: "10px",
                  border: `1px solid ${isCurrent ? C.borderStrong : C.border}`,
                  borderLeft: isCurrent ? `3px solid ${C.text}` : `1px solid ${C.border}`,
                  padding: "10px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: C.textSecondary }}>WEEK {w.n}</span>
                  {isCurrent && (
                    <span style={{ fontSize: "10px", background: C.currentBadgeBg, color: C.currentBadgeText, padding: "1px 7px", borderRadius: "10px" }}>
                      current
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {w.items.map((item) => {
                    const tc = trackColor(item.track);
                    return (
                      <label
                        key={item.id}
                        className="st-row"
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 6px", borderRadius: "6px", cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="st-check"
                          style={{ "--tc": tc }}
                          checked={!!done[item.id]}
                          onChange={() => toggle(item.id)}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: tc,
                            background: tc + (isDark ? "26" : "1A"),
                            padding: "2px 8px",
                            borderRadius: "5px",
                            flexShrink: 0,
                          }}
                        >
                          {TRACK_NAMES[item.track]}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            textDecoration: done[item.id] ? "line-through" : "none",
                            color: done[item.id] ? C.textMuted : C.text,
                          }}
                        >
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingBottom: "2rem" }}>
          <span style={{ fontSize: "12px", color: error ? trackColor("pd1") : C.textMuted }}>
            {error
              ? "Couldn't save — check your connection"
              : "Progress syncs automatically across devices"}
          </span>
          <button
            onClick={resetAll}
            className="st-reset"
            style={{
              fontSize: "12px",
              background: C.chipBg,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              color: C.textSecondary,
            }}
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}