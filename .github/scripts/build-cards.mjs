import { mkdir, writeFile } from "node:fs/promises";

const username = process.env.PROFILE_USERNAME || process.env.GITHUB_REPOSITORY_OWNER;
const token = process.env.GITHUB_TOKEN;
if (!username) throw new Error("PROFILE_USERNAME or GITHUB_REPOSITORY_OWNER is required.");

const INK = "#11110F";
const CARD = "#FFFEFA";
const MUTED = "#5C5A55";
const LIME = "#D8FF45";
const SANS = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "rishabhcli-profile",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function ownedRepos() {
  const all = [];
  for (let page = 1; ; page += 1) {
    const batch = await api(`/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter((r) => !r.fork && !r.archived);
}

const esc = (v) =>
  String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

function statsCard({ repos, stars, langs, active, since, stamp }) {
  const cells = [
    [String(repos), "PUBLIC REPOS", "#C9F2F8"],
    [String(stars), "STARS EARNED", "#FFF4B8"],
    [String(langs), "LANGUAGES", "#DDF9D5"],
    [String(active), "PUSHED / 30D", "#FFDDD2"],
  ];
  const grid = cells
    .map(([value, label, tint], i) => {
      const x = 28 + i * 112;
      return `      <g transform="translate(${x} 74)">
        <rect width="102" height="76" rx="5" fill="${tint}" stroke="${INK}" stroke-width="2"/>
        <text x="13" y="42" fill="${INK}" font-size="30" font-weight="800" letter-spacing="-1">${esc(value)}</text>
        <text x="13" y="62" fill="${INK}" font-family="${MONO}" font-size="8.5" font-weight="700" letter-spacing="0.9" opacity="0.7">${esc(label)}</text>
      </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="196" viewBox="0 0 500 196" role="img" aria-labelledby="st sd">
  <title id="st">${esc(username)} public GitHub activity</title>
  <desc id="sd">${repos} public repositories, ${stars} stars earned, ${langs} languages, ${active} repositories pushed in the last 30 days.</desc>
  <defs><clipPath id="sc"><rect x="3" y="3" width="494" height="190" rx="6"/></clipPath></defs>
  <g clip-path="url(#sc)">
    <rect width="500" height="196" fill="${CARD}"/>
    <rect x="0" y="0" width="500" height="7" fill="${LIME}"/>
    <text x="28" y="48" fill="${INK}" font-family="${SANS}" font-size="19" font-weight="800" letter-spacing="-0.4">Public build log</text>
    <text x="472" y="47" text-anchor="end" fill="${MUTED}" font-family="${MONO}" font-size="8.5" letter-spacing="0.8">REFRESHED ${esc(stamp)}</text>
    <g font-family="${SANS}">
${grid}
    </g>
    <rect x="28" y="168" width="444" height="1" fill="${INK}" opacity="0.15"/>
    <text x="28" y="184" fill="${MUTED}" font-family="${MONO}" font-size="8.5" letter-spacing="0.9">OWNED, NON-FORK, NON-ARCHIVED &#183; ON GITHUB SINCE ${esc(since)}</text>
  </g>
  <rect x="3" y="3" width="494" height="190" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
</svg>
`;
}

function langCard(langs, stamp) {
  const swatch = ["#D8FF45", "#2864F0", "#FF5B35", "#FFE65B", "#11110F"];
  const top = langs.slice(0, 5);
  const max = top[0]?.percent || 1;
  const rows = top
    .map(({ name, percent }, i) => {
      const y = 76 + i * 22;
      const w = Math.max(6, Math.round((percent / max) * 108));
      return `    <text x="24" y="${y + 9}" fill="${INK}" font-family="${SANS}" font-size="11" font-weight="700">${esc(name)}</text>
    <rect x="112" y="${y}" width="108" height="11" rx="2" fill="${INK}" opacity="0.08"/>
    <rect x="112" y="${y}" width="${w}" height="11" rx="2" fill="${swatch[i]}" stroke="${INK}" stroke-width="1.2"/>
    <text x="296" y="${y + 9}" text-anchor="end" fill="${MUTED}" font-family="${MONO}" font-size="9">${percent.toFixed(1)}%</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="324" height="196" viewBox="0 0 324 196" role="img" aria-labelledby="lt ld">
  <title id="lt">${esc(username)} repository language mix</title>
  <desc id="ld">${esc(top.map((l) => `${l.name} ${l.percent.toFixed(1)} percent`).join(", "))}.</desc>
  <defs><clipPath id="lc"><rect x="3" y="3" width="318" height="190" rx="6"/></clipPath></defs>
  <g clip-path="url(#lc)">
    <rect width="324" height="196" fill="${CARD}"/>
    <rect x="0" y="0" width="324" height="7" fill="${INK}"/>
    <text x="24" y="48" fill="${INK}" font-family="${SANS}" font-size="19" font-weight="800" letter-spacing="-0.4">What I reach for</text>
    <text x="300" y="47" text-anchor="end" fill="${MUTED}" font-family="${MONO}" font-size="8.5">${esc(stamp)}</text>
${rows}
    <text x="24" y="184" fill="${MUTED}" font-family="${MONO}" font-size="8" letter-spacing="0.8">BY BYTES IN PUBLIC REPOS &#183; NOT A SKILL RANKING</text>
  </g>
  <rect x="3" y="3" width="318" height="190" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>
</svg>
`;
}

const [profile, repos] = await Promise.all([api(`/users/${encodeURIComponent(username)}`), ownedRepos()]);
const cutoff = Date.now() - 30 * 864e5;
const active = repos.filter((r) => new Date(r.pushed_at).getTime() >= cutoff).length;
const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

const maps = [];
for (const r of repos) {
  try {
    maps.push(await api(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(r.name)}/languages`));
  } catch {
    /* a single repo failing must not fail the run */
  }
}
const totals = new Map();
for (const m of maps) for (const [k, v] of Object.entries(m)) totals.set(k, (totals.get(k) || 0) + Number(v));
const totalBytes = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
const langs = [...totals.entries()]
  .map(([name, bytes]) => ({ name, percent: (bytes / totalBytes) * 100 }))
  .sort((a, b) => b.percent - a.percent);

const stamp = new Date().toISOString().slice(0, 10);
await mkdir("assets", { recursive: true });
await writeFile(
  "assets/stats.svg",
  statsCard({ repos: repos.length, stars, langs: langs.length, active, since: new Date(profile.created_at).getUTCFullYear(), stamp }),
  "utf8",
);
await writeFile("assets/langs.svg", langCard(langs, stamp), "utf8");
console.log(`cards written: ${repos.length} repos, ${stars} stars, ${langs.length} languages, ${active} active.`);
