import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE, isValidAuthToken } from "@/lib/auth";

/** Current deployment has one credential pair. All sessions of this login share one owner.
 * Future independent accounts should replace this with an authenticated immutable user ID. */
export function configuredLearningOwnerId(): string {
  // Stable across credential changes. Future multi-account auth will supply its own immutable user ID.
  return createHash("sha256").update("natural-writer-owner:" + (process.env.LEARNING_OWNER_ID || "primary")).digest("hex");
}

export async function requireLearningOwner(): Promise<string> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!(await isValidAuthToken(token)) || !process.env.AUTH_USERNAME) {
    throw new Error("UNAUTHORIZED");
  }
  return configuredLearningOwnerId();
}

export function verifyLearningOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    throw new Error("INVALID_ORIGIN");
  }
}
