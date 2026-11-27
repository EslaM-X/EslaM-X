"""Hero v2 — luxury animated founder banner. Logo kept exactly (embedded base64)."""
import pathlib, math
F = "font-family:'Segoe UI',Helvetica,Arial,sans-serif"
def tx(x, y, s, size, fill="#F5F1E8", w=700, a="start", ls=0, extra=""):
    return f'<text x="{x}" y="{y}" text-anchor="{a}" style="{F}" fill="{fill}" font-size="{size}" font-weight="{w}" letter-spacing="{ls}" {extra}>{s}</text>'
def build(V, logo):
    W, H, CX, CY = 1200, 460, 230, 230
    o = ['<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#FF7A00"/></linearGradient>'
         '<linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#FFB627"/><stop offset=".45" stop-color="#FFB627"/><stop offset=".5" stop-color="#FFFBEA"/><stop offset=".55" stop-color="#FFB627"/><stop offset="1" stop-color="#FF7A00"/>'
         '<animate attributeName="x1" values="-1;1" dur="4s" repeatCount="indefinite"/><animate attributeName="x2" values="0;2" dur="4s" repeatCount="indefinite"/></linearGradient>'
         '<radialGradient id="r" cx=".2" cy=".5" r=".75"><stop offset="0" stop-color="#3A2200"/><stop offset=".5" stop-color="#0D0B08"/><stop offset="1" stop-color="#040405"/></radialGradient>'
         '<radialGradient id="aura" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#FF8A00" stop-opacity=".45"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient>'
         '<pattern id="hex" width="28" height="48" patternUnits="userSpaceOnUse"><path d="M14 0l14 8v16l-14 8-14-8V8z M14 32v16" fill="none" stroke="#FFB627" stroke-opacity=".05"/></pattern>'
         '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         f'<clipPath id="c"><circle cx="{CX}" cy="{CY}" r="138"/></clipPath><clipPath id="cl"><rect x="2" y="2" width="1196" height="456" rx="30"/></clipPath></defs>'
         '<style>.o1{transform-origin:230px 230px;animation:s 22s linear infinite}.o2{transform-origin:230px 230px;animation:s 14s linear infinite reverse}@keyframes s{to{transform:rotate(360deg)}}'
         '.sw{animation:sw 7s ease-in-out infinite}@keyframes sw{0%{transform:translateX(-400px)}100%{transform:translateX(1600px)}}.pl{animation:pl 3.2s ease-in-out infinite}@keyframes pl{50%{opacity:.4}}'
         '.n{animation:b 2.4s ease-in-out infinite}@keyframes b{50%{opacity:.2}}.p{stroke:url(#g);stroke-width:1.6;stroke-dasharray:8 400;animation:f 3.4s linear infinite}@keyframes f{from{stroke-dashoffset:408}to{stroke-dashoffset:0}}</style>'
         '<g clip-path="url(#cl)"><rect width="1200" height="460" fill="url(#r)"/><rect width="1200" height="460" fill="url(#hex)"/>']
    # neural constellation on the right
    import random; random.seed(7)
    pts = [(random.randint(1050, 1170), random.randint(150, 360)) for _ in range(14)]
    for i, (x1, y1) in enumerate(pts):
        for (x2, y2) in pts[i+1:]:
            if math.hypot(x2-x1, y2-y1) < 95:
                o.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#FFB627" stroke-opacity=".12"/><line class="p" style="animation-delay:-{(x1+y2)%34/10:.1f}s" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>')
    for i, (x, y) in enumerate(pts):
        o.append(f'<circle class="n" style="animation-delay:-{i*.21:.2f}s" cx="{x}" cy="{y}" r="{2.5 + (i % 3)}" fill="#FFE29A" filter="url(#gl)"/>')
    o.append('<rect class="sw" x="0" y="0" width="160" height="460" fill="#FFE29A" opacity=".045" transform="skewX(-18)"/>')
    # logo aura + orbits
    o.append(f'<circle class="pl" cx="{CX}" cy="{CY}" r="205" fill="url(#aura)"/>')
    o.append(f'<g class="o1"><circle cx="{CX}" cy="{CY}" r="178" fill="none" stroke="url(#g)" stroke-opacity=".45" stroke-dasharray="1 9" stroke-width="2"/>'
             + "".join(f'<circle cx="{CX+178*math.cos(a)}" cy="{CY+178*math.sin(a)}" r="{5 if k==0 else 3}" fill="#FFE29A" filter="url(#gl)"/>' for k, a in enumerate([0, 2.1, 4.2])) + '</g>')
    o.append(f'<g class="o2"><circle cx="{CX}" cy="{CY}" r="160" fill="none" stroke="#FFB627" stroke-opacity=".5" stroke-dasharray="60 20 6 20"/><circle cx="{CX}" cy="{CY-160}" r="4" fill="#3DDC84" filter="url(#gl)"/></g>')
    o.append(f'<circle cx="{CX}" cy="{CY}" r="146" fill="#0B0A08"/><image href="{logo}" x="{CX-138}" y="{CY-138}" width="276" height="276" clip-path="url(#c)"/>'
             f'<circle cx="{CX}" cy="{CY}" r="140" fill="none" stroke="url(#g)" stroke-width="4" filter="url(#gl)"/>')
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
        o.append(f'<rect x="{x}" y="312" width="{w}" height="42" rx="21" fill="{fill}" stroke="url(#g)" stroke-width="1.5"{" filter=\"url(#gl)\"" if solid else ""}/>' + tx(x + w / 2, 339, lab, 15, "#0A0A0C" if solid else "#FFB627", 900, "middle", 4))
    # live strip (real numbers, auto-synced)
    o.append(f'<rect x="{X}" y="378" width="710" height="44" rx="14" fill="#0E0D0B" stroke="#FFB627" stroke-opacity=".3"/>'
             f'<circle cx="{X+22}" cy="400" r="5" fill="#3DDC84"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>'
             + tx(X + 36, 405, "COREGUARD LIVE", 12, "#3DDC84", 900, ls=3)
             + tx(X + 200, 405, f'<tspan fill="#FFB627" font-weight="900">{V["tests"]}/{V["tests"]}</tspan> tests  ·  <tspan fill="#FFB627" font-weight="900">{V["files"]}</tspan> files audited  ·  <tspan fill="#FFB627" font-weight="900">{V["violations"]}</tspan> violations', 14, "#D8CFBC", 600))
    o.append(tx(1150, 446, f'Cairo, Egypt · Remote Worldwide · synced {V["date"]}', 11, "#6E6656", 500, "end", 1))
    # corner brackets
    for (x, y, dx, dy) in [(22, 22, 1, 1), (1178, 22, -1, 1), (22, 438, 1, -1), (1178, 438, -1, -1)]:
        o.append(f'<path d="M{x},{y+dy*26} L{x},{y} L{x+dx*26},{y}" fill="none" stroke="url(#g)" stroke-width="2.5"/>')
    o.append('</g><rect x="1.5" y="1.5" width="1197" height="457" rx="30" fill="none" stroke="url(#g)" stroke-opacity=".75" stroke-width="2.5"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(o)}</svg>'
