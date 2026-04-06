const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const assets = ["index.html", "dashboard.html", "styles.css", "login.js", "dashboard-dynamic.js"];

fs.mkdirSync(publicDir, { recursive: true });

for (const fileName of assets) {
  fs.copyFileSync(path.join(rootDir, fileName), path.join(publicDir, fileName));
}

console.log(`Synced ${assets.length} frontend files into ${publicDir}`);
