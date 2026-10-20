"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <label htmlFor="password" className="text-sm font-semibold">Moderator password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" className="rounded-xl border border-line bg-surface px-3.5 py-2.5" required />
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <button disabled={pending} className="self-start rounded-full bg-cobalt px-5 py-2.5 font-semibold text-surface disabled:opacity-60">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
