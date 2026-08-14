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

function slug() {
  return Math.random().toString(36).slice(2, 10);
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

function pulse(cx, cy, r, color, dur, delay, id) {
  const g = slug();
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
  const g = slug();
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
  const w = 920, h = 560, r = 18;
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
    const cyT = 481;
    chipHtml += `<g opacity="0">
      <rect x="${cx}" y="452" width="130" height="58" rx="10" fill="${C.panel2}" stroke="${C.line}"/>
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
    [`  role: "Lead Technical Architect",`, C.chrome, 0.45],
    [`  focus: ["Robotics & simulation", "AI agent orchestration", "Payment reliability", "Web3 protocols", "Security & forensics"],`, C.chrome, 0.7],
    [`  stack: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "Docker"],`, C.chrome, 0.95],
    [`  languages: ["TypeScript", "Python", "Go", "Solidity"],`, C.chrome, 1.2],
    [`  building: ["RoboPay Go2 Tier-1", "Robot sim-to-sim lab", "AI agent platform", "Go production patterns"],`, C.chrome, 1.45],
    [`  contributing: ["Pi Network", "Stellar", "Fabric Foundation", "Map of Pi"],`, C.chrome, 1.7],
    [`  creed: "Excellence without compromise. My code is my law.",`, C.ember, 1.95],
    ["};", C.chrome, 2.2],
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
      const cy = 152 + row * 30;
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
    const gid = slug();
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
/* 6) engineering-evidence.svg — evidence flows                         */
/* ------------------------------------------------------------------ */
function evidence(d) {
  const w = 920, h = 360, r = 18;
  const g = slug();
  const rows = [
    {
      tag: "ROBOTICS",
      color: C.gold,
      nodes: ["Policy", "Planner", "Controller", "MuJoCo ⇄ PyBullet", "Validation"],
      note: "robot-sim-policy-lab — 18 tests · 3 physics backends · CI green",
    },
    {
      tag: "AI",
      color: C.ember,
      nodes: ["Planning", "Agent Router", "Research / Content / QA", "Approval Gate", "Execution → AuditLog"],
      note: "ai-agent-automation-platform — human-gated, audited orchestration",
    },
    {
      tag: "PRODUCTION SYSTEMS",
      color: C.gold,
      nodes: ["Idempotency", "Retry", "Circuit Breaker", "HMAC", "Rate Limit", "Audit Chains", "Webhooks"],
      note: "production-systems-lab — Go · race-tested · benchmarks",
    },
    {
      tag: "SECURITY",
      color: C.ember,
      nodes: ["Secure APIs", "Threat Modeling", "Forensics"],
      note: "zero-trust design · OSINT · digital forensics",
    },
  ];
  let html = "";
  rows.forEach((row, ri) => {
    const y0 = 52 + ri * 78;
    const n = row.nodes.length;
    const slot = 860 / n;
    let flow = "";
    row.nodes.forEach((node, i) => {
      const rx = 30 + i * slot;
      const tw = slot - 18;
      flow += `<rect x="${rx}" y="${y0}" width="${tw}" height="30" rx="8" fill="${C.panel2}" stroke="${row.color}44"/>
        <text x="${rx + tw / 2}" y="${y0 + 19}" font-family="${F.mono}" font-size="10.5" text-anchor="middle" fill="${C.text}">${node}</text>`;
      if (i < n - 1) {
        flow += `<line x1="${rx + tw + 2}" y1="${y0 + 15}" x2="${rx + slot - 2}" y2="${y0 + 15}" stroke="${row.color}" stroke-width="1.5">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" begin="${ri * 0.3 + i * 0.2}s" repeatCount="indefinite"/>
        </line>`;
      }
    });
    html += `<g opacity="0">
      <text x="30" y="${y0 - 8}" font-family="${F.mono}" font-size="11" font-weight="700" letter-spacing="1.5" fill="${row.color}">${row.tag}</text>
      ${flow}
      <text x="30" y="${y0 + 48}" font-family="${F.sans}" font-size="11" fill="${C.muted}">${row.note}</text>
      <animate attributeName="opacity" values="0;1" dur="0.7s" begin="${ri * 0.25}s" fill="freeze"/>
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-rendering="optimizeLegibility">
  <rect width="${w}" height="${h}" rx="${r}" fill="${C.bg}"/>
  ${drawBorder(g, w, h, r)}
  <text x="30" y="30" font-family="${F.mono}" font-size="12" letter-spacing="3" fill="${C.gold}">ENGINEERING EVIDENCE</text>
  ${html}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* main                                                                 */
/* ------------------------------------------------------------------ */
(async () => {
  const data = await fetchData();
  fs.mkdirSync(OUT, { recursive: true });
  const files = {
    "about-terminal.svg": aboutTerminal(data),
    "arsenal.svg": arsenal(data),
    "activity.svg": activity(data),
    "domains.svg": domains(data),
    "tech-matrix.svg": techMatrix(data),
    "engineering-evidence.svg": evidence(data),
  };
  for (const [name, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT, name), svg, "utf8");
    console.log(`✓ ${name} (${Buffer.byteLength(svg)} bytes)`);
  }
  console.log("Assets generated into", OUT);
})();
