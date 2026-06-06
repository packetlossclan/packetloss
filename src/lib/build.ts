import { execSync } from "node:child_process";

export function getBuildId(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return process.env.npm_package_version ?? "dev";
  }
}
