// Minimal module resolution hooks so the built-in Node test runner can execute
// the project's TypeScript unit tests directly (with --experimental-strip-types)
// without adding any test-framework dependency. Handles the "@/*" path alias and
// extensionless relative imports the same way Next's bundler resolution does.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function resolveFile(p) {
  if (existsSync(p) && path.extname(p)) return p;
  for (const ext of [".ts", ".tsx", ".mjs", ".js"]) {
    if (existsSync(p + ext)) return p + ext;
  }
  for (const ext of [".ts", ".tsx"]) {
    const idx = path.join(p, "index" + ext);
    if (existsSync(idx)) return idx;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const abs = resolveFile(path.join(ROOT, specifier.slice(2)));
    if (abs) return { url: pathToFileURL(abs).href, shortCircuit: true };
  }
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL &&
    !path.extname(specifier)
  ) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const abs = resolveFile(path.resolve(parentDir, specifier));
    if (abs) return { url: pathToFileURL(abs).href, shortCircuit: true };
  }
  return next(specifier, context);
}
