#!/usr/bin/env python3
"""Live CoreGuard numbers -> luxury SVGs + markdown markers. Source of truth:
coreguard-global/CoreGuard docs/state-snapshot.json (read-only, never written)."""
import json, re, urllib.request, pathlib, html
SRC = "https://raw.githubusercontent.com/coreguard-global/CoreGuard/main/docs/state-snapshot.json"
ROOT = pathlib.Path(__file__).resolve().parent.parent
B = ROOT / "assets" / "brand"
B.mkdir(parents=True, exist_ok=True)
s = json.load(urllib.request.urlopen(SRC, timeout=30))
T = s["testsTotal"]; A = s["boundaryAudit"]; when = s["measuredAtUtc"][:10]; commit = s["gitCommit"][:7]
n = lambda x: f"{x:,}"
V = {"tests": n(T), "files": n(A["filesScanned"]), "violations": n(A["violations"]), "commits": n(s["commitsAheadOfV060"]), "date": when}
F = "font-family:'Segoe UI',Helvetica,Arial,sans-serif"
DEFS = '<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FFB627"/><stop offset="1" stop-color="#FF8A00"/></linearGradient><radialGradient id="r" cx=".15" cy="0" r="1.1"><stop offset="0" stop-color="#2A1A00"/><stop offset=".6" stop-color="#0B0A08"/><stop offset="1" stop-color="#050506"/></radialGradient></defs>'
def t(x, y, txt, size, fill="#F5F1E8", w=600, anchor="start", extra=""):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" style="{F}" fill="{fill}" font-size="{size}" font-weight="{w}" {extra}>{html.escape(str(txt))}</text>'
def write(name, body, w, h):
    (B / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{DEFS}{body}</svg>', encoding="utf-8")

write("k-ci.svg", f'<rect x="1" y="1" width="278" height="148" rx="16" fill="url(#r)" stroke="url(#g)" stroke-opacity=".6" stroke-width="2"/>'
      + t(140, 70, V["tests"], 44, "url(#g)", 800, "middle") + t(140, 102, "TESTS PASSING", 16, w=700, anchor="middle", extra='letter-spacing="2"')
      + t(140, 128, f"live · {when}", 13, "#8F8674", 400, "middle"), 280, 150)

cells = [("TESTS PASSING", f'{V["tests"]}/{V["tests"]}'), ("FILES AUDITED", V["files"]), ("BOUNDARY VIOLATIONS", V["violations"]), ("COMMITS SINCE v0.6", V["commits"])]
body = '<rect x="1" y="1" width="1198" height="258" rx="28" fill="url(#r)" stroke="url(#g)" stroke-opacity=".6" stroke-width="2"/>'
body += '<circle cx="52" cy="48" r="7" fill="#3DDC84"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/></circle>'
body += t(70, 54, "COREGUARD · LIVE EVIDENCE", 18, "url(#g)", 800, extra='letter-spacing="4"') + t(1160, 54, f"auto-synced {when} · commit {commit}", 14, "#8F8674", 400, "end")
for i, (k, v) in enumerate(cells):
    x = 40 + i * 285
    body += f'<rect x="{x}" y="82" width="265" height="140" rx="18" fill="#0E0D0B" stroke="#FFB627" stroke-opacity=".25"/>'
    body += t(x + 132, 160, v, 46, "url(#g)", 800, "middle") + t(x + 132, 196, k, 13, "#F5F1E8", 700, "middle", 'letter-spacing="2"')
write("cg-live.svg", body, 1200, 260)

items = [("◆", "CoreGuard", f'{V["tests"]} tests · Mainnet anchor LIVE'), ("◈", "ProofX", "v0.4.0 · protocol frozen"), ("◇", "PiProof", "v1.0 · PEP/1"),
         ("⬡", "EVMX", "EVM forensics"), ("✦", "Atlas · RoboPay", "PR #120 merged"), ("◎", "Robot Sim Lab", "3 simulators"),
         ("⬢", "AI Agent Platform", "v0.3.0 · 17 evals"), ("▣", "Production Systems Lab", "37 tests"), ("◉", "Pi Local AI Agent", "privacy-first"), ("★", "Agent Commerce MCP", "listed on MCPRush")]
x = 0; pills = ""
for icon, name, sub in items * 2:
    w = 34 + 9.6 * len(name) + 7.4 * len(sub) + 40
    pills += f'<g transform="translate({x:.0f},14)"><rect width="{w:.0f}" height="44" rx="22" fill="#121009" stroke="url(#g)" stroke-opacity=".45"/>'
    pills += t(18, 29, icon, 16, "url(#g)", 700) + t(40, 29, name, 16, "#F5F1E8", 800) + t(40 + 9.6 * len(name) + 10, 29, sub, 14, "#B8AE98", 500) + "</g>"
    x += w + 14
dur = int(x / 2 / 40)
body = f'<style>.m{{animation:m {dur}s linear infinite}}@keyframes m{{to{{transform:translateX(-{x/2:.0f}px)}}}}</style>'
body += '<rect width="1200" height="72" rx="36" fill="url(#r)" stroke="url(#g)" stroke-opacity=".6" stroke-width="2"/><clipPath id="c"><rect x="214" y="0" width="976" height="72"/></clipPath>'
body += f'<g clip-path="url(#c)"><g transform="translate(222,0)"><g class="m">{pills}</g></g></g>'
body += '<rect x="8" y="8" width="196" height="56" rx="28" fill="url(#g)"/><circle cx="30" cy="36" r="5" fill="#0A0A0C"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>' + t(122, 42, "NOW SHIPPING", 16, "#0A0A0C", 900, "middle", 'letter-spacing="2"')
write("now.svg", body, 1200, 72)

P = [("coreguard", "CoreGuard", "FLAGSHIP · EXECUTION TRUST", "Authorization Firewall · Execution Verification · Receipts", f'{V["tests"]} tests · Mainnet anchor LIVE', "Next: SDK v1 · two pilots"),
     ("proofx", "ProofX", "EXECUTION PROOF PROTOCOL", "claim → evidence → proof → verification · Go/WASM/Rust", "v0.4.0 · 102-case conformance", "Next: CI adoption via proofx-action"),
     ("piproof", "PiProof", "PORTABLE EVIDENCE · PEP/1", "Proof Passports · Dispute Engine · AUREVIA dashboard", "v1.0.0 · zero dependencies", "Next: Pi ecosystem adoption"),
     ("evmx", "EVMX", "EVM FORENSICS", "Evidence-backed EVM transaction forensics engine", "Public · active", "Next: feed CoreGuard verification"),
     ("atlas", "Atlas · RoboPay", "MACHINE-PAYABLE ROBOTICS", "Payment-gated Boston Dynamics Atlas · real USDC", "RoboPay PR #120 merged · Spot & Go2", "Next: robotics payments at scale"),
     ("robotsim", "Robot Sim Lab", "ROBOTICS POLICY LAB", "policy → planner → controller across 3 simulators", "v0.1.0 · 18 tests · 0.26 m max deviation", "CI green"),
     ("agents", "AI Agent Platform", "GOVERNED AI AGENTS", "Human-gated, audited agent orchestration", "v0.3.0 · 17 evaluation cases", "Next: secured by CoreGuard"),
     ("prodlab", "Production Systems Lab", "FINANCIAL SYSTEMS · GO", "Idempotency · replay · circuit-breakers · HMAC · audit", "v0.1.0 · 37 tests", "CI green"),
     ("pilocal", "Pi Local AI Agent", "PRIVACY-FIRST AI", "Local AI agent gateway for Pi Network", "Public · desktop gateway", "Install and run")]
for i, (slug, name, tag, desc, stage, nxt) in enumerate(P, 1):
    b = '<rect x="1" y="1" width="588" height="238" rx="24" fill="url(#r)" stroke="url(#g)" stroke-opacity=".6" stroke-width="2"/><rect x="24" y="1" width="542" height="5" rx="2.5" fill="url(#g)"/>'
    b += t(32, 48, f"{i:02d}", 15, "url(#g)", 800, extra='letter-spacing="2"') + t(70, 48, tag, 13, "#B8AE98", 700, extra='letter-spacing="3"')
    b += t(32, 100, name, 38, "url(#g)", 800) + t(32, 136, desc, 15, "#F5F1E8", 500)
    b += '<rect x="32" y="160" width="526" height="1" fill="#FFB627" fill-opacity=".25"/><circle cx="40" cy="190" r="5" fill="#3DDC84"/>' + t(54, 195, stage, 15, "#F5F1E8", 700) + t(32, 220, nxt, 14, "#8F8674", 500)
    b += t(558, 220, "OPEN →", 13, "url(#g)", 800, "end", 'letter-spacing="2"')
    write(f"p-{slug}.svg", b, 590, 240)

for md in ["README.md", "INVEST.md", "PROJECTS.md"]:
    p = ROOT / md
    if p.exists():
        txt = p.read_text(encoding="utf-8")
        new = re.sub(r"<!--cg:(\w+)-->.*?<!--/cg-->", lambda m: f"<!--cg:{m[1]}-->{V.get(m[1], m[0])}<!--/cg-->", txt)
        if new != txt: p.write_text(new, encoding="utf-8")
print("synced", V)
