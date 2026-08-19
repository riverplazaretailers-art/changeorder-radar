import { FlaskConical, ShieldCheck } from "lucide-react";
import { getRuntimeConfig, isDemoMode, isSecureLinkMode } from "@/lib/product-api";

/**
 * Runtime mode must always be visibly labelled: synthetic demo records must
 * never be mistaken for customer data, and secure-link mode must make clear
 * that the preserved workspace — not this app — holds real project work.
 */
export function DemoBanner({ compact = false }: { compact?: boolean }) {
  if (isSecureLinkMode()) {
    const { secureWorkspaceUrl } = getRuntimeConfig();
    return (
      <div
        className="flex items-start gap-2 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground"
        role="note"
      >
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p>
          <strong className="font-semibold text-foreground">Secure workspace mode.</strong> Real
          projects, uploads and analysis stay in the preserved ChangeOrder Radar workspace
          {compact ? null : (
            <>
              {" "}
              at <span className="font-medium text-foreground">{secureWorkspaceUrl}</span>
            </>
          )}
          . This site links you there; it holds no project data.
        </p>
      </div>
    );
  }

  if (!isDemoMode()) return null;
  return (
    <div
      className="flex items-start gap-2 border-b border-warning/40 bg-warning/10 px-4 py-2 text-xs text-warning-foreground"
      role="note"
    >
      <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <p>
        <strong className="font-semibold">Demo mode.</strong> All projects, documents, findings and
        amounts shown are synthetic examples, not customer data or customer results.
        {compact
          ? null
          : " Set VITE_SECURE_WORKSPACE_URL to link the preserved ChangeOrder Radar workspace."}
      </p>
    </div>
  );
}
