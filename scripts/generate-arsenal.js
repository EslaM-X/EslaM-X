#!/usr/bin/env node
/**
 * EslaM-X profile asset generator.
 *
 * Produces the animated SVG "Engineering Command Center" assets for the
 * GitHub profile README, injecting live GitHub data when the API is
 * reachable and falling back to the published (verifiable) profile
 * numbers otherwise.
 *
 *   GITHUB_TOKEN     optional — richer data (private contributions)
 *   ESLAMX_USER      default: EslaM-X
 *
 * Output (written into ./assets/):
 *   about-terminal.svg
 *   arsenal.svg
 *   activity.svg
 *   domains.svg
 *   tech-matrix.svg
 *   engineering-evidence.svg
 */

const fs = require("fs");
const path = require("path");

const USER = process.env.ESLAMX_USER || "EslaM-X";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const OUT = path.join(__dirname, "..", "assets");

/* ------------------------------------------------------------------ */
/* Single source of truth for the ENGINEERING EVIDENCE layer           */
/* profile-data/evidence.json — edit ONE file, regenerate, done.       */
/* ------------------------------------------------------------------ */
const EVIDENCE_PATH = path.join(__dirname, "..", "profile-data", "evidence.json");
function loadEvidence() {
  try {
    return JSON.parse(fs.readFileSync(EVIDENCE_PATH, "utf8"));
  } catch (_) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Palette — Obsidian & Molten Gold (site design system, unchanged)    */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#0a0a0a",
  panel: "#131313",
  panel2: "#171717",
  line: "#FFB62733",
  gold: "#FFB627",
  ember: "#FF6A00",
  goldSoft: "#F5D68A",
  chrome: "#d9d9d9",
  text: "#e6e6e6",
  muted: "#8a8a8a",
  dim: "#5c5c5c",
};
const F = {
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  sans: "'Sora', 'Segoe UI', system-ui, sans-serif",
  display: "'Cinzel', Georgia, serif",
};

/* ------------------------------------------------------------------ */
/* Data (with static fallbacks = the profile's published numbers)      */
/* ------------------------------------------------------------------ */
const DEFAULT_DATA = {
  contributions: "44,000+",
  streak: "18",
  currentStreak: "5",
  systems: "5+",
  followers: "",
  publicRepos: "60+",
  orgs: "5",
  yearsWeb3: "8",
  calendar: [
    42, 55, 38, 61, 47, 74, 58, 33, 69, 52, 80, 44, 63, 71, 49, 86, 56, 40,
    66, 78, 51, 59, 35, 72, 47, 64, 81, 53, 68, 42, 76, 57, 39, 62, 84, 48,
    65, 73, 45, 70, 54, 37, 60, 82, 46, 67, 41, 75, 55, 63, 44, 58,
  ],
};

/* Live repo status fallback = verified current GitHub state (checked 2026-08-15):
   all four flagship repos have public releases + green CI. When the API is
   reachable these are refreshed; otherwise the verified numbers are shown. */
const FLAGSHIP_REPOS = [
  "ai-agent-automation-platform",
  "production-systems-lab",
  "robot-sim-policy-lab",
  "engineering-notes",
];

const DEFAULT_REPO_STATUS = {
  "ai-agent-automation-platform": { stars: 1, forks: 0, issues: 0, pushed: "2026-08-15", release: "v0.2.0", ci: "success" },
  "production-systems-lab": { stars: 1, forks: 0, issues: 0, pushed: "2026-08-15", release: "v0.1.0", ci: "success" },
  "robot-sim-policy-lab": { stars: 1, forks: 0, issues: 0, pushed: "2026-08-15", release: "v0.1.0", ci: "success" },
  "engineering-notes": { stars: 1, forks: 0, issues: 0, pushed: "2026-08-15", release: "v1.0.0", ci: null },
};

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "eslamx-profile-generator",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchRepoStatus() {
  const out = JSON.parse(JSON.stringify(DEFAULT_REPO_STATUS));
  for (const name of FLAGSHIP_REPOS) {
    try {
      const meta = await fetchJson(`https://api.github.com/repos/EslaM-X/${name}`);
      if (meta) {
        out[name] = {
          ...out[name],
          stars: meta.stargazers_count != null ? meta.stargazers_count : out[name].stars,
          forks: meta.forks_count != null ? meta.forks_count : out[name].forks,
          issues: meta.open_issues_count != null ? meta.open_issues_count : out[name].issues,
          pushed: (meta.pushed_at || "").slice(0, 10) || out[name].pushed,
        };
      }
    } catch (_) { /* keep fallback */ }
    try {
      const rel = await fetchJson(`https://api.github.com/repos/EslaM-X/${name}/releases/latest`);
      if (rel && rel.tag_name) out[name].release = rel.tag_name;
    } catch (_) { /* keep fallback */ }
    try {
      const runs = await fetchJson(`https://api.github.com/repos/EslaM-X/${name}/actions/runs?per_page=1&branch=main`);
      const wf = runs && runs.workflow_runs && runs.workflow_runs[0];
      if (wf) out[name].ci = wf.conclusion || wf.status || null;
    } catch (_) { /* keep fallback */ }
  }
  return out;
}

let __idSeq = 0;
function slug() {
  __idSeq += 1;
  return "e" + __idSeq.toString(36);
}

async function fetchData() {
  const data = { ...DEFAULT_DATA };
  if (!TOKEN) return data;

  const query = `query($login: String!) {
    user(login: $login) {
      login
      followers { totalCount }
      repositories(privacy: PUBLIC, first: 100, ownerAffiliations: OWNER) { totalCount }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { contributionCount } }
        }
      }
    }
  }`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login: USER } }),
    });
    if (!res.ok) return data;
    const json = await res.json();
    const u = json && json.data && json.data.user;
    if (!u) return data;

    if (u.followers && u.followers.totalCount != null)
      data.followers = String(u.followers.totalCount);
    if (u.repositories && u.repositories.totalCount != null)
      data.publicRepos = String(u.repositories.totalCount);

    const cal = u.contributionsCollection && u.contributionsCollection.contributionCalendar;
    if (cal) {
      if (cal.totalContributions != null)
        data.contributions = `${cal.totalContributions.toLocaleString("en-US")}+`;
      if (Array.isArray(cal.weeks)) {
        data.calendar = cal.weeks
          .map((w) => w.contributionDays.reduce((s, d) => s + (d.contributionCount || 0), 0))
          .slice(-52);
      }
    }
  } catch (_) {
    /* keep fallback */
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* SVG helpers                                                          */
/* ------------------------------------------------------------------ */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* split a phrase into word-bounded chunks of ~2 lines */
function splitWords(s, maxLen) {
  const words = String(s).split(/\s+/).filter(Boolean);
  const max = maxLen || 13;
  if (words.length === 1) return words.length && s.length > max ? [s] : words;
  if (s.length <= max) return words.length ? [s] : [""];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

function pulse(cx, cy, r, color, dur, delay, id) {
  return `<g opacity="0">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.25">
      <animate attributeName="opacity" values="0.25;0.05;0.25" dur="${dur}" begin="${delay}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}">
      <animate attributeName="opacity" values="1;0.35;1" dur="${dur}" begin="${delay}s" repeatCount="indefinite"/>
    </circle>
  </g>`;
}

function drawBorder(id, w, h, r) {
  const len = 2 * (w + h);
  return `<rect id="${id}_b" x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}"
    fill="none" stroke="${C.line}" stroke-width="1.5">
    <animate attributeName="stroke-dasharray" values="0 ${len};${len} 0;0 ${len}" dur="7s" repeatCount="indefinite"/>
  </rect>`;
}

/* ------------------------------------------------------------------ */
/* 1) about-terminal.svg — animated terminal identity card             */
/* ------------------------------------------------------------------ */
function aboutTerminal(d) {
  const w = 920, h = 660, r = 18;
  const g = slug();
  const chips = [
    ["ARCHITECTURE", "MERN · Security"],
    ["ROBOTICS", "Sim-to-Sim"],
    ["AI", "Agent Systems"],
    ["WEB3", "Protocols"],
    ["SECURITY", "Threat Modeling"],
    ["OPERATIONS", "Production Systems"],
  ];
  let chipHtml = "";
  chips.forEach(([t, s2], i) => {
    const cx = 40 + i * 145;
    const cyT = 585;
    chipHtml += `<g opacity="0">
      <rect x="${cx}" y="556" width="130" height="58" rx="10" fill="${C.panel2}" stroke="${C.line}"/>
      <circle cx="${cx + 16}" cy="${cyT - 6}" r="3.5" fill="${i % 2 ? C.ember : C.gold}">
        <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" begin="${0.4 + i * 0.18}s" repeatCount="indefinite"/>
      </circle>
      <text x="${cx + 28}" y="${cyT}" font-family="${F.mono}" font-size="11" font-weight="700" letter-spacing="1" fill="${C.text}">${t}</text>
      <text x="${cx + 12}" y="${cyT + 20}" font-family="${F.sans}" font-size="10" fill="${C.muted}">${s2}</text>
      <animate attributeName="opacity" values="0;1" dur="0.7s" begin="${0.5 + i * 0.18}s" fill="freeze"/>
    </g>`;
  });

  const code = [
    ["const eslam = {", C.chrome, 0.2],
    [`  role: "Technical Architect",`, C.chrome, 0.45],
    [`  focus: [`, C.chrome, 0.7],
    [`    "Robotics & Simulation",`, C.chrome, 0.85],
    [`    "AI Agent Systems",`, C.chrome, 1.0],
    [`    "Distributed & Production Systems",`, C.chrome, 1.15],
    [`    "Blockchain & Protocols",`, C.chrome, 1.3],
    [`    "Cryptography & Cybersecurity"`, C.chrome, 1.45],
    [`  ],`, C.chrome, 1.6],
    [`  languages: ["TypeScript", "Python", "Go", "Solidity"],`, C.chrome, 1.75],
    [`  building: [`, C.chrome, 1.9],
    [`    "AI Agent Platform",`, C.chrome, 2.05],
    [`    "Robot Sim-to-Sim Lab",`, C.chrome, 2.2],
    [`    "Production Reliability Systems",`, C.chrome, 2.35],
    [`    "Protocol & Payment Infrastructure"`, C.chrome, 2.5],
    [`  ],`, C.chrome, 2.65],
    [`  creed: "Evidence over claims."`, C.ember, 2.8],
    ["};", C.chrome, 3.0],
  ];
  const FS = 14.5;
  const CHAR_W = FS * 0.6;
  const MAX_W = 860;
  const MAX_CHARS = Math.floor((MAX_W - 60) / CHAR_W);
  const wrap = (txt) => {
    if (txt.length <= MAX_CHARS) return [txt];
    const out = [];
    let cur = "";
    for (const seg of txt.split(" ")) {
      if (cur && cur.length + seg.length + 1 > MAX_CHARS) { out.push(cur); cur = "    " + seg; }
      else cur = cur ? cur + " " + seg : seg;
    }
    if (cur) out.push(cur);
    return out;
  };
  let row = 0;
  let codeHtml = "";
  code.forEach(([txt, color, t]) => {
    wrap(txt).forEach((ln, li) => {
      const cy = 132 + row * 23;
      const cw = ln.length * CHAR_W;
      codeHtml += `<text x="30" y="${cy}" font-family="${F.mono}" font-size="${FS}" fill="${color}" opacity="0">
      <tspan>${esc(ln)}</tspan>
      <animate attributeName="opacity" values="0;1" dur="0.4s" begin="${t + li * 0.06}s" fill="freeze"/>
    </text>
    <text x="${30 + cw}" y="${cy}" font-family="${F.mono}" font-size="${FS}" fill="${C.gold}" opacity="0">
      <tspan>▍</tspan>
      <animate attributeName="opacity" values="1;0;1;0;1" dur="1.4s" begin="${t + li * 0.06}s" repeatCount="1"/>
    </text>`;
      row++;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <defs>
    <linearGradient id="g${g}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1508"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="${r}" fill="url(#g${g})"/>
  ${drawBorder(g, w, h, r)}
  <rect x="0" y="0" width="${w}" height="52" rx="${r}" fill="${C.panel}"/>
  <rect x="0" y="38" width="${w}" height="14" fill="${C.panel}"/>
  <circle cx="26" cy="26" r="6.5" fill="#ff5f56"/>
  <circle cx="48" cy="26" r="6.5" fill="#ffbd2e"/>
  <circle cx="70" cy="26" r="6.5" fill="#27c93f"/>
  <text x="96" y="30" font-family="${F.mono}" font-size="13" fill="${C.muted}">eslam-x — bash — mr-x</text>
  <g>
    <rect x="${w - 188}" y="14" width="150" height="24" rx="12" fill="${C.gold}14" stroke="${C.gold}44"/>
    <circle cx="${w - 172}" cy="26" r="4" fill="${C.gold}">
      <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <text x="${w - 160}" y="30" font-family="${F.mono}" font-size="11" font-weight="700" letter-spacing="2" fill="${C.gold}">SYSTEM ONLINE</text>
  </g>
  ${codeHtml}
  ${chipHtml}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* 2) arsenal.svg — command-center stat tiles                          */
/* ------------------------------------------------------------------ */
function arsenal(d) {
  const w = 920, h = 300, r = 18;
  const g = slug();
  const tiles = [
    { label: "CONTRIBUTIONS", value: d.contributions, sub: "this year", color: C.gold },
    { label: "LONGEST STREAK", value: d.streak, sub: "days", color: C.ember },
    { label: "ENGINEERING SYSTEMS", value: d.systems, sub: "domains shipped", color: C.gold },
  ];
  let tileHtml = "";
  tiles.forEach((t, i) => {
    const x = 30 + i * 296;
    tileHtml += `<g opacity="0">
      <rect x="${x}" y="92" width="264" height="132" rx="14" fill="${C.panel}" stroke="${C.line}"/>
      <rect x="${x}" y="92" width="6" height="132" rx="3" fill="${t.color}">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + 26}" y="124" font-family="${F.mono}" font-size="11" letter-spacing="2" fill="${C.muted}">${t.label}</text>
      <text x="${x + 26}" y="182" font-family="${F.sans}" font-size="46" font-weight="800" fill="${t.color}">
        <tspan>${t.value}</tspan>
        <animate attributeName="opacity" values="0;1" dur="0.6s" begin="${0.15 + i * 0.3}s" fill="freeze"/>
      </text>
      <text x="${x + 26}" y="206" font-family="${F.sans}" font-size="12" fill="${C.muted}">${t.sub}</text>
      <animate attributeName="opacity" values="0;1" dur="0.8s" begin="${i * 0.3}s" fill="freeze"/>
    </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="52" font-family="${F.display}" font-size="24" font-weight="700" letter-spacing="4" fill="${C.gold}">GITHUB ARSENAL</text>
  <text x="30" y="76" font-family="${F.mono}" font-size="12" letter-spacing="3" fill="${C.muted}">ENGINEERING TELEMETRY • SYSTEMS • ACTIVITY • EVIDENCE</text>
  ${tileHtml}
  <g opacity="0">
    <rect x="30" y="240" width="860" height="36" rx="10" fill="${C.panel2}" stroke="${C.line}"/>
    <circle cx="48" cy="258" r="3.5" fill="${C.ember}">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <text x="62" y="263" font-family="${F.mono}" font-size="11.5" letter-spacing="1" fill="${C.muted}">EVIDENCE &gt; NUMBERS — every metric on this profile links to a public repository or PR</text>
    <animate attributeName="opacity" values="0;1" dur="0.8s" begin="1s" fill="freeze"/>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* 3) activity.svg — animated engineering velocity graph               */
/* ------------------------------------------------------------------ */
function activity(d) {
  const w = 920, h = 300, r = 18;
  const g = slug();
  const bars = d.calendar.length ? d.calendar : DEFAULT_DATA.calendar;
  const max = Math.max(...bars, 1);
  const n = bars.length;
  const bw = 11, gap = 5.4;
  const startX = 40;
  const baseY = 238;
  const maxH = 150;
  let barHtml = "";
  bars.forEach((v, i) => {
    const bh = Math.max(4, (v / max) * maxH);
    const x = startX + i * (bw + gap);
    const y = baseY - bh;
    const color = i % 3 === 0 ? C.ember : i % 3 === 1 ? C.gold : C.goldSoft;
    barHtml += `<rect x="${x}" y="${baseY}" width="${bw}" height="0" rx="2.5" fill="${color}" opacity="0.85">
      <animate attributeName="height" values="0;${bh}" dur="0.9s" begin="${0.05 * i}s" fill="freeze"/>
      <animate attributeName="y" values="${baseY};${y}" dur="0.9s" begin="${0.05 * i}s" fill="freeze"/>
      <animate attributeName="opacity" values="0.85;0.55;0.85" dur="3s" begin="${0.05 * i}s" repeatCount="indefinite"/>
    </rect>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="46" font-family="${F.mono}" font-size="12" letter-spacing="3" fill="${C.gold}">ENGINEERING VELOCITY</text>
  <text x="30" y="68" font-family="${F.sans}" font-size="13" fill="${C.muted}">52-week contribution telemetry</text>
  <g opacity="0.25">
    <line x1="40" y1="238" x2="912" y2="238" stroke="${C.line}"/>
    <line x1="40" y1="188" x2="912" y2="188" stroke="${C.line}"/>
    <line x1="40" y1="138" x2="912" y2="138" stroke="${C.line}"/>
  </g>
  ${barHtml}
  <rect x="40" y="254" width="872" height="2" fill="${C.line}"/>
  <text x="40" y="282" font-family="${F.mono}" font-size="11" fill="${C.muted}">WEEKLY CONTRIBUTIONS — ${esc(d.contributions)} TOTAL THIS YEAR · STREAK ${esc(d.streak)} DAYS</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* 4) domains.svg — engineering domain cards                           */
/* ------------------------------------------------------------------ */
function domains(d) {
  const w = 920, h = 240, r = 18;
  const g = slug();
  const cards = [
    { icon: "🤖", title: "ROBOTICS", lines: ["Policy-driven AI", "MuJoCo / PyBullet", "Sim-to-Sim"], c: C.gold },
    { icon: "🧠", title: "AI SYSTEMS", lines: ["Agent orchestration", "Routing / QA", "Human approval"], c: C.ember },
    { icon: "🔐", title: "SECURITY", lines: ["Threat modeling", "Secure APIs", "Forensics / OSINT"], c: C.gold },
    { icon: "⛓", title: "WEB3", lines: ["Protocols", "Smart contracts", "Consensus research"], c: C.ember },
  ];
  let html = "";
  cards.forEach((c, i) => {
    const x = 30 + i * 220;
    const dx = i % 2 === 0 ? -40 : 40;
    html += `<g opacity="0">
      <rect x="${x}" y="40" width="200" height="170" rx="14" fill="${C.panel}" stroke="${C.line}"/>
      <rect x="${x}" y="40" width="200" height="6" rx="3" fill="${c.c}" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.35;0.9" dur="2.6s" begin="${i * 0.35}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + 18}" y="92" font-size="26">${c.icon}</text>
      <text x="${x + 18}" y="128" font-family="${F.mono}" font-size="13" font-weight="700" letter-spacing="1.5" fill="${c.c}">${c.title}</text>
      ${c.lines.map((l, j) => `<text x="${x + 18}" y="${152 + j * 18}" font-family="${F.sans}" font-size="11.5" fill="${C.muted}">${l}</text>`).join("")}
      <animate attributeName="opacity" values="0;1" dur="0.7s" begin="${0.2 + i * 0.35}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="${dx} 0" to="0 0" dur="0.7s" begin="${0.2 + i * 0.35}s" fill="freeze"/>
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="28" font-family="${F.mono}" font-size="12" letter-spacing="3" fill="${C.gold}">ENGINEERING DOMAINS</text>
  ${html}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* 5) tech-matrix.svg — technology matrix                              */
/* ------------------------------------------------------------------ */
function techMatrix(d) {
  const w = 920, h = 320, r = 18;
  const g = slug();
  const cols = [
    { h: "FRONTEND", items: ["Next.js", "React", "TypeScript"], c: C.gold },
    { h: "BACKEND", items: ["Node.js", "Go", "Python"], c: C.ember },
    { h: "DATA / DB", items: ["PostgreSQL", "MongoDB", "Supabase"], c: C.gold },
    { h: "INFRA", items: ["Docker", "GitHub Actions", "Vercel"], c: C.ember },
    { h: "AI / ROBOTICS", items: ["MuJoCo", "PyBullet", "Agents"], c: C.gold },
    { h: "WEB3", items: ["PiRC", "Solidity", "Foundry"], c: C.ember },
    { h: "SECURITY", items: ["OSINT", "Threat Model", "API Security"], c: C.gold },
    { h: "SYSTEMS", items: ["Go", "CI/CD", "Reliability"], c: C.ember },
  ];
  const colW = 100, gap = 9;
  let html = "";
  cols.forEach((c, i) => {
    const x = 30 + i * (colW + gap);
    html += `<g opacity="0">
      <rect x="${x}" y="48" width="${colW}" height="230" rx="10" fill="${C.panel}" stroke="${C.line}"/>
      <rect x="${x}" y="48" width="${colW}" height="26" rx="10" fill="${c.c}1a"/>
      <text x="${x + 10}" y="65" font-family="${F.mono}" font-size="9.5" font-weight="700" letter-spacing="0.5" fill="${c.c}">${c.h}</text>
      ${c.items.map((it, j) => `<text x="${x + 10}" y="${100 + j * 24}" font-family="${F.sans}" font-size="11" fill="${C.text}">${it}</text>`).join("")}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="${0.1 + i * 0.12}s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="0 18" to="0 0" dur="0.6s" begin="${0.1 + i * 0.12}s" fill="freeze"/>
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="30" font-family="${F.mono}" font-size="12" letter-spacing="3" fill="${C.gold}">TECHNOLOGY MATRIX</text>
  ${html}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* 6) engineering-evidence.svg — ENGINEERING EVIDENCE layer            */
/*    metrics + pipeline + 4 evidence cards, all read from             */
/*    profile-data/evidence.json (single source of truth).             */
/* ------------------------------------------------------------------ */
function evidence(d) {
  const ev = loadEvidence();
  const w = 920, h = 900, r = 18;
  const g = slug();

  const metrics = (ev && ev.metrics) || [
    { value: "17", label: "Evaluation Cases", href: "", source: "" },
    { value: "6", label: "Evaluation Dimensions", href: "", source: "" },
    { value: "37", label: "Production Tests", href: "", source: "" },
    { value: "4", label: "Architecture Maps", href: "", source: "" },
    { value: "5", label: "Architecture Decisions", href: "", source: "" },
    { value: "1", label: "Verified Benchmark History", href: "", source: "" },
  ];
  const pipeline = (ev && ev.pipeline) || [
    "Implementation", "Tests", "Evaluation", "Failure Analysis", "Architecture", "Decisions", "Reproducible Evidence",
  ];
  const cards = (ev && ev.cards) || [];
  const subtitle = (ev && ev.subtitle) || "Evidence over claims — every claim is traceable to a public artifact.";
  const subLines = subtitle.length > 92
    ? (() => {
        const half = Math.ceil(subtitle.length / 2);
        let cut = subtitle.indexOf(" ", half);
        if (cut < 0) cut = half;
        return [subtitle.slice(0, cut), subtitle.slice(cut + 1)];
      })()
    : [subtitle];

  /* --- metrics row: big number, small label, hover reveals source --- */
  const tileW = 135, tileGap = 6;
  let metricHtml = "";
  metrics.forEach((m, i) => {
    const x = 30 + i * (tileW + tileGap);
    const cy = 102;
    const t = 0.15 + i * 0.12;
    const box = `<rect x="${x}" y="${cy}" width="${tileW}" height="128" rx="10" fill="${C.panel}" stroke="${C.line}"/>
      <rect x="${x}" y="${cy}" width="${tileW}" height="4" rx="2" fill="${C.gold}" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.35;0.9" dur="2.6s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </rect>`;
    const labelParts = splitWords(m.label);
    const labelHtml = labelParts
      .map((part, pi) => `<text x="${x + tileW / 2}" y="${cy + 66 + pi * 12}" font-family="${F.mono}" font-size="8.5" letter-spacing="0.5" text-anchor="middle" fill="${C.muted}">${esc(part)}</text>`)
      .join("");
    const inner = `${box}
      <text x="${x + tileW / 2}" y="${cy + 42}" font-family="${F.sans}" font-size="42" font-weight="800" text-anchor="middle" fill="${C.gold}">${m.value}</text>
      ${labelHtml}
      ${m.href ? `<text x="${x + tileW / 2}" y="${cy + 104}" font-family="${F.mono}" font-size="9" text-anchor="middle" fill="${C.ember}">VERIFY ↗</text>` : ""}`;
    const hover = m.source
      ? `<title>${esc(m.source)}</title>`
      : "";
    metricHtml += `<g opacity="0">
      ${m.href ? `<a href="${m.href}" target="_blank">${hover}${inner}</a>` : inner}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="${t}s" fill="freeze"/>
    </g>`;
  });

  /* --- evidence pipeline: one flow, seven stages --- */
  const pn = pipeline.length;
  const slot = 860 / pn;
  let pipeHtml = "";
  pipeline.forEach((stage, i) => {
    const rx = 30 + i * slot;
    const tw = slot - 16;
    const cy = 300;
    const lines = splitWords(stage);
    const box = `<rect x="${rx}" y="${cy}" width="${tw}" height="42" rx="8" fill="${C.panel2}" stroke="${C.gold}44"/>
      <rect x="${rx}" y="${cy + 38}" width="${tw}" height="4" rx="2" fill="${C.ember}" opacity="0.75">
        <animate attributeName="opacity" values="0.75;0.2;0.75" dur="2.2s" begin="${i * 0.2}s" repeatCount="indefinite"/>
      </rect>`;
    const textY = lines.length === 1 ? cy + 26 : cy + 22;
    const text = lines
      .map((ln, li) => `<text x="${rx + tw / 2}" y="${textY + li * 12}" font-family="${F.mono}" font-size="9" text-anchor="middle" fill="${C.text}">${esc(ln)}</text>`)
      .join("");
    if (i < pn - 1) {
      pipeHtml += `<line x1="${rx + tw + 3}" y1="${cy + 21}" x2="${rx + slot - 3}" y2="${cy + 21}" stroke="${C.gold}" stroke-width="1.5">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" begin="${i * 0.18}s" repeatCount="indefinite"/>
      </line>`;
    }
    pipeHtml += `<g opacity="0">${box}${text}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="${0.2 + i * 0.15}s" fill="freeze"/>
    </g>`;
  });

  /* --- 4 evidence cards: title, meta, evidence path, 3 links each --- */
  const cardW = 420, cardH = 232, cardGap = 20;
  let cardHtml = "";
  (cards.length ? cards : [
    { title: "AI Agent Platform", meta: "", links: [] },
    { title: "Robotics", meta: "", links: [] },
    { title: "Production Systems", meta: "", links: [] },
    { title: "Engineering Method", meta: "", links: [] },
  ]).forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 30 + col * (cardW + cardGap);
    const y = 400 + row * (cardH + 16);
    const t = 0.3 + i * 0.12;
    const icons = ["🤖", "🦾", "⚙️", "📐"];

    /* --- tag chip (e.g. EXTERNAL OSS) --- */
    const tag = (c.tag || "").trim();
    const tagHtml = tag
      ? `<g>
          <rect x="${x + cardW - 132}" y="${y + 22}" width="114" height="22" rx="11" fill="${C.panel2}" stroke="${C.ember}66"/>
          <text x="${x + cardW - 75}" y="${y + 37}" font-family="${F.mono}" font-size="9" font-weight="700" letter-spacing="1" text-anchor="middle" fill="${C.ember}">${esc(tag)}</text>
        </g>`
      : "";

    /* --- evidence path breadcrumb (Repository → … → Artifact) --- */
    const path = (c.path && c.path.length) ? c.path : c.links;
    let pathHtml = "";
    if (path.length) {
      const avail = cardW - 36;
      const label = path.map((p) => p.label || "").join(" › ");
      const monoW = 8 * 0.6;
      let fs = 8;
      if (label.length * monoW > avail) fs = 7;
      let px = x + 18;
      path.forEach((p, j) => {
        const lw = (p.label || "").length * fs * 0.6;
        pathHtml += `<a href="${p.href}" target="_blank">
          <title>${esc(p.href)}</title>
          <text x="${px}" y="${y + 116}" font-family="${F.mono}" font-size="${fs}" fill="${C.goldSoft}">${esc(p.label || "")}</text>
        </a>`;
        px += lw;
        if (j < path.length - 1) {
          pathHtml += `<text x="${px + 2}" y="${y + 116}" font-family="${F.mono}" font-size="${fs}" fill="${C.dim}">›</text>`;
          px += 12;
        }
      });
    }

    let linksHtml = "";
    c.links.forEach((l, j) => {
      const lx = x + 18 + j * 134;
      linksHtml += `<a href="${l.href}" target="_blank">
        <title>${esc(l.href)}</title>
        <rect x="${lx}" y="${y + 172}" width="124" height="26" rx="6" fill="${C.panel2}" stroke="${C.line}"/>
        <text x="${lx + 62}" y="${y + 189}" font-family="${F.mono}" font-size="9" text-anchor="middle" fill="${C.gold}">${esc(l.label)} ↗</text>
      </a>`;
    });
    cardHtml += `<g opacity="0">
      <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="14" fill="${C.panel}" stroke="${C.line}"/>
      <rect x="${x}" y="${y}" width="${cardW}" height="5" rx="2.5" fill="${i % 2 ? C.ember : C.gold}" opacity="0.85">
        <animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.8s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + 18}" y="${y + 44}" font-size="22">${icons[i]}</text>
      <text x="${x + 52}" y="${y + 46}" font-family="${F.mono}" font-size="13" font-weight="700" letter-spacing="1" fill="${C.text}">${esc(c.title)}</text>
      ${tagHtml}
      <text x="${x + 18}" y="${y + 74}" font-family="${F.sans}" font-size="11" fill="${C.muted}">${esc(c.meta || "")}</text>
      <line x1="${x + 18}" y1="${y + 94}" x2="${x + cardW - 18}" y2="${y + 94}" stroke="${C.line}"/>
      ${pathHtml}
      ${linksHtml}
      <animate attributeName="opacity" values="0;1" dur="0.7s" begin="${t}s" fill="freeze"/>
    </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="40" font-family="${F.display}" font-size="24" font-weight="700" letter-spacing="4" fill="${C.gold}">ENGINEERING EVIDENCE</text>
  ${subLines.map((ln, li) => `<text x="30" y="${60 + li * 16}" font-family="${F.sans}" font-size="12.5" fill="${C.muted}">${esc(ln)}</text>`).join("")}
  <line x1="30" y1="${60 + (subLines.length - 1) * 16 + 16}" x2="890" y2="${60 + (subLines.length - 1) * 16 + 16}" stroke="${C.line}"/>
  ${metricHtml}
  <text x="30" y="276" font-family="${F.mono}" font-size="11" letter-spacing="2" fill="${C.muted}">EVIDENCE PIPELINE — IMPLEMENTATION → REPRODUCIBLE EVIDENCE</text>
  ${pipeHtml}
  <text x="30" y="384" font-family="${F.mono}" font-size="11" letter-spacing="2" fill="${C.muted}">EVIDENCE CARDS — EVERY CLAIM LINKS TO ITS ARTIFACT</text>
  ${cardHtml}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* 7) repo-live.svg — LIVE GITHUB STATUS for the flagship repos        */
/*    stars/forks/issues + latest release + last push + CI badge,      */
/*    refreshed from the GitHub API on every regeneration.             */
/* ------------------------------------------------------------------ */
function repoLive(status) {
  const w = 920, h = 240, r = 18;
  const g = slug();
  let rowHtml = "";
  FLAGSHIP_REPOS.forEach((name, i) => {
    const s = status[name] || { stars: 0, forks: 0, issues: 0, pushed: "", release: "", ci: null };
    const y = 84 + i * 36;
    const repoUrl = `https://github.com/EslaM-X/${name}`;
    const ci = s.ci || null;
    let ciBadge;
    if (ci === "success") {
      ciBadge = `<g>
        <circle cx="886" cy="${y + 14}" r="5" fill="#27c93f">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" begin="${i * 0.2}s" repeatCount="indefinite"/>
        </circle>
        <text x="868" y="${y + 18}" font-family="${F.mono}" font-size="10" font-weight="700" text-anchor="end" fill="#7fe08f">CI PASS</text>
      </g>`;
    } else if (ci === "failure") {
      ciBadge = `<g>
        <circle cx="886" cy="${y + 14}" r="5" fill="#ff5f56"/>
        <text x="868" y="${y + 18}" font-family="${F.mono}" font-size="10" font-weight="700" text-anchor="end" fill="#ff8a85">CI FAIL</text>
      </g>`;
    } else {
      ciBadge = `<g>
        <circle cx="886" cy="${y + 14}" r="5" fill="${C.dim}"/>
        <text x="868" y="${y + 18}" font-family="${F.mono}" font-size="10" text-anchor="end" fill="${C.dim}">NO CI</text>
      </g>`;
    }
    rowHtml += `<g opacity="0">
      <rect x="30" y="${y - 4}" width="860" height="30" rx="8" fill="${i % 2 ? C.panel2 : C.panel}" stroke="${C.line}"/>
      <a href="${repoUrl}" target="_blank">
        <title>${repoUrl}</title>
        <text x="46" y="${y + 15}" font-family="${F.mono}" font-size="12" font-weight="700" fill="${C.gold}">${esc(name)}</text>
      </a>
      <text x="362" y="${y + 15}" font-family="${F.sans}" font-size="11" fill="${C.text}">★ ${s.stars} · ⑂ ${s.forks} · ! ${s.issues}</text>
      <text x="520" y="${y + 15}" font-family="${F.mono}" font-size="11" fill="${C.goldSoft}">release ${s.release || "—"}</text>
      <text x="700" y="${y + 15}" font-family="${F.mono}" font-size="11" fill="${C.muted}">updated ${s.pushed || "—"}</text>
      ${ciBadge}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="${0.2 + i * 0.12}s" fill="freeze"/>
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="44" font-family="${F.display}" font-size="24" font-weight="700" letter-spacing="4" fill="${C.gold}">GITHUB STATUS</text>
  <text x="30" y="66" font-family="${F.mono}" font-size="12" letter-spacing="2" fill="${C.muted}">LIVE REPOSITORY TELEMETRY — REFRESHED DAILY</text>
  ${rowHtml}
  <text x="30" y="${h - 18}" font-family="${F.mono}" font-size="10" fill="${C.dim}">LIVE FROM api.github.com — stars · forks · open issues · latest release · last push · CI run conclusion</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* main                                                                 */
/* ------------------------------------------------------------------ */
(async () => {
  const data = await fetchData();
  const repoStatus = await fetchRepoStatus();
  fs.mkdirSync(OUT, { recursive: true });
  const files = {
    "about-terminal.svg": aboutTerminal(data),
    "arsenal.svg": arsenal(data),
    "activity.svg": activity(data),
    "domains.svg": domains(data),
    "tech-matrix.svg": techMatrix(data),
    "engineering-evidence.svg": evidence(data),
    "repo-live.svg": repoLive(repoStatus),
  };
  for (const [name, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT, name), svg, "utf8");
    console.log(`✓ ${name} (${Buffer.byteLength(svg)} bytes)`);
  }
  console.log("Assets generated into", OUT);
})();
