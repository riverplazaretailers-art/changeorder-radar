import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workspaceLink } from "@/lib/product-api";
import { analytics } from "@/lib/analytics";

/**
 * Hand-off to the preserved secure ChangeOrder Radar workspace.
 * Renders nothing unless a validated workspace URL is configured, so this
 * never asserts an integration that does not exist.
 */
export function WorkspaceCta({
  path = "/",
  label = "Continue in the secure workspace",
  event = "core_workflow_started",
  variant = "default",
  className,
}: {
  path?: string;
  label?: string;
  event?: "core_workflow_started" | "repeat_usage";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const href = workspaceLink(path);
  if (!href) return null;
  return (
    <Button asChild variant={variant} className={className}>
      <a
        href={href}
        rel="noopener noreferrer nofollow"
        target="_blank"
        onClick={() => analytics.track(event, { surface: "secure_workspace_handoff" })}
      >
        {label}
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </Button>
  );
}
