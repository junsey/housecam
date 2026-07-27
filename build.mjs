import { cp, mkdir, readdir, rm } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["index.html", "desarrollo.html", "src.css", "theme.js", "dev-gate.js"]) {
  await cp(new URL(`./${file}`, import.meta.url), new URL(`./dist/${file}`, import.meta.url), {
    recursive: true,
  });
}

for (const logo of ["housecam-white.svg", "housecam-black.svg"]) {
  await cp(new URL(`./${logo}`, import.meta.url), new URL(`./dist/${logo}`, import.meta.url));
}

const faviconPattern = /^(?:favicon(?:-\d+x\d+)?\.(?:png|ico)|apple-icon(?:-\d+x\d+|-precomposed)?\.png|android-icon-\d+x\d+\.png|ms-icon-\d+x\d+\.png|manifest\.json|browserconfig\.xml)$/;

for (const asset of await readdir(new URL("./", import.meta.url))) {
  if (!faviconPattern.test(asset)) continue;
  await cp(new URL(`./${asset}`, import.meta.url), new URL(`./dist/${asset}`, import.meta.url));
}

console.log("HouseCam static site built in dist/");
