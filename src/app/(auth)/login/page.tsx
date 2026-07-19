import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-xl">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Welcome back</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Log in to continue your football journey.
        </p>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg premium-card-shadow">
        <LoginForm />
      </div>
      <p className="text-center mt-lg text-body-md text-on-surface-variant">
        New to Khelabase?{" "}
        <Link href="/join" className="text-primary font-bold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
