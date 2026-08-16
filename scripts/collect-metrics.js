#!/usr/bin/env node
/**
 * EslaM-X adoption metrics collector.
 *
 * Snapshots adoption signals (stars, forks, views, clones, open issues) for
 * the tracked public repositories into a daily time series in
 * profile-data/metrics-history.json. Appends one row per day (idempotent per
 * date); does not modify the flagships' evidence numbers.
 *
 *   GITHUB_TOKEN      required for repo metadata; traffic data needs it too
 *   ESLAMX_USER       default: EslaM-X
 *
 * Output:
 *   profile-data/metrics-history.json  — append-only time series
 *   assets/metrics.svg                 — adoption chart (rendered last 14 rows)
 */

const fs = require("fs");
const path = require("path");

const USER = process.env.ESLAMX_USER || "EslaM-X";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const DATA_DIR = path.join(__dirname, "..", "profile-data");
const OUT = path.join(__dirname, "..", "assets");
const HISTORY = path.join(DATA_DIR, "metrics-history.json");

/* Repos tracked for adoption. Flagship + OSS-archive + the profile itself. */
const TRACKED = [
  "robopay-go2-tier1",
  "robopay-spot-tier1",
  "ai-agent-automation-platform",
  "production-systems-lab",
  "robot-sim-policy-lab",
  "engineering-notes",
];

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "eslamx-adoption-metrics",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY, "utf8"));
  } catch (_) {
    return { repos: TRACKED, entries: [] };
  }
}

async function collect() {
  const date = today();
  const history = readHistory();
  if (history.entries && history.entries.some((e) => e.date === date)) {
    console.log(`metrics for ${date} already recorded — skipping`);
    return history;
  }
  if (!history.repos) history.repos = TRACKED;

  const snapshot = { date, repos: {} };
  for (const name of history.repos) {
    const row = { stars: 0, forks: 0, issues: 0, views: 0, clones: 0 };
    const meta = await fetchJson(`https://api.github.com/repos/${USER}/${name}`);
    if (meta) {
      row.stars = meta.stargazers_count || 0;
      row.forks = meta.forks_count || 0;
      row.issues = meta.open_issues_count || 0;
    }
    /* traffic endpoints: unauthenticated or missing → left at 0 */
    const views = await fetchJson(`https://api.github.com/repos/${USER}/${name}/traffic/views`);
    if (views) row.views = views.count || 0;
    const clones = await fetchJson(`https://api.github.com/repos/${USER}/${name}/traffic/clones`);
    if (clones) row.clones = clones.count || 0;
    snapshot.repos[name] = row;
    console.log(`✓ ${name} → ★${row.stars} ⑂${row.forks} 👁${row.views} ⬇${row.clones}`);
  }

  history.entries.push(snapshot);
  fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + "\n", "utf8");
  console.log(`metrics for ${date} appended (${history.entries.length} total rows)`);
  return history;
}

/* ------------------------------------------------------------------ */
/* metrics.svg — adoption chart: stars (bars) + views (line) per repo  */
/* over the last 14 recorded rows. Pure SMIL, no JS.                   */
/* ------------------------------------------------------------------ */
const C = { bg: "#0a0a0a", panel: "#131313", line: "#FFB62733", gold: "#FFB627", ember: "#FF6A00", text: "#e6e6e6", muted: "#8a8a8a" };

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderSvg(history) {
  const w = 920, h = 320, r = 18;
  const repos = history.repos || [];
  const rows = (history.entries || []).slice(-14);
  const chartW = 560, chartX = 330;
  const tableX = 30;
  const maxStars = Math.max(1, ...rows.flatMap((e) => repos.map((rn) => (e.repos[rn] || {}).stars || 0)));
  const maxViews = Math.max(1, ...rows.flatMap((e) => repos.map((rn) => (e.repos[rn] || {}).views || 0)));

  let starBars = "", viewLine = "", xp = [];
  if (rows.length > 0) {
    const slot = chartW / Math.max(1, rows.length);
    rows.forEach((e, i) => {
      const total = repos.reduce((s, rn) => s + (e.repos[rn] || {}).stars || 0, 0);
      const v = repos.reduce((s, rn) => s + (e.repos[rn] || {}).views || 0, 0);
      const bx = chartX + i * slot;
      const bh = (total / maxStars) * 120;
      starBars += `<rect x="${bx + slot * 0.2}" y="${170 - bh}" width="${slot * 0.6}" height="${bh}" rx="3" fill="${C.gold}" opacity="0.85">
        <title>${e.date} — total stars ${total}</title>
      </rect>`;
      const py = 168 - (v / maxViews) * 130;
      xp.push(`${bx + slot / 2},${py}`);
    });
  }
  if (xp.length > 1) {
    viewLine = `<polyline points="${xp.join(" ")}" fill="none" stroke="${C.ember}" stroke-width="2">
      <animate attributeName="stroke-dasharray" values="0 2000;2000 0" dur="2s" fill="freeze"/>
    </polyline>`;
  }

  let tableRows = "";
  const latest = rows[rows.length - 1] || { repos: {} };
  repos.forEach((rn, i) => {
    const cur = latest.repos[rn] || {};
    const y = 210 + i * 15;
    tableRows += `<text x="${tableX}" y="${y}" font-family="monospace" font-size="11" fill="${C.muted}">${rn}</text>
      <text x="225" y="${y}" font-family="monospace" font-size="11" fill="${C.text}" text-anchor="end">★ ${cur.stars || 0}</text>
      <text x="255" y="${y}" font-family="monospace" font-size="11" fill="${C.text}" text-anchor="end">⑂ ${cur.forks || 0}</text>
      <text x="285" y="${y}" font-family="monospace" font-size="11" fill="${C.text}" text-anchor="end">👁 ${cur.views || 0}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  <rect id="m_b" x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <text x="30" y="40" font-family="monospace" font-size="13" font-weight="700" letter-spacing="3" fill="${C.gold}">ADOPTION TELEMETRY</text>
  <text x="30" y="60" font-family="sans-serif" font-size="12" fill="${C.muted}">Daily stars + views across tracked public repos — last ${rows.length || 0} days</text>
  <line x1="330" y1="170" x2="890" y2="170" stroke="${C.line}"/>
  ${starBars}
  ${viewLine}
  <rect x="${tableX}" y="192" width="290" height="${repos.length * 15 + 8}" rx="8" fill="${C.panel}"/>
  <text x="${tableX}" y="204" font-family="monospace" font-size="10" letter-spacing="1" fill="${C.gold}">LATEST SNAPSHOT · ${esc(latest.date || "")}</text>
  ${tableRows}
  <text x="330" y="300" font-family="monospace" font-size="10" fill="${C.muted}">GOLD BARS: TOTAL STARS/DAY · ORANGE LINE: TOTAL VIEWS/DAY</text>
</svg>`;
}

(async () => {
  const history = await collect();
  fs.mkdirSync(OUT, { recursive: true });
  const svg = renderSvg(history);
  fs.writeFileSync(path.join(OUT, "metrics.svg"), svg, "utf8");
  console.log(`✓ metrics.svg (${Buffer.byteLength(svg)} bytes)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
