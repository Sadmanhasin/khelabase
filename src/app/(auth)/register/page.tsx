import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-xl">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Create your account</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Join Bangladesh&apos;s football community in seconds.
        </p>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg premium-card-shadow">
        <RegisterForm />
      </div>
      <p className="text-center mt-lg text-body-md text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
