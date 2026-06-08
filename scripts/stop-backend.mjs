import { execSync } from "child_process";
import { assertBackend, BACKEND_ROOT } from "./paths.mjs";

assertBackend();

try {
  execSync("symfony server:stop", { cwd: BACKEND_ROOT, stdio: "inherit", shell: true });
} catch {
  /* ok */
}

if (process.platform === "win32") {
  try {
    execSync("taskkill /F /IM php-cgi.exe", { stdio: "inherit", shell: true });
  } catch {
    /* ok */
  }
}

console.log("API detenida.");
