const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const assets = ["index.html", "app.js", "styles.css"];

function copyDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

fs.mkdirSync(publicDir, { recursive: true });

let copied = 0;
for (const fileName of assets) {
  const source = path.join(rootDir, fileName);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(publicDir, fileName));
    copied += 1;
  } else {
    console.warn(`[sync-public] Skipping missing file: ${fileName}`);
  }
}

copyDirectory(path.join(rootDir, "images"), path.join(publicDir, "images"));

console.log(`Synced ${copied} frontend asset(s) plus images into ${publicDir}`);
