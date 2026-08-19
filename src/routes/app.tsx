import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoadingState } from "@/components/states";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { status } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "anonymous") void navigate({ to: "/signin", replace: true });
  }, [status, navigate]);

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <LoadingState label="Checking your session" rows={2} />
      </div>
    );
  }

  return <Outlet />;
}
