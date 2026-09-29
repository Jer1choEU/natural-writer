const encoder = new TextEncoder();

async function signature(secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode("natural-writer-auth"));
  return Array.from(new Uint8Array(signed), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createAuthToken() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET non configurato");
  return signature(secret);
}

export async function isValidAuthToken(token?: string) {
  if (!token || !process.env.AUTH_SECRET) return false;
  return token === (await signature(process.env.AUTH_SECRET));
}

export const AUTH_COOKIE = "natural_writer_session";
