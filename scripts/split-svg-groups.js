const fs = require("fs");
const path = require("path");
const inputFile = process.argv[2];
const inputAbs = path.resolve(inputFile);
const outputDir = process.argv[3] ? path.resolve(process.argv[3]) : path.dirname(inputAbs);
const raw = fs.readFileSync(inputAbs, "utf8");
const svgOpen = raw.match(/<svg[^>]*>/);
if (!svgOpen) { console.error("No svg tag"); process.exit(1); }
const groupRegex = /<g\s+id="([^"]*)">([\s\S]*?)<\/g>/g;
let match;
const groups = [];
while ((match = groupRegex.exec(raw)) !== null) {
  groups.push({ id: match[1], content: match[2].trim() });
}
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
for (const g of groups) {
  const svg = svgOpen[0] + "\n  " + g.content + "\n</svg>\n";
  const outPath = path.join(outputDir, g.id + ".svg");
  fs.writeFileSync(outPath, svg, "utf8");
  console.log("  " + g.id + ".svg (" + (svg.length / 1024).toFixed(1) + " KB)");
}
console.log("Split " + groups.length + " groups into " + outputDir);
