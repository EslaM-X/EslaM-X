"""Static Trust Engine + compact hero (mini) generators."""
import re
from hero import tx
def static(svg):
    s = re.sub(r'<(circle|rect)\b[^>]*[^/]>(?:(?!</\1>).)*?<animateMotion.*?</\1>', '', svg, flags=re.S)
    s = re.sub(r'<animate(Transform|Motion)?\b[^>]*/>', '', s)
    s = re.sub(r'<g opacity="0">.*?</g>', '', s, flags=re.S)
    s = re.sub(r'<rect class="sc"[^>]*/>', '', s)
    return s.replace('</style>', '*{animation:none!important}.p{stroke-dasharray:none!important;stroke-opacity:.18}</style>', 1)
def mini(V, logo, sha):
    W, H = 800, 300
    o = ['<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#FF7A00"/></linearGradient>'
         '<radialGradient id="r" cx=".2" cy=".4" r=".8"><stop offset="0" stop-color="#3A2200"/><stop offset=".55" stop-color="#0D0B08"/><stop offset="1" stop-color="#040405"/></radialGradient>'
         '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         '<clipPath id="c"><circle cx="110" cy="112" r="72"/></clipPath></defs>'
         '<style>.p{stroke:url(#g);stroke-width:2;stroke-dasharray:8 300;animation:f 2.6s linear infinite}@keyframes f{from{stroke-dashoffset:308}to{stroke-dashoffset:0}}.o{transform-origin:110px 112px;animation:s 16s linear infinite}@keyframes s{to{transform:rotate(360deg)}}</style>'
         '<rect x="1" y="1" width="798" height="298" rx="26" fill="url(#r)" stroke="url(#g)" stroke-opacity=".7" stroke-width="2"/>'
         '<g class="o"><circle cx="110" cy="112" r="90" fill="none" stroke="url(#g)" stroke-opacity=".5" stroke-dasharray="2 8" stroke-width="2"/><circle cx="200" cy="112" r="4" fill="#FFE29A" filter="url(#gl)"/></g>'
         f'<image href="{logo}" x="38" y="40" width="144" height="144" clip-path="url(#c)"/><circle cx="110" cy="112" r="73" fill="none" stroke="url(#g)" stroke-width="3"/>']
    o.append(tx(230, 66, "FOUNDER &amp; CEO · COREGUARD GLOBAL", 12, "#FFB627", 800, ls=4) + tx(228, 118, "EslaM HeshAM", 46, "url(#g)", 900) + tx(230, 148, "MR-X · Technical Architect", 17, "#F5F1E8", 700))
    # mini neural strip
    L = [(240 + i * 70, 0) for i in range(8)]
    ys = [176, 196]
    for i in range(7):
        for a in ys:
            for b in ys:
                x1, x2 = 240 + i * 70, 310 + i * 70
                o.append(f'<line x1="{x1}" y1="{a}" x2="{x2}" y2="{b}" stroke="#FFB627" stroke-opacity=".15"/><line class="p" style="animation-delay:-{(i*.4+a/100)%2.6:.2f}s" x1="{x1}" y1="{a}" x2="{x2}" y2="{b}"/>')
    for i in range(8):
        for y in ys:
            o.append(f'<circle cx="{240+i*70}" cy="{y}" r="4.5" fill="#0B0A08" stroke="url(#g)" stroke-width="2"/>')
    o.append('<path d="M760,170 L778,177 L778,190 C778,200 770,206 760,210 C750,206 742,200 742,190 L742,177 Z" fill="#0B0A08" stroke="url(#g)" stroke-width="2" filter="url(#gl)"/><path d="M753,189 L758,194 L767,183" fill="none" stroke="#3DDC84" stroke-width="2.5" stroke-linecap="round"/>')
    cells = [(f'{V["tests"]}/{V["tests"]}', "TESTS"), (V["files"], "FILES"), (V["violations"], "VIOLATIONS"), (sha, "COMMIT")]
    for i, (v, k) in enumerate(cells):
        x = 40 + i * 185
        o.append(f'<rect x="{x}" y="226" width="170" height="54" rx="14" fill="#0E0D0B" stroke="#FFB627" stroke-opacity=".3"/>' + tx(x + 85, 252, v, 18, "url(#g)" if i < 3 else "#3DDC84", 900, "middle") + tx(x + 85, 270, k, 9, "#B8AE98", 700, "middle", 2))
    o.append('<circle cx="760" cy="58" r="5" fill="#3DDC84"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>' + tx(748, 62, "LIVE", 11, "#3DDC84", 900, "end", 3))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(o)}</svg>'
