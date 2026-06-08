import { execSync, spawn } from "child_process";
import { assertBackend, BACKEND_ROOT, FRONTEND_ROOT } from "./paths.mjs";

assertBackend();

console.log("\n=== SRM Compras — stack completo ===\n");
console.log("  API:      http://127.0.0.1:8000");
console.log("  Frontend: http://localhost:5173\n");

execSync(`${process.execPath} scripts/run-backend.mjs --detach`, {
  cwd: FRONTEND_ROOT,
  stdio: "inherit",
});

const vite = spawn("npm", ["run", "dev"], {
  cwd: FRONTEND_ROOT,
  stdio: "inherit",
  shell: true,
});

function shutdown() {
  console.log("\nParando servicios...");
  try {
    vite.kill();
  } catch {
    /* ok */
  }
  try {
    execSync(`${process.execPath} scripts/stop-backend.mjs`, {
      cwd: FRONTEND_ROOT,
      stdio: "inherit",
    });
  } catch {
    /* ok */
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
vite.on("exit", () => shutdown());
