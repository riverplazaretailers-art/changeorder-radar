import { FlaskConical } from "lucide-react";
import { isDemoMode } from "@/lib/product-api";

/**
 * Demo mode must always be visibly labelled so synthetic records are never
 * mistaken for customer data or customer proof.
 */
export function DemoBanner({ compact = false }: { compact?: boolean }) {
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
        {compact ? null : " Set VITE_API_BASE_URL to connect the ChangeOrder Radar backend."}
      </p>
    </div>
  );
}
