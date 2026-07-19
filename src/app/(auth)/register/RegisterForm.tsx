"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/auth";
import { Input, Select, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { BD_DISTRICTS } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerUser(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Auto sign-in after successful registration.
      const signInRes = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });
      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/feed");
        router.refresh();
      }
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
      <Field label="Full name">
        <Input name="name" placeholder="Sadman Rahman" required autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
      </Field>
      <Field label="Password" hint="At least 6 characters.">
        <Input name="password" type="password" placeholder="••••••••" required autoComplete="new-password" />
      </Field>
      <Field label="District (optional)">
        <Select name="district" defaultValue="">
          <option value="">Select your district</option>
          {BD_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="w-full mt-xs">
        {pending ? "Creating account…" : "Create account"}
        {!pending && <Icon name="arrow_forward" size={20} />}
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
        onClick={() => signIn("google", { callbackUrl: "/feed" })}
      >
        <Icon name="account_circle" size={20} />
        Continue with Google
      </Button>
    </form>
  );
}
