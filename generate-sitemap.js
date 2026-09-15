#!/usr/bin/env node

const fs = require("fs");
const { execFileSync } = require("child_process");

const SITE = "https://airdrop-hub.cryptoatlas.workers.dev";

const PAGES = [
  { file: "index.html",      path: "/",              changefreq: "weekly",  priority: "1.0" },
  { file: "guide-claim.html",   path: "/guide-claim",   changefreq: "weekly",  priority: "0.8" },
  { file: "guide-daily.html",   path: "/guide-daily",   changefreq: "weekly",  priority: "0.8" },
  { file: "guide-faucets.html", path: "/guide-faucets", changefreq: "weekly",  priority: "0.8" },
  { file: "guide-scam.html",    path: "/guide-scam",    changefreq: "weekly",  priority: "0.8" },
  { file: "guide-tap.html",     path: "/guide-tap",     changefreq: "weekly",  priority: "0.8" },
  { file: "guide-testnet.html", path: "/guide-testnet", changefreq: "weekly",  priority: "0.8" },
  { file: "about.html",      path: "/about",         changefreq: "monthly", priority: "0.5" },
  { file: "contact.html",    path: "/contact",       changefreq: "monthly", priority: "0.4" },
  { file: "privacy.html",    path: "/privacy",       changefreq: "yearly",  priority: "0.3" },
  { file: "disclaimer.html", path: "/disclaimer",    changefreq: "yearly",  priority: "0.3" },
];

function gitDate(file) {
  try {
    const date = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", file],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  } catch (_) {}

  try {
    return fs.statSync(file).mtime.toISOString().slice(0, 10);
  } catch (_) {
    return new Date().toISOString().slice(0, 10);
  }
}

function xmlEscape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const pages = PAGES.filter((page) => fs.existsSync(page.file));

const body = pages.map((page) => {
  const lastmod = gitDate(page.file);

  return [
    "  <url>",
    `    <loc>${xmlEscape(SITE + page.path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    "  </url>",
  ].join("\n");
}).join("\n");

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  body,
  "</urlset>",
  "",
].join("\n");

fs.writeFileSync("sitemap.xml", xml, "utf8");

console.log(`Wrote sitemap.xml (${pages.length} URLs)`);

for (const page of pages) {
  console.log(`  ${SITE}${page.path}  ${gitDate(page.file)}`);
}

if (pages.length !== PAGES.length) {
  console.warn(
    `Warning: expected ${PAGES.length} pages, found ${pages.length}.`
  );
}
