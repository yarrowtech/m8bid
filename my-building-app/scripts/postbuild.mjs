import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.env.VERCEL) {
  console.log("Skipping react-snap on Vercel.");
  process.exit(0);
}

const reactSnapPath = fileURLToPath(
  new URL("../node_modules/react-snap/run.js", import.meta.url)
);

const result = spawnSync(process.execPath, [reactSnapPath], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
