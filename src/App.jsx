import { useState } from "react";

const TRACKS = {
  py: { name: "Python", color: "#2E6DA4" },
  js: { name: "JavaScript", color: "#B8860B" },
  rx: { name: "React", color: "#1B9C93" },
  pd1: { name: "PD1 (Apex)", color: "#B5563C" },
  ai: { name: "AI Engineering", color: "#7A5FBF" },
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
  const [done, setDone] = useState(loadProgress);
  const [error, setError] = useState(false);

  const persist = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setError(false);
    } catch {
      setError(true);
    }
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
    <div style={{ minHeight: "100vh", padding: "2.5rem 1rem", display: "flex", justifyContent: "center" }}>
      <style>{`
        .st-check { appearance: none; width: 20px; height: 20px; border-radius: 5px; border: 1.5px solid #C7CCD1; background: #fff; cursor: pointer; flex-shrink: 0; position: relative; transition: all .12s ease; }
        .st-check:checked { border-color: var(--tc); background: var(--tc); }
        .st-check:checked::after { content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
        .st-row:hover { background: #F7F8F9; }
        .st-reset:hover { background: #E9ECEE; }
        @media (max-width: 640px) { .st-rail { overflow-x: auto; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: "900px", fontFamily: "'Inter', sans-serif", color: "#1C2226" }}>

        {/* Page header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.01em" }}>
            Study rail
          </div>
          <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
            Python · JavaScript · React · PD1 (Apex) · AI Engineering — 13-week combined track
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ fontSize: "14px", color: "#6B7280" }}>
            {currentWeek ? `Currently in week ${currentWeek.n}` : "All tracks complete"}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "30px", fontWeight: 500, lineHeight: 1 }}>{overallPct}%</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>{overallCompleted} of {overallTotal} sessions</div>
          </div>
        </div>

        {/* Per-track bars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
          {Object.entries(TRACKS).map(([key, t]) => {
            const { completed, total } = trackStats(key);
            const pct = total ? (completed / total) * 100 : 0;
            return (
              <div key={key} style={{ background: "#fff", borderRadius: "10px", padding: "10px 12px", border: "1px solid #E1E4E6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                  <span style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{completed}/{total}</span>
                </div>
                <div style={{ height: "5px", borderRadius: "3px", background: "#EDEFF0", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: t.color, borderRadius: "3px", transition: "width .2s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rail visualization */}
        <div className="st-rail" style={{ background: "#fff", border: "1px solid #E1E4E6", borderRadius: "12px", padding: "14px 16px", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(13, 1fr)", rowGap: "8px", columnGap: "4px", minWidth: "480px" }}>
            {Object.entries(TRACKS).map(([key, t]) => (
              <div key={key} style={{ display: "contents" }}>
                <div style={{ fontSize: "11px", color: "#6B7280", display: "flex", alignItems: "center" }}>{t.name.split(" ")[0]}</div>
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
                            background: done[item.id] ? t.color : "#fff",
                            border: `1.5px solid ${done[item.id] ? t.color : "#C7CCD1"}`,
                          }}
                          title={`Week ${w.n}: ${item.label}`}
                        />
                      ) : (
                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#E1E4E6" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div />
            {WEEKS.map((w) => (
              <div key={"n" + w.n} style={{ fontSize: "10px", color: "#9CA3AF", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
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
                  background: "#fff",
                  borderRadius: "10px",
                  border: `1px solid ${isCurrent ? "#C7CCD1" : "#E1E4E6"}`,
                  borderLeft: isCurrent ? "3px solid #1C2226" : "1px solid #E1E4E6",
                  padding: "10px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#6B7280" }}>WEEK {w.n}</span>
                  {isCurrent && (
                    <span style={{ fontSize: "10px", background: "#1C2226", color: "#fff", padding: "1px 7px", borderRadius: "10px" }}>
                      current
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {w.items.map((item) => {
                    const t = TRACKS[item.track];
                    return (
                      <label
                        key={item.id}
                        className="st-row"
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 6px", borderRadius: "6px", cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="st-check"
                          style={{ "--tc": t.color }}
                          checked={!!done[item.id]}
                          onChange={() => toggle(item.id)}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: t.color,
                            background: t.color + "1A",
                            padding: "2px 8px",
                            borderRadius: "5px",
                            flexShrink: 0,
                          }}
                        >
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            textDecoration: done[item.id] ? "line-through" : "none",
                            color: done[item.id] ? "#9CA3AF" : "#1C2226",
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
          <span style={{ fontSize: "12px", color: error ? "#B5563C" : "#9CA3AF" }}>
            {error ? "Couldn't save — check browser storage settings" : "Progress saves automatically on this device"}
          </span>
          <button
            onClick={resetAll}
            className="st-reset"
            style={{
              fontSize: "12px",
              background: "#F1F3F4",
              border: "1px solid #E1E4E6",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}
