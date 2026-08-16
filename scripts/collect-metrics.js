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
/*                                                                    */
/* Scaling is correct: bars scale against the MAX TOTAL stars/day,     */
/* the views line against MAX TOTAL views/day — never per-repo max.    */
/* Zero-data days and single-row histories are handled without         */
/* overflowing the canvas.                                             */
/* ------------------------------------------------------------------ */
const C = { bg: "#0a0a0a", panel: "#131313", line: "#FFB62733", gold: "#FFB627", ember: "#FF6A00", text: "#e6e6e6", muted: "#8a8a8a", dim: "#5c5c5c" };

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textWidth(s, size, mono) {
  let w = 0;
  for (const ch of String(s)) {
    w += /[\u{1F300}-\u{1FAFF}\u{2705}]/u.test(ch) ? size * 1.2 : size * (mono ? 0.6 : 0.55);
  }
  return w;
}

function fit(s, size, maxW, mono) {
  let out = String(s);
  if (textWidth(out, size, mono) <= maxW) return out;
  while (out.length > 1 && textWidth(out + "…", size, mono) > maxW) out = out.slice(0, -1);
  return out + "…";
}

function shortDate(iso) {
  return String(iso || "").slice(5); /* "2026-08-16" → "08-16" */
}

function renderSvg(history) {
  const w = 920, h = 340, r = 18;
  const repos = history.repos || [];
  const rows = (history.entries || []).slice(-14);

  /* --- chart geometry (right side) --- */
  const chartX = 330, chartW = 560, chartRight = chartX + chartW;
  const baseY = 210;        /* x-axis baseline */
  const topY = 70;          /* top of the tallest bar */
  const plotH = baseY - topY;

  /* --- table geometry (left side) --- */
  const tableX = 30, tableW = 290, tableH = 190, tableY = 78;

  /* aggregate stars/views per day — bars use TOTALS, not per-repo max */
  const days = rows.map((e) => ({
    date: e.date,
    stars: repos.reduce((sum, rn) => sum + ((e.repos[rn] || {}).stars || 0), 0),
    views: repos.reduce((sum, rn) => sum + ((e.repos[rn] || {}).views || 0), 0),
  }));
  const maxStars = Math.max(1, ...days.map((d) => d.stars));
  const maxViews = Math.max(1, ...days.map((d) => d.views));

  /* --- y-axis gridlines + labels (scaled to total stars) --- */
  let grid = "";
  for (let gi = 0; gi <= 3; gi++) {
    const gy = baseY - (plotH * gi) / 3;
    const label = gi === 3 ? "0" : gi === 0 ? `${maxStars}` : `${Math.round((maxStars * gi) / 3)}`;
    grid += `<line x1="${chartX}" y1="${gy}" x2="${chartRight}" y2="${gy}" stroke="${C.line}" stroke-dasharray="${gi === 0 ? "0" : "2 5"}"/>
      <text x="${chartX - 8}" y="${gy + 3}" font-family="monospace" font-size="9" text-anchor="end" fill="${C.dim}">${label}</text>`;
  }

  /* --- bars (total stars/day) + views line (total views/day) --- */
  let barHtml = "", viewHtml = "", xp = [];
  const slot = chartW / Math.max(1, days.length);
  const barW = Math.min(slot * 0.5, 34);
  days.forEach((d, i) => {
    const cx = chartX + i * slot + slot / 2;
    const bh = d.stars === 0 ? 0 : Math.max(3, (d.stars / maxStars) * plotH);
    barHtml += `<rect x="${cx - barW / 2}" y="${baseY - bh}" width="${barW}" height="${bh}" rx="3" fill="${C.gold}" opacity="0.85">
      <title>${esc(d.date)} — total stars ${d.stars} (${maxStars})</title>
      <animate attributeName="opacity" values="0.85;0.5;0.85" dur="3s" begin="${i * 0.15}s" repeatCount="indefinite"/>
    </rect>`;
    const py = baseY - (d.views / maxViews) * plotH;
    xp.push(`${cx},${py}`);
    viewHtml += `<circle cx="${cx}" cy="${py}" r="3" fill="${C.ember}">
      <title>${esc(d.date)} — total views ${d.views}</title>
    </circle>`;
    /* date label under the axis — every slot, no overlap at this size */
    barHtml += `<text x="${cx}" y="${baseY + 14}" font-family="monospace" font-size="8.5" text-anchor="middle" fill="${C.muted}">${shortDate(d.date)}</text>`;
  });
  if (xp.length > 1) {
    viewHtml = `<polyline points="${xp.join(" ")}" fill="none" stroke="${C.ember}" stroke-width="2">
      <animate attributeName="stroke-dasharray" values="0 2000;2000 0" dur="2s" fill="freeze"/>
    </polyline>` + viewHtml;
  }

  /* --- latest snapshot table: fixed columns + truncation --- */
  const latest = rows[rows.length - 1] || { date: "", repos: {} };
  const col = { repoX: tableX + 16, starX: 198, forkX: 228, viewX: 258, cloneX: 288 };
  let tableRows = "";
  repos.forEach((rn, i) => {
    const cur = latest.repos[rn] || { stars: 0, forks: 0, views: 0, clones: 0 };
    const y = tableY + 44 + i * 20;
    tableRows += `<a href="https://github.com/EslaM-X/${rn}" target="_blank">
      <title>${esc(rn)} — ★ ${cur.stars} · ⑂ ${cur.forks} · 👁 ${cur.views} · ⬇ ${cur.clones}</title>
      <text x="${col.repoX}" y="${y}" font-family="monospace" font-size="10.5" fill="${C.gold}">${esc(fit(rn, 10.5, col.starX - col.repoX - 8, true))}</text>
    </a>
    <text x="${col.starX}" y="${y}" font-family="monospace" font-size="10.5" fill="${C.text}" text-anchor="end">★ ${cur.stars}</text>
    <text x="${col.forkX}" y="${y}" font-family="monospace" font-size="10.5" fill="${C.text}" text-anchor="end">⑂ ${cur.forks}</text>
    <text x="${col.viewX}" y="${y}" font-family="monospace" font-size="10.5" fill="${C.text}" text-anchor="end">👁 ${cur.views}</text>
    <text x="${col.cloneX}" y="${y}" font-family="monospace" font-size="10.5" fill="${C.muted}" text-anchor="end">⬇ ${cur.clones}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  <rect id="m_b" x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <text x="30" y="40" font-family="monospace" font-size="13" font-weight="700" letter-spacing="3" fill="${C.gold}">ADOPTION TELEMETRY</text>
  <text x="30" y="60" font-family="sans-serif" font-size="12" fill="${C.muted}">Daily stars + views across public repos · last ${rows.length || 0} day(s)</text>

  <!-- latest snapshot -->
  <rect x="${tableX}" y="${tableY}" width="${tableW}" height="${tableH}" rx="10" fill="${C.panel}" stroke="${C.line}"/>
  <text x="${tableX + 16}" y="${tableY + 20}" font-family="monospace" font-size="10" font-weight="700" letter-spacing="1" fill="${C.gold}">LATEST SNAPSHOT · ${esc(shortDate(latest.date))}</text>
  <line x1="${tableX + 16}" y1="${tableY + 30}" x2="${tableX + tableW - 16}" y2="${tableY + 30}" stroke="${C.line}"/>
  <text x="${col.repoX}" y="${tableY + 40}" font-family="monospace" font-size="8.5" letter-spacing="1" fill="${C.dim}">REPOSITORY</text>
  <text x="${col.starX}" y="${tableY + 40}" font-family="monospace" font-size="8.5" letter-spacing="1" text-anchor="end" fill="${C.dim}">STARS</text>
  <text x="${col.forkX}" y="${tableY + 40}" font-family="monospace" font-size="8.5" letter-spacing="1" text-anchor="end" fill="${C.dim}">FORKS</text>
  <text x="${col.viewX}" y="${tableY + 40}" font-family="monospace" font-size="8.5" letter-spacing="1" text-anchor="end" fill="${C.dim}">VIEWS</text>
  <text x="${col.cloneX}" y="${tableY + 40}" font-family="monospace" font-size="8.5" letter-spacing="1" text-anchor="end" fill="${C.dim}">CLONES</text>
  ${tableRows}

  <!-- adoption chart -->
  <text x="${chartRight}" y="62" font-family="monospace" font-size="9" letter-spacing="1" text-anchor="end" fill="${C.muted}">GOLD: TOTAL STARS/DAY · ORANGE: TOTAL VIEWS/DAY</text>
  ${grid}
  ${barHtml}
  ${viewHtml}
  <line x1="${chartX}" y1="${baseY}" x2="${chartRight}" y2="${baseY}" stroke="${C.line}"/>

  <text x="30" y="${h - 16}" font-family="monospace" font-size="10" fill="${C.muted}">SNAPSHOT: ${esc(latest.date || "—")} · chart auto-scales per day · hover a row/bar for raw numbers · source: api.github.com</text>
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
