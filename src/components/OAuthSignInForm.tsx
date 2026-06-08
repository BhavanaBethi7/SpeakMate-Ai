"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type OAuthSignInFormProps = {
  mode: "signin" | "signup";
  googleConfigured: boolean;
};

const errorMessages: Record<string, string> = {
  OAuthSignin: "Could not start sign-in. Check that Google OAuth credentials are configured.",
  OAuthCallback: "Something went wrong during sign-in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  Configuration: "Auth is misconfigured on the server. Check your environment variables.",
  AccessDenied: "Access was denied. You may have cancelled the sign-in.",
  Default: "Sign-in failed. Please try again.",
};

export default function OAuthSignInForm({ mode, googleConfigured }: OAuthSignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const errorCode = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
    setLoading(false);
  }

  const title =
    mode === "signin" ? "Sign in to SpeakMate AI" : "Create your SpeakMate AI account";
  const subtitle =
    mode === "signin"
      ? "Continue with your Google account."
      : "Sign up with your Google account to get started.";
  const buttonLabel =
    mode === "signin" ? "Sign in with Google" : "Sign up with Google";

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

      {errorCode ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessages[errorCode] ?? errorMessages.Default}
        </p>
      ) : null}

      {!googleConfigured ? (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p className="font-medium">Google OAuth is not configured yet.</p>
          <p className="mt-2 leading-6">
            Add your Google credentials to{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local</code>, then restart
            the dev server:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
            {`GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret`}
          </pre>
        </div>
      ) : (
        <div className="mt-6">
          <button
            type="button"
            disabled={loading || status === "loading"}
            onClick={handleGoogleSignIn}
            className="inline-flex items-center gap-3 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Redirecting..." : buttonLabel}
          </button>
        </div>
      )}

      <p className="mt-8 text-sm text-slate-600">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-sky-600 hover:text-sky-700">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
