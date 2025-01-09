import * as fs from "fs";
import * as path from "path";

function processCustomElement(
  rootFile: string,
  blocksDir: string,
  distDir: string
) {
  // Ensure required directories in /dist
  const distStylesDir = path.join(distDir, "styles");
  const distScriptsDir = path.join(distDir, "scripts");

  if (!fs.existsSync(distStylesDir)) {
    fs.mkdirSync(distStylesDir, { recursive: true });
  }
  if (!fs.existsSync(distScriptsDir)) {
    fs.mkdirSync(distScriptsDir, { recursive: true });
  }

  // Read the root file
  const rootContent = fs.readFileSync(rootFile, "utf-8");

  // Find the custom element `<abl-header />`
  const customElementMatch = rootContent.match(/<abl-header\s*\/>/);
  if (!customElementMatch) {
    console.error("Custom element <abl-header /> not found in root file.");
    return;
  }

  // Locate the `header` block
  const headerBlockDir = path.join(blocksDir, "header");
  if (!fs.existsSync(headerBlockDir)) {
    console.error(`Header block directory not found: ${headerBlockDir}`);
    return;
  }

  const headerCss = path.join(headerBlockDir, "index.css");
  const headerJs = path.join(headerBlockDir, "index.js");
  const headerHtml = path.join(headerBlockDir, "index.htmbl");

  // Copy block files to /dist
  if (fs.existsSync(headerCss)) {
    fs.copyFileSync(headerCss, path.join(distStylesDir, "header.css"));
  } else {
    console.warn("CSS file not found for header block.");
  }

  if (fs.existsSync(headerJs)) {
    fs.copyFileSync(headerJs, path.join(distScriptsDir, "header.js"));
  } else {
    console.warn("JS file not found for header block.");
  }

  let headerContent = "";
  if (fs.existsSync(headerHtml)) {
    headerContent = fs.readFileSync(headerHtml, "utf-8");
  } else {
    console.warn("HTML content file not found for header block.");
  }

  // Create /dist/index.html
  let distContent = rootContent.replace(/<abl-header\s*\/>/, headerContent);

  const headInsert = `<link rel="stylesheet" href="styles/header.css">`;
  const bodyInsert = `<script src="scripts/header.js"></script>`;

  distContent = distContent.replace(/<\/head>/, `  ${headInsert}\n</head>`);

  distContent = distContent.replace(/<\/body>/, `  ${bodyInsert}\n</body>`);

  fs.writeFileSync(path.join(distDir, "index.html"), distContent, "utf-8");

  console.log("Conversion complete! Files are located in:", distDir);
}

// Usage
const rootFile = "./index.htmbl"; // Path to your root file
const blocksDir = "./blocks"; // Path to your blocks directory
const distDir = "./dist"; // Path to your dist directory

processCustomElement(rootFile, blocksDir, distDir);
