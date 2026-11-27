"""Hero v2 — luxury animated founder banner. Logo kept exactly (embedded base64)."""
import pathlib, math
F = "font-family:'Segoe UI',Helvetica,Arial,sans-serif"
def tx(x, y, s, size, fill="#F5F1E8", w=700, a="start", ls=0, extra=""):
    return f'<text x="{x}" y="{y}" text-anchor="{a}" style="{F}" fill="{fill}" font-size="{size}" font-weight="{w}" letter-spacing="{ls}" {extra}>{s}</text>'
def build(V, logo, commit=""):
    W, H, CX, CY = 1200, 460, 230, 230
    o = ['<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#FF7A00"/></linearGradient>'
         '<linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#FFB627"/><stop offset=".45" stop-color="#FFB627"/><stop offset=".5" stop-color="#FFFBEA"/><stop offset=".55" stop-color="#FFB627"/><stop offset="1" stop-color="#FF7A00"/>'
         '<animate attributeName="x1" values="-1;1" dur="4s" repeatCount="indefinite"/><animate attributeName="x2" values="0;2" dur="4s" repeatCount="indefinite"/></linearGradient>'
         '<radialGradient id="r" cx=".2" cy=".5" r=".75"><stop offset="0" stop-color="#3A2200"/><stop offset=".5" stop-color="#0D0B08"/><stop offset="1" stop-color="#040405"/></radialGradient>'
         '<radialGradient id="aura" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#FF8A00" stop-opacity=".45"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient>'
         '<pattern id="hex" width="28" height="48" patternUnits="userSpaceOnUse"><path d="M14 0l14 8v16l-14 8-14-8V8z M14 32v16" fill="none" stroke="#FFB627" stroke-opacity=".05"/></pattern>'
         '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         f'<clipPath id="c"><circle cx="{CX}" cy="{CY}" r="138"/></clipPath><clipPath id="cl"><rect x="2" y="2" width="1196" height="456" rx="30"/></clipPath></defs>'
         '<style>.o3{transform-origin:230px 230px;animation:s 60s linear infinite}.lsw{animation:lsw 6s ease-in-out infinite}@keyframes lsw{0%,60%{transform:translateX(0)}100%{transform:translateX(620px)}}.o1{transform-origin:230px 230px;animation:s 22s linear infinite}.o2{transform-origin:230px 230px;animation:s 14s linear infinite reverse}@keyframes s{to{transform:rotate(360deg)}}'
         '.sw{animation:sw 7s ease-in-out infinite}@keyframes sw{0%{transform:translateX(-400px)}100%{transform:translateX(1600px)}}.pl{animation:pl 3.2s ease-in-out infinite}@keyframes pl{50%{opacity:.4}}'
         '.n{animation:b 2.4s ease-in-out infinite}@keyframes b{50%{opacity:.2}}.p{stroke:url(#g);stroke-width:1.6;stroke-dasharray:8 400;animation:f 3.4s linear infinite}@keyframes f{from{stroke-dashoffset:408}to{stroke-dashoffset:0}}</style>'
         '<g clip-path="url(#cl)"><rect width="1200" height="460" fill="url(#r)"/><rect width="1200" height="460" fill="url(#hex)"/>']
    # trust map: constellation shaped as the CoreGuard shield, beamed to the logo
    sh = [(1110,140),(1160,160),(1162,230),(1150,290),(1110,340),(1070,290),(1058,230),(1060,160),(1110,200),(1110,265),(1088,235),(1132,235)]
    edges = [(0,1),(1,2),(2,3),(3,4),(4,5),(5,6),(6,7),(7,0),(0,8),(8,9),(9,4),(10,8),(11,8),(10,9),(11,9),(6,10),(2,11)]
    for k,(a,b) in enumerate(edges):
        (x1,y1),(x2,y2) = sh[a],sh[b]
        o.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#FFB627" stroke-opacity=".22"/><line class="p" style="animation-delay:-{k*.37%3.4:.2f}s" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>')
    for i,(x,y) in enumerate(sh):
        o.append(f'<circle class="n" style="animation-delay:-{i*.21:.2f}s" cx="{x}" cy="{y}" r="{4 if i in (0,4,8,9) else 2.6}" fill="#FFE29A" filter="url(#gl)"/>')
    o.append('<path d="M1088,236 L1104,252 L1134,218" fill="none" stroke="#3DDC84" stroke-width="3" stroke-linecap="round" stroke-opacity=".8"><animate attributeName="stroke-opacity" values=".9;.2;.9" dur="2s" repeatCount="indefinite"/></path>')
    o.append(tx(1110, 372, "TRUST MAP", 10, "#8F8674", 800, "middle", 4))
    o.append('<rect class="sw" x="0" y="0" width="160" height="460" fill="#FFE29A" opacity=".045" transform="skewX(-18)"/>')
    # logo aura + orbits
    o.append(f'<circle class="pl" cx="{CX}" cy="{CY}" r="205" fill="url(#aura)"/>')
    o.append(f'<g class="o1"><circle cx="{CX}" cy="{CY}" r="178" fill="none" stroke="url(#g)" stroke-opacity=".45" stroke-dasharray="1 9" stroke-width="2"/>'
             + "".join(f'<circle cx="{CX+178*math.cos(a)}" cy="{CY+178*math.sin(a)}" r="{5 if k==0 else 3}" fill="#FFE29A" filter="url(#gl)"/>' for k, a in enumerate([0, 2.1, 4.2])) + '</g>')
    o.append(f'<g class="o2"><circle cx="{CX}" cy="{CY}" r="160" fill="none" stroke="#FFB627" stroke-opacity=".5" stroke-dasharray="60 20 6 20"/><circle cx="{CX}" cy="{CY-160}" r="4" fill="#3DDC84" filter="url(#gl)"/></g>')
    o.append(f'<circle cx="{CX}" cy="{CY}" r="146" fill="#0B0A08"/><image href="{logo}" x="{CX-138}" y="{CY-138}" width="276" height="276" clip-path="url(#c)"/>'
             f'<circle cx="{CX}" cy="{CY}" r="140" fill="none" stroke="url(#g)" stroke-width="4" filter="url(#gl)"/>')
    o.append(f'<defs><path id="ring" d="M{CX},{CY} m-192,0 a192,192 0 1,1 384,0 a192,192 0 1,1 -384,0"/></defs><g class="o3">' + tx(0, 0, '<textPath href="#ring">COREGUARD ✦ VERIFY ✦ PROTECT ✦ EMPOWER ✦ EXECUTION TRUST ✦ COREGUARD ✦ VERIFY ✦ PROTECT ✦ EMPOWER ✦</textPath>', 11, "#FFB627", 800, ls=3.2, extra='fill-opacity=".55"') + '</g>')
    o.append(f'<g clip-path="url(#c)"><rect class="lsw" x="{CX-300}" y="{CY-140}" width="60" height="280" fill="#FFF6DA" opacity=".18" transform="skewX(-20)"/></g>')
    # seal ribbon under logo
    o.append(f'<rect x="{CX-78}" y="{CY+150}" width="156" height="30" rx="15" fill="url(#g)"/>' + tx(CX, CY + 170, "MR-X · FOUNDER", 12, "#0A0A0C", 900, "middle", 3))
    # text
    X = 450
    o.append(f'<rect x="{X}" y="74" width="4" height="26" fill="url(#g)"/>' + tx(X + 16, 94, "FOUNDER &amp; CEO · COREGUARD GLOBAL", 17, "#FFB627", 800, ls=6))
    o.append(tx(X - 4, 180, "EslaM HeshAM", 82, "url(#sh)", 900, extra='filter="url(#gl)"'))
    roles = ["Technical Architect", "Execution-Trust Engineer", "AI Agents · Robotics", "Web3 Protocol Builder"]
    for i, r in enumerate(roles):
        vals = ";".join("1" if m == i else "0" for m in range(len(roles)))
        o.append(f'<g opacity="{1 if i==0 else 0}"><animate attributeName="opacity" values="{vals}" calcMode="discrete" dur="10s" repeatCount="indefinite"/>' + tx(X, 230, f'MR-X <tspan fill="#FFB627">›</tspan> {r}', 28, "#F5F1E8", 700) + '</g>')
    o.append(f'<rect x="{X}" y="252" width="560" height="1" fill="url(#g)" fill-opacity=".5"/>' + tx(X, 284, "AI Agents · Robotics · Web3 Protocols · Payments · Security", 18, "#B8AE98", 500, ls=.5))
    # pills
    for k, (lab, x, w, solid) in enumerate([("VERIFY", X, 140, 0), ("PROTECT", X + 156, 150, 0), ("EMPOWER", X + 322, 160, 1)]):
        fill = 'url(#g)' if solid else '#0E0D0B'
        o.append(f'<rect x="{x}" y="312" width="{w}" height="42" rx="21" fill="{fill}" stroke="url(#g)" stroke-width="1.5"{" filter=\"url(#gl)\"" if solid else ""}/>' + f'<rect x="{x}" y="312" width="{w}" height="42" rx="21" fill="url(#g)" opacity="0" filter="url(#gl)"><animate attributeName="opacity" values="0;.35;0;0" keyTimes="0;.12;.3;1" begin="{k*1.2}s" dur="3.6s" repeatCount="indefinite"/></rect>' + tx(x + w / 2, 339, lab, 15, "#0A0A0C" if solid else "#FFB627", 900, "middle", 4))
    # live strip (real numbers, auto-synced)
    o.append(f'<rect x="{X}" y="378" width="710" height="44" rx="14" fill="#0E0D0B" stroke="#FFB627" stroke-opacity=".3"/>'
             f'<circle cx="{X+22}" cy="400" r="5" fill="#3DDC84"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>'
             + tx(X + 36, 405, "COREGUARD LIVE", 12, "#3DDC84", 900, ls=3)
             + tx(X + 200, 405, f'<tspan fill="#FFB627" font-weight="900">{V["tests"]}/{V["tests"]}</tspan> tests  ·  <tspan fill="#FFB627" font-weight="900">{V["files"]}</tspan> files audited  ·  <tspan fill="#FFB627" font-weight="900">{V["violations"]}</tspan> violations', 14, "#D8CFBC", 600)
             + (tx(X + 694, 405, f'⌁ {commit}', 13, "#3DDC84", 800, "end", 1.5, extra='font-family="monospace"') if commit else ""))
    o.append(tx(1150, 446, f'Cairo, Egypt · Remote Worldwide · synced {V["date"]}', 11, "#6E6656", 500, "end", 1))
    # corner brackets
    for (x, y, dx, dy) in [(22, 22, 1, 1), (1178, 22, -1, 1), (22, 438, 1, -1), (1178, 438, -1, -1)]:
        o.append(f'<path d="M{x},{y+dy*40} L{x},{y} L{x+dx*40},{y}" fill="none" stroke="url(#g)" stroke-width="2.5"/><path d="M{x+dx*7},{y+dy*22} L{x+dx*7},{y+dy*7} L{x+dx*22},{y+dy*7}" fill="none" stroke="#FFB627" stroke-opacity=".5"/><rect x="{x+dx*36-3}" y="{y-3}" width="6" height="6" transform="rotate(45 {x+dx*36} {y})" fill="#FFE29A"/><rect x="{x-3}" y="{y+dy*36-3}" width="6" height="6" transform="rotate(45 {x} {y+dy*36})" fill="#FFE29A"/>')
    o.append('</g><rect x="1.5" y="1.5" width="1197" height="457" rx="30" fill="none" stroke="url(#g)" stroke-opacity=".75" stroke-width="2.5"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(o)}</svg>'
