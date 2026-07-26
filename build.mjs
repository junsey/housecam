import { cp, mkdir, rm } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["index.html", "desarrollo.html", "src.css"]) {
  await cp(new URL(`./${file}`, import.meta.url), new URL(`./dist/${file}`, import.meta.url), {
    recursive: true,
  });
}

await cp(new URL("./logo-housecam.svg", import.meta.url), new URL("./dist/logo-housecam.svg", import.meta.url));

console.log("HouseCam static site built in dist/");
