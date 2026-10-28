// Copy guard: fails on em dashes, lorem, TODO in rendered text, and the banned word list.
// Run: node scripts/check-copy.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib", "site.config.ts"];
const EXT = new Set([".ts", ".tsx", ".css", ".md"]);
const BANNED = ["leverage", "seamless", "empower", "unlock", "robust", "actionable", "data-driven", "solutions", "elevate", "delve", "testament", "landscape", "lorem", "ipsum"];
const problems = [];

function walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (f !== "node_modules" && !f.startsWith(".")) walk(join(p, f));
  } else if (EXT.has(extname(p))) {
    check(p, readFileSync(p, "utf8"));
  }
}

function check(file, src) {
  src.split("\n").forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    if (line.includes("—")) problems.push(`${where}: em dash`);
    for (const w of BANNED) {
      const re = new RegExp(`\\b${w.replace("-", "\\-")}\\b`, "i");
      if (re.test(line)) problems.push(`${where}: banned word "${w}"`);
    }
    if (/\bTODO\b/.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("*")) problems.push(`${where}: TODO`);
    if (/not just .{1,40}, it'?s /i.test(line)) problems.push(`${where}: "not just X, it's Y"`);
  });
}

for (const r of ROOTS) walk(r);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("copy clean");
