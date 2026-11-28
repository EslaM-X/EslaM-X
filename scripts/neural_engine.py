"""Expanded illustrative execution-trust map; measurements are snapshot facts, not traffic."""
from html import escape

# Semantic palette shared by every SVG element; standalone images cannot inherit app CSS.
COLORS = {"bg": "#080B0D", "panel": "#111518", "gold": "#FFC15A", "ivory": "#FFF0C6", "muted": "#A8B2B5", "green": "#5EE5A0", "red": "#FF626B", "cyan": "#76DCE3"}
INPUTS = [("AI AGENT", "Governed decisions"), ("WALLET", "Exact transaction consent"), ("ROBOT", "Illustrative machine intent"), ("API CALL", "Bound request payload"), ("MCP TOOL", "Tool inventory & trust"), ("PAYMENT", "Spend & payment policy"), ("DAPP", "Application authorization"), ("DEX", "Beside the execution rail"), ("RECEIPT", "Artifact & offline verifier"), ("TRUST CARD", "Structural findings & digests")]
STAGES = [("INTENT", "Declare the action", "Action · target · payload"), ("CONSENT", "Record permission", "Signed authorization scope"), ("AUTHORIZE", "Check authority", "Permission is not execution"), ("POLICY", "Enforce boundaries", "Spend · scope · expiry"), ("BINDING", "Bind exact bytes", "Refuse tampered payloads"), ("VERIFY", "Read the evidence", "PASS or a named refusal"), ("RECEIPT", "Keep the artifact", "Offline verification"), ("ANCHOR", "Commit the evidence", "Anchor is not settlement")]
DOCS = "https://coreguard-global.github.io/CoreGuard/DOCS.html"

def text(x, y, value, size=16, role="ivory", weight=600, anchor="start"):
    return f'<text x="{x}" y="{y}" fill="{COLORS[role]}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(str(value))}</text>'

def build(snap, animated=True):
    width, height = 1600, 1100
    audit, docs = snap["boundaryAudit"], snap.get("docsNode", {})
    sha, measured = snap["gitCommit"][:7], snap["measuredAtUtc"][:16].replace("T", " ")
    points = [[(340 + j * 110, 260 + i * 63 + (20 if j % 2 else 0)) for i in range(6)] for j in range(8)]
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img"><title>CoreGuard — expanded neural execution trust map</title><desc>Ten illustrative inputs and eight conceptual checks. Snapshot measurements are separate from the illustrated flow. Verified does not mean safe.</desc>',
         f'<defs><linearGradient id="gold"><stop stop-color="{COLORS["ivory"]}"/><stop offset=".55" stop-color="{COLORS["gold"]}"/><stop offset="1" stop-color="{COLORS["muted"]}"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="{COLORS["muted"]}" stroke-opacity=".06"/></pattern></defs>']
    if animated:
        o.append('<style>.signal{stroke-dasharray:12 460;animation:flow 3.5s linear infinite}.node{animation:breath 3s ease-in-out infinite}.wave{transform-origin:1380px 450px;animation:wave 4s ease-out infinite}.stage{animation:stage 16s linear infinite}@keyframes flow{from{stroke-dashoffset:472}to{stroke-dashoffset:0}}@keyframes breath{50%{opacity:.4}}@keyframes wave{from{transform:scale(.7);opacity:.6}to{transform:scale(1.5);opacity:0}}@keyframes stage{0%,9%{stroke-opacity:1}12%,100%{stroke-opacity:.2}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>')
    o.append(f'<defs><radialGradient id="field"><stop stop-color="{COLORS["gold"]}" stop-opacity=".10"/><stop offset="1" stop-color="{COLORS["bg"]}" stop-opacity="0"/></radialGradient></defs>')
    o += [f'<rect x="1" y="1" width="1598" height="1098" rx="24" fill="{COLORS["bg"]}" stroke="url(#gold)" stroke-width="2"/>', '<rect x="2" y="2" width="1596" height="1096" rx="24" fill="url(#grid)"/><rect x="290" y="220" width="920" height="480" fill="url(#field)"/>', text(40, 45, "COREGUARD / NEURAL TRUST ENGINE", 22, "gold", 800), text(1560, 45, "ILLUSTRATIVE FLOW · LIVE SNAPSHOT", 13, "muted", 600, "end"), text(40, 104, "AUTONOMY IS NOT AUTHORITY.", 44, "ivory", 900), text(40, 139, "Authorization firewall  /  Execution verification  /  Verifiable consent receipts", 19, "muted"), f'<path d="M40 166H1560" stroke="url(#gold)" stroke-opacity=".45"/>']
    o += [text(40, 206, "01 / INPUT SURFACES", 13, "cyan", 800), text(340, 206, "02 / CONCEPTUAL TRUST CHECKS", 13, "cyan", 800), text(1240, 206, "03 / EVIDENCE", 13, "cyan", 800)]
    # Every input is drawn and connected; robotics is explicitly illustrative.
    for i, (label, sub) in enumerate(INPUTS):
        y = 246 + i * 43
        o.append(f'<rect x="40" y="{y-18}" width="240" height="38" rx="7" fill="{COLORS["panel"]}" stroke="{COLORS["gold"]}" stroke-opacity=".3"/>')
        o += [text(53, y-2, label, 13, "ivory", 800), text(53, y+12, sub, 10, "muted"), f'<path d="M280 {y} L340 {points[0][i%6][1]}" fill="none" stroke="{COLORS["gold"]}" stroke-opacity=".22"/>', f'<path class="signal" style="animation-delay:-{i*.32}s" d="M280 {y} L340 {points[0][i%6][1]}" fill="none" stroke="{COLORS["ivory"]}" stroke-width="3"/>']
    for j, layer in enumerate(points):
        x = layer[0][0]
        o.append(text(x, 238, STAGES[j][0], 11, "gold", 800, "middle"))
        for i, (x, y) in enumerate(layer):
            if j < 7:
                for target in (points[j+1][i], points[j+1][(i+1)%6], points[j+1][(i+3)%6]):
                    d = f'M{x} {y} L{target[0]} {target[1]}'
                    o.append(f'<path d="{d}" stroke="{COLORS["gold"]}" stroke-opacity=".12"/>')
                    if i % 2 == 0:
                        o.append(f'<path class="signal" style="animation-delay:-{j*.35+i*.2}s" d="{d}" stroke="{COLORS["ivory"]}" stroke-width="2"/>')
            else:
                o.append(f'<path class="signal" d="M{x} {y} L1304 450" stroke="{COLORS["green"]}" stroke-width="1.5"/>')
            o += [f'<circle class="node" style="animation-delay:-{j*.3+i*.4}s" cx="{x}" cy="{y}" r="7" fill="{COLORS["panel"]}" stroke="url(#gold)" stroke-width="2"/>', f'<circle cx="{x}" cy="{y}" r="2" fill="{COLORS["ivory"]}"/>']
    # Refusals are examples, never measured incident counts.
    for x, y, reason in [(480, 330, "EXPIRED"), (700, 462, "REPLAY"), (920, 564, "BINDING MISMATCH")]:
        o += [f'<rect x="{x-74}" y="{y-18}" width="148" height="36" rx="6" fill="{COLORS["bg"]}" stroke="{COLORS["red"]}"/>', text(x, y-3, reason, 11, "red", 800, "middle"), text(x, y+11, "REFUSAL EXAMPLE", 9, "muted", 600, "middle")]
    o += [f'<circle class="wave" cx="1380" cy="450" r="88" fill="none" stroke="{COLORS["gold"]}" stroke-width="2"/>', f'<circle cx="1380" cy="450" r="82" fill="{COLORS["panel"]}" stroke="url(#gold)" stroke-width="2"/>', f'<path d="M1380 390 L1428 412 V454 Q1428 496 1380 516 Q1332 496 1332 454 V412Z" fill="{COLORS["bg"]}" stroke="url(#gold)" stroke-width="3"/>', f'<path d="M1360 448l15 16 29-32" fill="none" stroke="{COLORS["green"]}" stroke-width="6" stroke-linecap="round"/>', text(1380, 563, "EVIDENCE, NOT PROMISES.", 15, "green", 800, "middle"), text(1380, 587, "VERIFIED ≠ SAFE", 15, "ivory", 800, "middle"), text(1380, 610, "Consent ≠ execution", 13, "muted", 600, "middle"), text(1380, 631, "Anchor ≠ settlement", 13, "muted", 600, "middle")]
    # Detailed stage descriptions are distinct from unrelated repository metrics.
    for j, (label, subtitle, detail) in enumerate(STAGES):
        x, y = 40 + (j%4)*385, 709 + (j//4)*105
        o += [f'<rect class="stage" style="animation-delay:-{j*2}s" x="{x}" y="{y}" width="365" height="88" rx="8" fill="{COLORS["panel"]}" stroke="{COLORS["gold"]}" stroke-opacity=".3"/>', text(x+18, y+25, f'{j+1:02d} / {label}', 17, "gold", 800), text(x+18, y+49, subtitle, 17, "ivory", 700), text(x+18, y+71, detail, 13, "muted")]
    o.append(text(40, 939, "REPOSITORY EVIDENCE / NOT NETWORK TRAFFIC", 12, "cyan", 800))
    metrics = [(f'{snap["testsTotal"]:,}', "TESTS IN SNAPSHOT"), (f'{audit["filesScanned"]:,}', "FILES SCANNED"), (str(audit["violations"]), "BOUNDARY VIOLATIONS"), (f'{docs.get("executed",0):,}', "DOC CHECKS"), (f'{snap["commitsAheadOfV060"]:,}', "COMMITS SINCE v0.6"), (sha, "SOURCE COMMIT")]
    for i, (value, label) in enumerate(metrics):
        x = 40+i*260
        o += [text(x, 980, value, 30, "green" if i==5 else "gold", 800), text(x, 1004, label, 11, "muted", 700)]
    o += [f'<path d="M40 1027H1560" stroke="url(#gold)" stroke-opacity=".3"/>', text(40, 1059, f'MEASURED {measured} UTC · SNAPSHOT SYNC EVERY 6 HOURS', 12, "muted"), f'<a href="{DOCS}">' + text(1560, 1059, "READ THE EVIDENCE ↗", 15, "cyan", 800, "end") + '</a>', '</svg>']
    return "".join(o)