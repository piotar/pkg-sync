/**
 * Build pkg-sync into a Node-runnable bundle at dist/cli.js. Run with Bun (the dev runtime); the
 * output targets Node so `npm i -g` works on machines without Bun, while Bun can still run it too.
 */

import { chmod, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const outdir = join(root, "dist");
const nodeShebang = "#!/usr/bin/env node\n";

await rm(outdir, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [join(root, "src/cli.ts")],
  outdir,
  target: "node",
  naming: "cli.js",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// Bun keeps the entry's `#!/usr/bin/env bun` shebang; rewrite it to Node and make it executable.
const outfile = join(outdir, "cli.js");
const built = await readFile(outfile, "utf8");
const body = built.startsWith("#!") ? built.slice(built.indexOf("\n") + 1) : built;
await writeFile(outfile, nodeShebang + body);
await chmod(outfile, 0o755);
console.log(`Built ${outfile}`);
