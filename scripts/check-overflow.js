const fs = require("fs");
const files = fs.readdirSync("assets").filter((f) => f.endsWith(".svg"));
const W = 920;
function measure(txt, size) {
  let w = 0;
  for (const ch of txt) {
    if (/[\u{1F300}-\u{1FAFF}\u{2705}]/u.test(ch)) w += size * 1.2;
    else w += size * 0.6;
  }
  return w;
}
let issues = 0;
for (const f of files) {
  const s = fs.readFileSync("assets/" + f, "utf8");
  const texts = [
    ...s.matchAll(
      /<text\b[^>]*x="([\d.]+)"[^>]*y="([\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
    ),
  ];
  for (const m of texts) {
    const [, x, y, sz, inner] = m;
    const anchor = /text-anchor="middle"/.test(m[0]);
    const anchorEnd = /text-anchor="end"/.test(m[0]);
    const label = inner.replace(/<[^>]+>/g, "").trim();
    if (!label) continue;
    const w = measure(label, parseFloat(sz));
    const xv = parseFloat(x);
    if (anchor) {
      if (xv + w / 2 > W || xv - w / 2 < 0) {
        console.log("OVERFLOW(mid)", f, JSON.stringify(label.slice(0, 44)), "x=" + xv, "w=" + Math.round(w));
        issues++;
      }
    } else if (anchorEnd) {
      if (xv > W + 4 || xv - w < -4) {
        console.log("OVERFLOW(end)", f, JSON.stringify(label.slice(0, 44)), "x=" + xv, "w=" + Math.round(w));
        issues++;
      }
    } else {
      if (xv + w > W + 4) {
        console.log("OVERFLOW", f, JSON.stringify(label.slice(0, 44)), "x=" + xv, "w=" + Math.round(w));
        issues++;
      }
    }
  }
}
console.log(issues ? issues + " issues" : "All text fits within " + W + "px");
