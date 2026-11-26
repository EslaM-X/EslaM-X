"""CoreGuard Trust Engine v2 — animated neural verification network (pure SVG/CSS/SMIL)."""
F = "font-family:'Segoe UI',Helvetica,Arial,sans-serif"
def tx(x, y, s, size, fill="#F5F1E8", w=700, a="start", ls=0, extra=""):
    return f'<text x="{x}" y="{y}" text-anchor="{a}" style="{F}" fill="{fill}" font-size="{size}" font-weight="{w}" letter-spacing="{ls}" {extra}>{s}</text>'
def build(T, Fi, Vi, commits, when):
    W, H = 1200, 560
    ins = [("◆", "AI AGENT"), ("◈", "WALLET"), ("⬢", "ROBOT"), ("✦", "API CALL"), ("◎", "MCP TOOL")]
    IY = [130 + i * 72 for i in range(5)]
    names = ["INTENT", "AUTHORIZE", "POLICY", "VERIFY", "RECEIPT"]
    LX = [330, 450, 570, 690, 810]
    LY = [[110, 170, 230, 290, 350, 410, 470], [140, 200, 260, 320, 380, 440], [110, 170, 230, 290, 350, 410, 470], [140, 200, 260, 320, 380, 440], [170, 230, 290, 350, 410]]
    SX, SY = 1010, 290
    o = ['<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#FF7A00"/></linearGradient>'
         '<radialGradient id="r" cx=".55" cy=".5" r=".75"><stop offset="0" stop-color="#2E1C00"/><stop offset=".5" stop-color="#0D0B08"/><stop offset="1" stop-color="#040405"/></radialGradient>'
         '<radialGradient id="core" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFB627" stop-opacity=".55"/><stop offset="1" stop-color="#FFB627" stop-opacity="0"/></radialGradient>'
         '<linearGradient id="scan" x1="0" x2="1"><stop offset="0" stop-color="#FFB627" stop-opacity="0"/><stop offset=".5" stop-color="#FFE29A" stop-opacity=".22"/><stop offset="1" stop-color="#FFB627" stop-opacity="0"/></linearGradient>'
         '<pattern id="hex" width="28" height="48" patternUnits="userSpaceOnUse"><path d="M14 0l14 8v16l-14 8-14-8V8z M14 32v16" fill="none" stroke="#FFB627" stroke-opacity=".05"/></pattern>'
         '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         '<clipPath id="cl"><rect x="2" y="2" width="1196" height="556" rx="30"/></clipPath></defs>']
    o.append('<style>.w{stroke:#FFB627;stroke-opacity:.09}.p{stroke:url(#g);stroke-width:2.2;fill:none;stroke-linecap:round;stroke-dasharray:10 500;animation:f 2.8s linear infinite}'
             '@keyframes f{from{stroke-dashoffset:510}to{stroke-dashoffset:0}}.n{animation:b 2.6s ease-in-out infinite}@keyframes b{50%{opacity:.3}}'
             '.sp{transform-origin:1010px 290px;animation:s 18s linear infinite}.sp2{transform-origin:1010px 290px;animation:s 11s linear infinite reverse}@keyframes s{to{transform:rotate(360deg)}}'
             '.tk{animation:t 14s linear infinite}@keyframes t{to{transform:translateX(-600px)}}.sc{animation:sc 5s ease-in-out infinite}@keyframes sc{0%{transform:translateX(250px)}50%{transform:translateX(860px)}100%{transform:translateX(250px)}}</style>')
    o.append('<g clip-path="url(#cl)"><rect width="1200" height="560" fill="url(#r)"/><rect width="1200" height="560" fill="url(#hex)"/>')
    o.append(f'<circle cx="{SX}" cy="{SY}" r="190" fill="url(#core)"/><rect class="sc" x="0" y="80" width="120" height="420" fill="url(#scan)"/>')
    pts = [[(212, y) for y in IY]] + [[(x, y) for y in ys] for x, ys in zip(LX, LY)]
    w = p = ""; k = 0
    for a, b in zip(pts, pts[1:]):
        for (x1, y1) in a:
            for (x2, y2) in b:
                w += f'<line class="w" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'
                if (k * 7) % 6 == 0:
                    p += f'<line class="p" style="animation-delay:-{(k*.41)%2.8:.2f}s" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'
                k += 1
    for (x, y) in pts[-1]:
        w += f'<line class="w" x1="{x}" y1="{y}" x2="{SX}" y2="{SY}"/>'
        p += f'<line class="p" style="animation-delay:-{(y%9)*.3:.1f}s" x1="{x}" y1="{y}" x2="{SX}" y2="{SY}"/>'
    o.append(w + p)
    # nodes
    for j, (x, ys) in enumerate(zip(LX, LY)):
        o.append(f'<rect x="{x-34}" y="{ys[0]-26}" width="68" height="{ys[-1]-ys[0]+52}" rx="34" fill="#FFB627" fill-opacity=".025" stroke="#FFB627" stroke-opacity=".12" stroke-dasharray="3 6"/>')
        for i, y in enumerate(ys):
            big = i == len(ys) // 2
            o.append(f'<circle class="n" style="animation-delay:-{(i*.35+j*.5):.2f}s" cx="{x}" cy="{y}" r="{9 if big else 6.5}" fill="#0E0D0B" stroke="url(#g)" stroke-width="2.5" filter="url(#gl)"/>')
            o.append(f'<circle cx="{x}" cy="{y}" r="2.4" fill="#FFE29A"/>')
        o.append(tx(x, 524, names[j], 12, "url(#g)", 800, "middle", 3) + tx(x, 543, f"L{j+1}", 10, "#8F8674", 600, "middle", 2))
    # inputs
    for (ic, t), y in zip(ins, IY):
        o.append(f'<rect x="36" y="{y-19}" width="176" height="38" rx="19" fill="#121009" stroke="url(#g)" stroke-opacity=".55"/>'
                 f'<circle cx="60" cy="{y}" r="11" fill="url(#g)" fill-opacity=".15"/>' + tx(60, y + 5, ic, 13, "url(#g)", 800, "middle")
                 + tx(80, y + 5, t, 12, "#F5F1E8", 800, ls=2))
    # threats blocked at different layers
    threats = [("M212,202 L330,230 L450,260 L570,290", 570, 290, "0s", "REPLAY"), ("M212,346 L330,350 L450,380", 450, 380, "-1.6s", "UNAUTHORIZED"), ("M212,130 L330,110 L450,140 L570,170 L690,200", 690, 200, "-3.1s", "FORGED PROOF")]
    for path, bx, by, d, lab in threats:
        o.append(f'<circle r="7" fill="#FF3B3B" filter="url(#gl)"><animateMotion begin="{d}" dur="4.8s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.5;1" calcMode="linear" path="{path}"/>'
                 f'<animate begin="{d}" attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.56;1" dur="4.8s" repeatCount="indefinite"/></circle>')
        o.append(f'<g opacity="0"><animate begin="{d}" attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.5;.54;.82;1" dur="4.8s" repeatCount="indefinite"/>'
                 f'<circle cx="{bx}" cy="{by}" r="16" fill="none" stroke="#FF3B3B" stroke-width="2"><animate begin="{d}" attributeName="r" values="10;30" dur="4.8s" repeatCount="indefinite"/></circle>'
                 f'<rect x="{bx-62}" y="{by-46}" width="124" height="22" rx="11" fill="#2A0707" stroke="#FF3B3B" stroke-opacity=".7"/>' + tx(bx, by - 31, f"✕ {lab}", 10, "#FF6B6B", 900, "middle", 2) + '</g>')
    # shield core with orbits
    o.append(f'<g class="sp"><circle cx="{SX}" cy="{SY}" r="104" fill="none" stroke="url(#g)" stroke-opacity=".35" stroke-dasharray="2 10"/><circle cx="{SX+104}" cy="{SY}" r="5" fill="#FFE29A" filter="url(#gl)"/><circle cx="{SX-104}" cy="{SY}" r="3" fill="#FFB627"/></g>')
    o.append(f'<g class="sp2"><circle cx="{SX}" cy="{SY}" r="82" fill="none" stroke="#3DDC84" stroke-opacity=".3" stroke-dasharray="40 14"/><circle cx="{SX}" cy="{SY-82}" r="4" fill="#3DDC84" filter="url(#gl)"/></g>')
    o.append(f'<circle cx="{SX}" cy="{SY}" r="66" fill="none" stroke="url(#g)" stroke-width="2"><animate attributeName="r" values="62;78;62" dur="2.8s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".7;0;.7" dur="2.8s" repeatCount="indefinite"/></circle>')
    o.append(f'<g transform="translate({SX},{SY})" filter="url(#gl)"><path d="M0,-52 L43,-34 L43,6 C43,34 23,50 0,59 C-23,50 -43,34 -43,6 L-43,-34 Z" fill="#0E0D0B" stroke="url(#g)" stroke-width="3.5"/>'
             '<path d="M0,-38 L30,-25 L30,4 C30,24 16,36 0,43 C-16,36 -30,24 -30,4 L-30,-25 Z" fill="none" stroke="#FFB627" stroke-opacity=".35"/>'
             '<path d="M-17,3 L-4,16 L20,-12" fill="none" stroke="#3DDC84" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="stroke-opacity" values="1;.35;1" dur="1.6s" repeatCount="indefinite"/></path></g>')
    o.append(tx(SX, SY + 128, "VERIFIED", 17, "#3DDC84", 900, "middle", 6) + tx(SX, SY + 150, "cryptographic receipt issued", 11, "#8F8674", 500, "middle", 1))
    # data packets flowing from each input into the network
    for i, y in enumerate(IY):
        o.append(f'<rect width="12" height="6" rx="3" fill="#FFE29A" filter="url(#gl)"><animateMotion begin="-{i*.6:.1f}s" dur="2.2s" repeatCount="indefinite" path="M212,{y} L330,{LY[0][i+1]}"/></rect>')
    # threats-blocked counter (cycles through rising digits)
    o.append('<rect x="880" y="96" width="132" height="54" rx="14" fill="#1A0606" stroke="#FF3B3B" stroke-opacity=".55"/>' + tx(946, 116, "THREATS BLOCKED", 8, "#FF8A8A", 800, "middle", 1.5))
    for n in range(6):
        vals = ";".join("1" if m == n else "0" for m in range(6))
        o.append(f'<g opacity="{1 if n==0 else 0}"><animate attributeName="opacity" values="{vals}" calcMode="discrete" dur="4.8s" repeatCount="indefinite"/>' + tx(946, 141, f"+{(n+1)*3}", 20, "#FF5A5A", 900, "middle") + '</g>')
    o.append('<rect x="1030" y="96" width="134" height="54" rx="14" fill="#06180D" stroke="#3DDC84" stroke-opacity=".55"/>' + tx(1097, 116, "ANCHOR", 8, "#8CF0B5", 800, "middle", 1.5) + tx(1097, 140, "Core Mainnet", 13, "#3DDC84", 900, "middle"))
    # chain satellites orbiting the shield
    for k, (lab, r, dur) in enumerate([("STELLAR", 126, 26), ("CORE", 126, 26), ("PI", 126, 26)]):
        o.append(f'<g><animateTransform attributeName="transform" type="rotate" from="{k*120} {SX} {SY}" to="{k*120+360} {SX} {SY}" dur="{dur}s" repeatCount="indefinite"/><circle cx="{SX+r}" cy="{SY}" r="15" fill="#0E0D0B" stroke="url(#g)" stroke-width="1.5"/>' + tx(SX + r, SY + 3, lab[:2], 9, "url(#g)", 900, "middle") + '</g>')
    # header
    o.append('<circle cx="48" cy="44" r="6" fill="#3DDC84"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>'
             + tx(64, 50, "COREGUARD · NEURAL TRUST ENGINE", 17, "url(#g)", 900, ls=4) + tx(1164, 50, f"LIVE · {when}", 12, "#8F8674", 600, "end", 2))
    # stats chips top-right of shield
    chips = [(f"{T}/{T}", "TESTS"), (Fi, "FILES AUDITED"), (str(Vi), "VIOLATIONS"), (commits, "COMMITS")]
    # stats bar
    o.append('<rect x="880" y="470" width="284" height="64" rx="16" fill="#0E0D0B" stroke="#FFB627" stroke-opacity=".3"/>')
    for i, (v, l) in enumerate(chips[:3]):
        x = 928 + i * 94
        o.append(tx(x, 500, v, 16 if i == 0 else 18, "url(#g)", 900, "middle") + tx(x, 520, l, 8, "#B8AE98", 700, "middle", 1.5))
    # receipt ticker
    hx = "".join(f"rcpt:0x{(i*2654435761)&0xffffffff:08x} ✓ · " for i in range(1, 13))
    o.append('<rect x="250" y="70" width="600" height="26" rx="13" fill="#0E0D0B" stroke="#FFB627" stroke-opacity=".2"/><clipPath id="tc"><rect x="262" y="70" width="576" height="26"/></clipPath>'
             f'<g clip-path="url(#tc)"><g class="tk">{tx(262, 88, hx + hx, 11, "#B8AE98", 600, ls=1, extra="font-family=\"monospace\"")}</g></g>')
    o.append('</g><rect x="1" y="1" width="1198" height="558" rx="30" fill="none" stroke="url(#g)" stroke-opacity=".7" stroke-width="2"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(o)}</svg>'

def divider(label):
    """Thin animated neural divider: gold nodes with travelling pulses + centered label."""
    W, H = 1200, 64
    xs = list(range(40, 1161, 56))
    o = ['<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#FFB627" stop-opacity="0"/><stop offset=".2" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FFB627"/><stop offset=".8" stop-color="#FF8A00"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></linearGradient>'
         '<filter id="gl"><feGaussianBlur stdDeviation="2.5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
         '<style>.p{stroke:#FFE29A;stroke-width:2.5;stroke-dasharray:24 1200;animation:f 4s linear infinite}@keyframes f{from{stroke-dashoffset:1224}to{stroke-dashoffset:0}}.n{animation:b 2s ease-in-out infinite}@keyframes b{50%{opacity:.25}}</style>']
    pts = [(x, 32 + (14 if i % 2 else -14) * (0 if i % 3 == 0 else 1)) for i, x in enumerate(xs)]
    d = "M" + " L".join(f"{x},{y}" for x, y in pts)
    o.append(f'<path d="{d}" fill="none" stroke="url(#g)" stroke-opacity=".45" stroke-width="1.2"/><path class="p" d="{d}" fill="none" filter="url(#gl)"/>')
    for i, (x, y) in enumerate(pts):
        if abs(x - 600) < 150: continue
        o.append(f'<circle class="n" style="animation-delay:-{i*.15:.2f}s" cx="{x}" cy="{y}" r="3.5" fill="#0B0A08" stroke="url(#g)" stroke-width="2"/>')
    o.append(f'<rect x="452" y="14" width="296" height="36" rx="18" fill="#0B0A08" stroke="#FFB627" stroke-opacity=".6"/>'
             + tx(600, 38, label, 14, "#FFB627", 900, "middle", 5))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(o)}</svg>'
