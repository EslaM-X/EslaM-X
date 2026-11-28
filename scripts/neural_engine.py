"""Cinematic illustrative trust atlas; only the isolated evidence rail contains measured facts."""
from html import escape
import math

COLORS = {"bg": "#080B0D", "panel": "#11181C", "gold": "#FFC15A", "ivory": "#FFF0C6", "muted": "#A8B2B5", "green": "#5EE5A0", "red": "#FF626B", "cyan": "#76DCE3"}
INPUTS = [("AI AGENT", "Governed decisions"), ("WALLET", "Exact transaction consent"), ("ROBOT", "Illustrative machine intent"), ("API CALL", "Bound request payload"), ("MCP TOOL", "Tool inventory & trust"), ("PAYMENT", "Spend & payment policy"), ("DAPP", "Application authorization"), ("DEX", "Beside the execution rail"), ("RECEIPT", "Artifact & offline verifier"), ("TRUST CARD", "Structural findings & digests")]
STAGES = [("INTENT", "Declare the action", "Action · target · payload"), ("CONSENT", "Record permission", "Signed authorization scope"), ("AUTHORIZE", "Check authority", "Permission is not execution"), ("POLICY", "Enforce boundaries", "Spend · scope · expiry"), ("BINDING", "Bind exact bytes", "Refuse tampered payloads"), ("VERIFY", "Read the evidence", "PASS or a named refusal"), ("RECEIPT", "Keep the artifact", "Offline verification"), ("ANCHOR", "Commit the evidence", "Anchor is not settlement")]
DOCS = "https://coreguard-global.github.io/CoreGuard/DOCS.html"

def text(x, y, value, size=16, role="ivory", weight=600, anchor="start"):
    return f'<text x="{x}" y="{y}" fill="{COLORS[role]}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(str(value))}</text>'

def build(snap, animated=True):
    width, height = 1600, 1460
    audit, docs = snap["boundaryAudit"], snap.get("docsNode", {})
    sha, measured = snap["gitCommit"][:7], snap["measuredAtUtc"][:16].replace("T", " ")
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img"><title>CoreGuard — Neural Trust Atlas</title><desc>Ten input surfaces, eight conceptual checks, illustrative refusal paths and evidence artifacts. Repository snapshot measurements are separate from the illustrated flow, not production traffic. Verified does not mean safe.</desc>']
    o.append(f'''<defs><linearGradient id="gold"><stop stop-color="{COLORS['ivory']}"/><stop offset=".45" stop-color="{COLORS['gold']}"/><stop offset="1" stop-color="{COLORS['muted']}"/></linearGradient><linearGradient id="trace"><stop stop-color="{COLORS['gold']}"/><stop offset="1" stop-color="{COLORS['cyan']}"/></linearGradient><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="{COLORS['muted']}" stroke-opacity=".055"/></pattern><filter id="glow"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>''')
    if animated:
        o.append('''<style>.signal{stroke-dasharray:5 150;animation:flow 4s linear infinite}.node{animation:breath 4s ease-in-out infinite}.orbit{transform-origin:1390px 448px;animation:orbit 24s linear infinite}.orbit-reverse{transform-origin:1390px 448px;animation:orbit 32s linear infinite reverse}.check{animation:check 16s linear infinite}.refusal{animation:refusal 7s ease-in-out infinite}.scan{animation:scan 10s linear infinite}@keyframes flow{to{stroke-dashoffset:-310}}@keyframes breath{50%{opacity:.45}}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes check{0%,10%{stroke-opacity:1}15%,100%{stroke-opacity:.25}}@keyframes refusal{50%{stroke-opacity:.35}}@keyframes scan{0%{transform:translateX(0);opacity:0}10%,90%{opacity:.6}100%{transform:translateX(810px);opacity:0}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>''')
    def line(x1,y1,x2,y2,role="gold",opacity=.25,extra=""):
        return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{COLORS[role]}" stroke-opacity="{opacity}" {extra}/>'
    def box(x,y,w,h,role="gold",extra=""):
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{COLORS["panel"]}" stroke="{COLORS[role]}" stroke-opacity=".3" {extra}/>'
    o += [f'<rect x="1" y="1" width="1598" height="1458" rx="22" fill="{COLORS["bg"]}" stroke="url(#gold)" stroke-width="2"/>', '<rect x="2" y="2" width="1596" height="1456" rx="22" fill="url(#grid)"/>']
    # Precision edge marks rather than decorative background noise.
    for x,y,dx,dy in [(20,20,38,38),(1580,20,-38,38),(20,1440,38,-38),(1580,1440,-38,-38)]:
        o.append(f'<path d="M{x} {y+dy}V{y}H{x+dx}" fill="none" stroke="{COLORS["gold"]}" stroke-width="2"/>')
    o += [text(42,49,"COREGUARD / NEURAL TRUST ATLAS",23,"gold",800),text(1558,49,"ILLUSTRATIVE SYSTEM MAP · LIVE REPOSITORY EVIDENCE",12,"muted",600,"end"), text(40,110,"INTELLIGENCE IS NOT PERMISSION.",46,"ivory",900),text(40,146,"Autonomy is not authority. A confident answer is not an execution proof.",20,"muted"),line(40,174,1560,174),text(40,204,"01 / INPUT SURFACES",14,"cyan",800),text(346,204,"02 / THE TRUST BOUNDARY",14,"cyan",800),text(1244,204,"03 / EVIDENCE CORE",14,"cyan",800)]
    points = [[(360+j*108,286+i*45+(14 if j%2 else 0)) for i in range(8)] for j in range(8)]
    # Ten input lanes, each with a distinct geometric source glyph.
    for i,(label,sub) in enumerate(INPUTS):
        y = 245+i*43
        o += [box(40,y-17,246,38),f'<path d="M62 {y-8}l8 8-8 8-8-8Z" fill="none" stroke="{COLORS["cyan"]}"/>',text(82,y-1,label,14,"ivory",800),text(82,y+13,sub,10,"muted"),line(286,y,360,points[0][i%8][1]),line(286,y,360,points[0][i%8][1],"cyan",.9,'class="signal" stroke-width="2"')]
    o += [line(320,235,320,696,"cyan",.4),text(320,728,"BOUND REQUESTS",11,"cyan",700,"middle")]
    # Stage spines, all-to-neighbor paths and sequenced illumination.
    for j,layer in enumerate(points):
        x=layer[0][0]
        o += [box(x-30,234,60,434,"gold",f'class="check" style="animation-delay:-{j*2}s"'),text(x,257,f"{j+1:02d}",12,"muted",700,"middle"),text(x,698,STAGES[j][0],11,"gold",800,"middle")]
        for i,(x,y) in enumerate(layer):
            if j<7:
                for k in (i,(i+1)%8,(i+3)%8):
                    tx,ty=points[j+1][k]
                    o.append(line(x,y,tx,ty,"gold",.17))
                    if k==i:
                        o.append(line(x,y,tx,ty,"cyan" if i%3==0 else "ivory",.85,f'class="signal" stroke-width="2" style="animation-delay:-{j*.46+i*.37}s"'))
            else:
                o.append(f'<path d="M{x} {y}Q1230 {y} 1264 448" fill="none" stroke="{COLORS["green"]}" stroke-opacity=".25"/>')
                if i%2==0:
                    o.append(f'<path class="signal" d="M{x} {y}Q1230 {y} 1264 448" fill="none" stroke="{COLORS["green"]}" stroke-width="2"/>')
            o += [f'<circle class="node" style="animation-delay:-{j*.4+i*.3}s" cx="{x}" cy="{y}" r="6" fill="{COLORS["bg"]}" stroke="url(#gold)" stroke-width="1.8"/>',f'<circle cx="{x}" cy="{y}" r="1.8" fill="{COLORS["cyan"] if i%3==0 else COLORS["ivory"]}"/>']
    o += [line(337,268,337,649,"cyan",.5,'class="scan" stroke-width="2"'),text(755,731,"DECLARE  →  CONSTRAIN  →  VERIFY  →  PRESERVE",13,"muted",700,"middle")]
    # Refusal paths branch away from the conceptual main flow, never incident statistics.
    for j,i,label in [(1,2,"EXPIRED"),(3,5,"REPLAY"),(5,1,"BYTE MISMATCH")]:
        x,y=points[j][i]
        o += [line(x,y,x+38,y+21,"red",.8),f'<rect x="{x+12}" y="{y+15}" width="122" height="26" rx="5" fill="{COLORS["bg"]}" stroke="{COLORS["red"]}" class="refusal"/>',text(x+73,y+32,label,10,"red",800,"middle")]
    # Engraved evidence seal with independent orbit motion and actual semantic outputs.
    o.append(f'<circle cx="1390" cy="448" r="126" fill="{COLORS["bg"]}" stroke="url(#gold)" stroke-width="2"/>')
    for r,cls,role in [(116,"orbit","gold"),(103,"orbit-reverse","cyan")]:
        o.append(f'<circle class="{cls}" cx="1390" cy="448" r="{r}" fill="none" stroke="{COLORS[role]}" stroke-width="2" stroke-dasharray="80 12 6 12" stroke-opacity=".65"/>')
    for i in range(24):
        a=math.pi*i/12
        x,y=1390+132*math.cos(a),448+132*math.sin(a)
        xx,yy=1390+138*math.cos(a),448+138*math.sin(a)
        o.append(line(round(x,2),round(y,2),round(xx,2),round(yy,2),"gold",.6))
    o += [f'<path d="M1390 375l53 24v49q0 48-53 76-53-28-53-76v-49Z" fill="{COLORS["panel"]}" stroke="url(#gold)" stroke-width="3"/>',f'<path d="M1368 447l17 17 33-36" fill="none" stroke="{COLORS["green"]}" stroke-width="6" stroke-linecap="round" filter="url(#glow)"/>',text(1390,310,"EVIDENCE, NOT PROMISES",12,"gold",800,"middle"),text(1390,606,"VERIFIED ≠ SAFE",21,"ivory",800,"middle"),text(1390,631,"Consent ≠ execution",14,"muted",600,"middle"),text(1390,655,"Anchor ≠ settlement",14,"muted",600,"middle")]
    for i,(label,detail) in enumerate([("CONSENT SCOPE","What was authorized"),("EXECUTION EVIDENCE","What the artifact records")]):
        y=235+i*41
        o += [text(1390,y,label,12,"cyan",800,"middle"),text(1390,y+17,detail,11,"muted",600,"middle")]
    # Evidence artifact rail, visually separated from numeric evidence below.
    o += [line(40,759,1560,759),text(40,791,"04 / THE EVIDENCE CHAIN",14,"cyan",800),text(1560,791,"ARTIFACT CONCEPTS · NOT A LIVE TRANSACTION",11,"muted",600,"end")]
    for i,(label,detail) in enumerate([("AUTHORIZATION","Signed scope"),("PAYLOAD BINDING","Exact request bytes"),("VERIFIER RESULT","PASS / named refusal"),("RECEIPT ARTIFACT","Offline-verifiable record"),("ANCHOR REFERENCE","Evidence commitment")]):
        x=40+i*308
        o += [box(x,813,288,73,"cyan"),text(x+16,839,label,14,"ivory",800),text(x+16,865,detail,13,"muted")]
        if i<4:
            o.append(text(x+299,858,"›",24,"gold",800,"middle"))
    # Refusal taxonomy is an illustrative list; no invented threat counts or capabilities.
    o += [text(40,923,"05 / REFUSAL EXAMPLES",14,"red",800),text(1560,923,"FAIL CLOSED IN THE ILLUSTRATION · NO INCIDENT COUNTS",11,"muted",600,"end")]
    reasons=[("EXPIRED","Outside consent window"),("REPLAY","Previously used request"),("OUT OF SCOPE","Beyond authorization"),("BYTE MISMATCH","Altered request payload"),("NO AUTHORITY","Missing permission"),("NO EVIDENCE","No verifiable artifact")]
    for i,(label,detail) in enumerate(reasons):
        x=40+i*257
        o += [box(x,946,236,66,"red",'class="refusal"'),text(x+13,970,"×  "+label,12,"red",800),text(x+13,991,detail,11,"muted")]
    o.append(text(40,1049,"06 / EIGHT CONCEPTUAL CHECKS",14,"cyan",800))
    for j,(label,subtitle,detail) in enumerate(STAGES):
        x,y=40+(j%4)*385,1071+(j//4)*92
        o += [box(x,y,365,78,"gold",f'class="check" style="animation-delay:-{j*2}s"'),text(x+15,y+22,f"{j+1:02d} / {label}",15,"gold",800),text(x+15,y+44,subtitle,16,"ivory",700),text(x+15,y+64,detail,12,"muted")]
    o += [line(40,1261,1560,1261),text(40,1292,"07 / MEASURED REPOSITORY EVIDENCE",14,"cyan",800),text(1560,1292,"NOT PRODUCTION TRAFFIC · NOT STAGE COUNTS",11,"muted",600,"end")]
    metrics=[(f'{snap["testsTotal"]:,}',"TESTS IN SNAPSHOT"),(f'{audit["filesScanned"]:,}',"FILES SCANNED"),(str(audit["violations"]),"BOUNDARY VIOLATIONS"),(f'{docs.get("executed",0):,}',"DOC CHECKS"),(f'{snap["commitsAheadOfV060"]:,}',"COMMITS SINCE v0.6"),(sha,"SOURCE COMMIT")]
    for i,(value,label) in enumerate(metrics):
        x=40+i*257
        o += [text(x,1340,value,30,"green" if i==5 else "gold",800),text(x,1364,label,11,"muted",700)]
    o += [line(40,1387,1560,1387),text(40,1420,f"MEASURED {measured} UTC · SNAPSHOT SYNC EVERY 6 HOURS",12,"muted"),f'<a href="{DOCS}">'+text(1560,1420,"INSPECT THE EVIDENCE ↗",15,"cyan",800,"end")+'</a>','</svg>']
    return ''.join(o)
