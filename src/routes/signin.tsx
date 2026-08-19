import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site-chrome";
import { ErrorState } from "@/components/states";
import { useSession } from "@/lib/session";
import { analytics } from "@/lib/analytics";
import { isDemoMode, isSecureLinkMode } from "@/lib/product-api";
import { WorkspaceCta } from "@/components/workspace-cta";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — ChangeOrder Radar" },
      {
        name: "description",
        content:
          "Sign in to ChangeOrder Radar to review project findings, evidence and the action register for your jobs.",
      },
      { property: "og:title", content: "Sign in — ChangeOrder Radar" },
      { property: "og:description", content: "Access your ChangeOrder Radar projects." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  if (isSecureLinkMode()) return <SecureWorkspaceSignIn />;
  return <CredentialSignIn />;
}

function SecureWorkspaceSignIn() {
  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ChangeOrder Radar sign-in is handled by the secure workspace that holds your project
          records, documents and findings. This site does not hold customer data.
        </p>
        <div className="panel mt-6 space-y-4 p-5">
          <WorkspaceCta path="/sign-in" label="Sign in to the secure workspace" />
          <p className="text-xs text-muted-foreground">
            Opens the preserved ChangeOrder Radar workspace in a new tab. Upload, deterministic
            analysis, evidence and finding decisions all happen there.
          </p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            to="/request-access"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Request private beta access
          </Link>
          .
        </p>
      </section>
    </SiteLayout>
  );
}

function CredentialSignIn() {
  const { signIn, status } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await signIn(email);
      await navigate({ to: "/app" });
    } catch (cause) {
      setError(cause);
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ChangeOrder Radar is in private beta. Accounts are provisioned by the team.
        </p>

        <form onSubmit={handleSubmit} className="panel mt-6 space-y-4 p-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@contractor.com"
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="text-xs text-muted-foreground">
              {isDemoMode()
                ? "Demo mode: any valid email address signs you into the synthetic demo account."
                : "Use the address your account was provisioned with."}
            </p>
          </div>

          {error ? <ErrorState error={error} /> : null}

          <Button type="submit" className="w-full" disabled={pending || status === "loading"}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            to="/request-access"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => analytics.track("core_workflow_started", { surface: "signin" })}
          >
            Request private beta access
          </Link>
          .
        </p>
      </section>
    </SiteLayout>
  );
}
