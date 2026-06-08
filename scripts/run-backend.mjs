import { execSync, spawn } from "child_process";
import { assertBackend, BACKEND_ROOT } from "./paths.mjs";

const detach = process.argv.includes("--detach");
const isWin = process.platform === "win32";

function stopStale() {
  try {
    execSync("symfony server:stop", { cwd: BACKEND_ROOT, stdio: "ignore", shell: true });
  } catch {
    /* ok */
  }
  if (isWin) {
    try {
      execSync("taskkill /F /IM php-cgi.exe", { stdio: "ignore", shell: true });
    } catch {
      /* ok */
    }
    try {
      const out = execSync('netstat -ano | findstr ":8000" | findstr "LISTENING"', {
        encoding: "utf8",
        shell: true,
      });
      for (const line of out.split("\n")) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && /^\d+$/.test(pid)) {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore", shell: true });
        }
      }
    } catch {
      /* puerto libre */
    }
  }
}

function trySymfony() {
  try {
    execSync("symfony server:start --no-tls --port=8000 -d", {
      cwd: BACKEND_ROOT,
      stdio: "pipe",
      shell: true,
    });
    const status = execSync("symfony server:status", {
      cwd: BACKEND_ROOT,
      encoding: "utf8",
      shell: true,
    });
    return !status.includes("Not Running");
  } catch {
    return false;
  }
}

function runPhpServer(foreground) {
  const child = spawn("php", ["-S", "127.0.0.1:8000", "-t", "public"], {
    cwd: BACKEND_ROOT,
    stdio: foreground ? "inherit" : "ignore",
    shell: true,
    detached: !foreground,
  });
  if (!foreground) {
    child.unref();
  }
  return child;
}

assertBackend();
console.log(`\n=== API Symfony ===\nCarpeta: ${BACKEND_ROOT}\n`);

stopStale();

if (trySymfony()) {
  console.log("Listo: http://127.0.0.1:8000 (Symfony CLI)");
  console.log("Parar: npm run api:stop\n");
  process.exit(0);
}

console.log(
  detach
    ? "Symfony CLI no disponible — PHP en segundo plano"
    : "Symfony CLI no disponible — PHP integrado (Ctrl+C para parar)",
);

if (detach) {
  runPhpServer(false);
  console.log("Listo: http://127.0.0.1:8000 (PHP)");
  console.log("Parar: npm run api:stop\n");
  process.exit(0);
}

const child = runPhpServer(true);
child.on("exit", (code) => process.exit(code ?? 0));
