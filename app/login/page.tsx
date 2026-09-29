"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        password: data.get("password"),
      }),
    });
    setLoading(false);
    if (response.ok) {
      window.location.href = "/";
      return;
    }
    const body = await response.json().catch(() => ({}));
    setError(body.error || "Accesso non riuscito.");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, display: "grid", gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Natural Writer</h1>
          <p style={{ opacity: 0.7 }}>Accedi per utilizzare l'applicazione.</p>
        </div>
        <label>
          Username
          <input name="username" autoComplete="username" required style={{ width: "100%", marginTop: 6 }} />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required style={{ width: "100%", marginTop: 6 }} />
        </label>
        {error && <p role="alert" style={{ margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Accesso…" : "Accedi"}</button>
      </form>
    </main>
  );
}
