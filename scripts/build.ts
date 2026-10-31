import { rm } from "node:fs/promises";

import { build } from "vite";

const clientOutputDirectory = "dist";
const serverOutputDirectory = ".prerender";

await build({
  build: {
    emptyOutDir: true,
    outDir: clientOutputDirectory,
  },
});

await build({
  build: {
    emptyOutDir: true,
    outDir: serverOutputDirectory,
    ssr: "src/entry-server.tsx",
  },
});

const { render } = await import(`../${serverOutputDirectory}/entry-server.js`);
const document = await Bun.file(`${clientOutputDirectory}/index.html`).text();
const applicationHtml = render();
const preloadLinks = applicationHtml.match(/^(?:<link[^>]+\/>)+/)?.[0] ?? "";
const applicationMarkup = applicationHtml.slice(preloadLinks.length);
const documentWithPreloads = document.replace("</head>", `${preloadLinks}</head>`);
const renderedDocument = documentWithPreloads.replace(
  '<div id="root"></div>',
  `<div id="root">${applicationMarkup}</div>`,
);

if (renderedDocument === documentWithPreloads) {
  throw new Error("Unable to find the application root while prerendering.");
}

await Bun.write(`${clientOutputDirectory}/index.html`, renderedDocument);
await rm(serverOutputDirectory, { force: true, recursive: true });
