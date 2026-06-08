import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FRONTEND_ROOT = path.resolve(__dirname, "..");
export const BACKEND_ROOT = path.resolve(FRONTEND_ROOT, "../../backend/srm-compras-backend");
export const BACKEND_INDEX = path.join(BACKEND_ROOT, "public", "index.php");

export function assertBackend() {
  if (!fs.existsSync(BACKEND_INDEX)) {
    console.error("\n[ERROR] No encuentro el backend Symfony en:");
    console.error(`  ${BACKEND_ROOT}`);
    console.error("\nDebe existir public/index.php. Abre el repo completo (frontend + backend).\n");
    process.exit(1);
  }
  return BACKEND_ROOT;
}
