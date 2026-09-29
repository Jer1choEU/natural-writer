import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, createAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Login non configurato sul server." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!safeEqual(username, expectedUser) || !safeEqual(password, expectedPassword)) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, await createAuthToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
