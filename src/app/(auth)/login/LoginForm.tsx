"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/feed";
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-md">
      {error && (
        <div className="flex items-center gap-xs bg-error-container text-on-error-container rounded-lg px-md py-sm text-body-md">
          <Icon name="error" size={20} />
          {error}
        </div>
      )}
      <Field label="Email">
        <Input name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <Input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="w-full mt-xs">
        {pending ? "Signing in…" : "Log in"}
      </Button>

      <div className="flex items-center gap-md my-xs">
        <div className="h-px flex-1 bg-outline-variant" />
        <span className="text-label-sm text-on-surface-variant">OR</span>
        <div className="h-px flex-1 bg-outline-variant" />
      </div>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <Icon name="account_circle" size={20} />
        Continue with Google
      </Button>
    </form>
  );
}
