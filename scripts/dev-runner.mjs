import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, name) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development", ADMIN_DEV_BYPASS: "true" },
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exit(code);
    }
  });

  return child;
}

const api = run("npx", ["tsx", "scripts/dev-api.ts"], "dev-api");
const next = run("npx", ["next", "dev"], "next");

function shutdown() {
  api.kill("SIGTERM");
  next.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
