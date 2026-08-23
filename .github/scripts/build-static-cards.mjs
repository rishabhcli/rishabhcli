import { writeFile, mkdir } from "node:fs/promises";

const INK = "#11110F";
const PAPER = "#F4F2EC";
const CARD = "#FFFEFA";
const MUTED = "#5C5A55";
const LIME = "#D8FF45";

const SANS = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

/** Split a sentence into two lines on a word boundary near `max` characters. */
function wrap(text, max) {
  const words = text.split(" ");
  let a = "";
  let i = 0;
  while (i < words.length && (a + (a ? " " : "") + words[i]).length <= max) {
    a += (a ? " " : "") + words[i];
    i += 1;
  }
  return [a, words.slice(i).join(" ")];
}

/* ------------------------------------------------------------------ cards */

const projects = [
  {
    file: "zoovision",
    n: "01",
    tint: "#DDF9D5",
    accent: "#2864F0",
    name: "ZooVision",
    chip: "3RD PLACE / AWS BUILDER LOFT",
    lead: "Overnight animal-welfare monitoring for keepers.",
    sub: "Deterministic Python rules own every alert level. Models describe a scene; they never vote on severity.",
    stack: "TWELVELABS / PYTHON / SQLITE / NEO4J / LIVE AT ZOOVISION.TECH",
    cta: "OPEN REPOSITORY",
  },
  {
    file: "qagent",
    n: "02",
    tint: "#C9F2F8",
    accent: "#2864F0",
    name: "QAgent",
    chip: "WINNER / BEST USE OF BROWSERBASE",
    lead: "Reproduces a web failure, repairs it in isolation, then verifies the fix.",
    sub: "A single local-first engine behind an Electron app, a CLI and an MCP server. Dirty checkouts block publication.",
    stack: "TYPESCRIPT / ELECTRON / CHROMIUM / SQLITE / AGPL-3.0",
    cta: "OPEN REPOSITORY",
  },
  {
    file: "smartcane",
    n: "03",
    tint: "#FFDDD2",
    accent: "#FF5B35",
    name: "SmartCane",
    chip: "1ST PLACE / ALAMEDA COUNTY SCIENCE FAIR",
    lead: "A ~$70 assistive cane with obstacle sensing, fall detection and caregiver alerts.",
    sub: "97.75% obstacle-distance accuracy in bench trials. 27 of 27 simulated falls detected, no false positives in 18.",
    stack: "ARDUINO / ANDROID / BLE / COSITE 2025 PAPER / PROVISIONAL PATENT",
    cta: "READ THE BUILD NOTES",
  },
  {
    file: "saferelay",
    n: "04",
    tint: "#E6E1FF",
    accent: "#11110F",
    name: "SafeRelay",
    chip: "1ST PLACE / ALAMEDA HACKS",
    lead: "Relays an SOS packet through nearby phones when cell service is unavailable.",
    sub: "BLE store-and-forward with hop limits, expiry and idempotent upload once any relay regains connectivity.",
    stack: "JAC / SWIFT / CAPACITOR / CORE BLUETOOTH",
    cta: "OPEN REPOSITORY",
  },
  {
    file: "musclememory",
    n: "05",
    tint: "#FFF4B8",
    accent: "#FF5B35",
    name: "Muscle Memory",
    chip: "2ND PLACE / BEST USE OF GUILD.AI",
    lead: "A fixed robot body, evolving worlds, and a promotion gate on unseen homes.",
    sub: "Promotion requires 80% success across 20 held-out apartments and zero falls. No policy has qualified yet.",
    stack: "MUJOCO / FALKORDB / PYTHON / BUILT IN 4.5 HOURS",
    cta: "OPEN REPOSITORY",
  },
  {
    file: "kinora",
    n: "06",
    tint: "#EEFFC0",
    accent: "#2864F0",
    name: "Kinora",
    chip: "DEPLOYED / ALIBABA CLOUD",
    lead: "Turns a chapter into accepted film shots while preserving continuity.",
    sub: "Shot gates measure each render before acceptance. A failed clip never silently becomes a placeholder.",
    stack: "QWEN / WAN / PYTHON / ALIBABA CLOUD",
    cta: "OPEN REPOSITORY",
  },
];

function card(p) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="580" height="250" viewBox="0 0 580 250" role="img" aria-labelledby="ti de">
  <title id="ti">${esc(p.name)} &#8212; ${esc(p.chip)}</title>
  <desc id="de">${esc(p.lead)} ${esc(p.sub)} Built with ${esc(p.stack.replaceAll(" / ", ", "))}.</desc>
  <defs><clipPath id="c"><rect x="3" y="3" width="574" height="244" rx="6"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="580" height="250" fill="${CARD}"/>
    <path d="M420 0 H580 V126 Z" fill="${p.tint}"/>
    <path d="M470 0 H580 V88 Z" fill="${p.tint}" opacity="0.75">
      <animate attributeName="opacity" values="0.75;0.35;0.75" dur="7s" repeatCount="indefinite"/>
    </path>
    <text x="556" y="86" text-anchor="end" fill="none" stroke="${INK}" stroke-opacity="0.28" stroke-width="1.4"
      font-family="${SANS}" font-size="82" font-weight="800" letter-spacing="-4">${p.n}</text>

    <g font-family="${SANS}">
      <g transform="translate(26 24)">
        <rect width="${Math.round(p.chip.length * 6.92 + 26)}" height="24" rx="4" fill="${INK}"/>
        <text x="11" y="16" fill="${LIME}" font-family="${MONO}" font-size="9.5" font-weight="700" letter-spacing="1.1">${esc(p.chip)}</text>
      </g>

      <text x="26" y="98" fill="${INK}" font-size="34" font-weight="800" letter-spacing="-1.1">${esc(p.name)}</text>

      <text x="26" y="130" fill="${INK}" font-size="14" font-weight="600">${esc(p.lead)}</text>
      <text x="26" y="153" fill="${MUTED}" font-size="12.5">${esc(wrap(p.sub, 66)[0])}</text>
      <text x="26" y="171" fill="${MUTED}" font-size="12.5">${esc(wrap(p.sub, 66)[1])}</text>

      <text x="26" y="200" fill="${INK}" font-family="${MONO}" font-size="9.5" font-weight="700" letter-spacing="1.05" opacity="0.72">${esc(p.stack)}</text>

      <rect x="26" y="212" width="120" height="4" fill="${p.accent}">
        <animate attributeName="width" values="46;120;74;120;46" dur="8s" repeatCount="indefinite"/>
      </rect>
      <text x="554" y="220" text-anchor="end" fill="${INK}" font-family="${MONO}" font-size="9.5" font-weight="700" letter-spacing="1.2">${esc(p.cta)} &#8599;</text>
    </g>
  </g>
  <rect x="3" y="3" width="574" height="244" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
</svg>
`;
}

/* ---------------------------------------------------------------- tagline */

const lines = [
  ["I build agent systems that verify their own work.", INK],
  ["I design local-first tools that keep working offline.", "#2864F0"],
  ["I build assistive hardware measured against real constraints.", "#FF5B35"],
];

const tagline = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="880" height="64" viewBox="0 0 880 64" role="img" aria-labelledby="tt td">
  <title id="tt">How Rishabh works</title>
  <desc id="td">${lines.map((l) => esc(l[0])).join(" ")}</desc>
  <rect x="2" y="2" width="876" height="60" rx="30" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>
  <g text-anchor="middle" font-family="${SANS}" font-size="19" font-weight="650">
${lines
  .map(
    ([text, fill], i) => `    <text x="440" y="40" fill="${fill}" opacity="0">${esc(text)}
      <animate id="l${i}" attributeName="opacity" values="0;1;1;0" keyTimes="0;0.13;0.8;1" dur="4.2s" begin="${i === 0 ? "0s;l2.end" : `l${i - 1}.end`}"/>
      <animate attributeName="y" values="46;40;40;34" keyTimes="0;0.13;0.8;1" dur="4.2s" begin="${i === 0 ? "0s;l2.end" : `l${i - 1}.end`}"/>
    </text>`,
  )
  .join("\n")}
  </g>
</svg>
`;

/* ------------------------------------------------------------------- rule */

const rule = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="34" viewBox="0 0 1200 34" role="presentation">
  <defs><clipPath id="rc"><rect x="0" y="0" width="1200" height="34" rx="5"/></clipPath></defs>
  <g clip-path="url(#rc)">
  <rect x="0" y="0" width="1200" height="34" fill="${PAPER}"/>
  <rect x="0" y="15" width="1200" height="3" fill="${INK}" opacity="0.85"/>
  <g fill="${INK}" opacity="0.35">
${Array.from({ length: 40 }, (_, i) => `    <rect x="${i * 30 + 4}" y="22" width="14" height="3"/>`).join("\n")}
  </g>
  <rect x="0" y="10" width="86" height="13" fill="${LIME}">
    <animate attributeName="x" values="-90;1200" dur="9s" repeatCount="indefinite"/>
  </rect>
  <rect x="0" y="10" width="14" height="13" fill="${INK}">
    <animate attributeName="x" values="-20;1204" dur="9s" repeatCount="indefinite"/>
  </rect>
  </g>
</svg>
`;

/* ----------------------------------------------------------------- awards */

const awards = [
  ["1ST", "Alameda County Science &amp; Engineering Fair", "SmartCane.", true],
  ["PAT", "U.S. provisional utility patent", "Accepted. Assistive sensing.", false],
  ["PUB", "COSITE 2025, Banda Aceh", "Fall and obstacle detection.", false],
  ["1ST", "Stem4All", "SmartCane again, new judges.", false],
  ["1ST", "Alameda Hacks + JacHacks", "AnchorMesh, then SafeRelay.", false],
  ["1ST", "Cognee AI-Memory Hackathon", "FairValue prediction market.", false],
  ["WIN", "Best Use of Browserbase", "QAgent.", false],
  ["WIN", "Best Use of InsForge", "MasterBuild, six agents.", false],
  ["2ND", "Best Use of Guild.ai", "Muscle Memory, 4.5 hours.", false],
  ["PVSA", "Volunteer Service Award, Silver", "2024.", false],
];

const awardRows = awards
  .map(([tag, title, note, star], i) => {
    const y = 96 + i * 34;
    return `    <g>
      <rect x="30" y="${y - 15}" width="46" height="22" rx="3" fill="${star ? INK : "none"}" stroke="${INK}" stroke-width="${star ? 0 : 1.6}"/>
      <text x="53" y="${y}" text-anchor="middle" fill="${star ? LIME : INK}" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="0.6">${tag}</text>
      <text x="92" y="${y}" fill="${INK}" font-size="14.5" font-weight="${star ? 800 : 650}">${title}</text>
      <text x="614" y="${y}" text-anchor="end" fill="${MUTED}" font-size="12.5">${note}</text>
      <rect x="30" y="${y + 13}" width="584" height="1" fill="${INK}" opacity="0.12"/>
    </g>`;
  })
  .join("\n");

const awardsSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="644" height="470" viewBox="0 0 644 470" role="img" aria-labelledby="at ad">
  <title id="at">Selected awards</title>
  <desc id="ad">${esc(awards.map(([t, ti, n]) => `${t} ${ti.replace(/&amp;/g, "and")}: ${n}`).join(" "))}</desc>
  <defs><clipPath id="ac"><rect x="3" y="3" width="638" height="464" rx="6"/></clipPath></defs>
  <g clip-path="url(#ac)">
    <rect width="644" height="470" fill="${CARD}"/>
    <rect x="0" y="0" width="644" height="8" fill="${LIME}"/>
    <text x="30" y="52" fill="${INK}" font-family="${SANS}" font-size="26" font-weight="800" letter-spacing="-0.8">Selected awards and honors</text>
    <text x="30" y="72" fill="${MUTED}" font-family="${MONO}" font-size="10" letter-spacing="1.4">ORDERED BY SIGNIFICANCE, NOT BY RECENCY.</text>
    <g font-family="${SANS}">
${awardRows}
    </g>
    <text x="30" y="440" fill="${MUTED}" font-family="${MONO}" font-size="9.5" letter-spacing="1">8 OUTRIGHT WINS ACROSS 25+ HACKATHONS &#183; SELECTED, NOT COMPLETE</text>
    <rect x="30" y="450" width="120" height="3" fill="${LIME}">
      <animate attributeName="width" values="40;120;70;120;40" dur="9s" repeatCount="indefinite"/>
    </rect>
  </g>
  <rect x="3" y="3" width="638" height="464" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
</svg>
`;

/* ----------------------------------------------------------------- footer */

const footer = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="176" viewBox="0 0 1200 176" role="img" aria-labelledby="ft fd">
  <title id="ft">rishabhcli</title>
  <desc id="fd">Footer: ship it, then prove it.</desc>
  <defs><clipPath id="fc"><rect x="3" y="3" width="1194" height="170" rx="6"/></clipPath></defs>
  <g clip-path="url(#fc)">
    <rect width="1200" height="176" fill="${INK}"/>
    <g opacity="0.16" fill="${LIME}">
${Array.from({ length: 24 }, (_, i) => `      <rect x="${i * 52 + 10}" y="0" width="2" height="176"/>`).join("\n")}
    </g>
    <text x="600" y="72" text-anchor="middle" fill="${PAPER}" font-family="${SANS}" font-size="30" font-weight="800" letter-spacing="-0.6">Evidence before claims.</text>
    <text x="600" y="104" text-anchor="middle" fill="#8A8A82" font-family="${MONO}" font-size="11" letter-spacing="2.2">RISHABHB.DEV &#183; GITHUB.COM/RISHABHCLI &#183; LINKEDIN.COM/IN/RB-RISHABH</text>
    <g font-family="${MONO}" font-size="14">
      <text x="600" y="142" text-anchor="middle" fill="${LIME}">$ <tspan fill="${PAPER}">git push origin main</tspan></text>
    </g>
    <rect x="0" y="168" width="1200" height="8" fill="${LIME}">
      <animate attributeName="x" values="-1200;0" dur="6s" repeatCount="indefinite"/>
    </rect>
  </g>
  <rect x="3" y="3" width="1194" height="170" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
</svg>
`;

/* -------------------------------------------------------------------- run */

await mkdir("assets/projects", { recursive: true });
for (const p of projects) await writeFile(`assets/projects/${p.file}.svg`, card(p), "utf8");
await writeFile("assets/tagline.svg", tagline, "utf8");
await writeFile("assets/rule.svg", rule, "utf8");
await writeFile("assets/awards.svg", awardsSvg, "utf8");
await writeFile("assets/footer.svg", footer, "utf8");
console.log(`wrote ${projects.length} cards + tagline + rule + awards + footer`);
