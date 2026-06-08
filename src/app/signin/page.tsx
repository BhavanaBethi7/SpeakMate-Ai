import OAuthSignInForm from "@/components/OAuthSignInForm";
import { isGoogleOAuthConfigured } from "@/lib/auth-providers";
import { Suspense } from "react";

export default function SignInPage() {
  const googleConfigured = isGoogleOAuthConfigured();

  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-24">Loading...</div>}>
      <OAuthSignInForm mode="signin" googleConfigured={googleConfigured} />
    </Suspense>
  );
}
