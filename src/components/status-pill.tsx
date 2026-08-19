import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { FindingState, IntegrationStatus, ProjectStatus } from "@/lib/product-api";
import {
  FINDING_STATE_LABEL,
  INTEGRATION_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
} from "@/lib/display";

const pill = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs font-medium leading-5",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-sunken text-muted-foreground",
        ink: "border-border-strong bg-secondary text-secondary-foreground",
        accent: "border-primary/30 bg-accent text-accent-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/40 bg-warning/12 text-warning-foreground",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
        info: "border-info/30 bg-info/10 text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type PillTone = NonNullable<VariantProps<typeof pill>["tone"]>;

export function StatusPill({
  tone,
  children,
  className,
  dot = true,
}: {
  tone?: PillTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={cn(pill({ tone }), className)}>
      {dot ? <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden /> : null}
      {children}
    </span>
  );
}

const FINDING_TONE: Record<FindingState, PillTone> = {
  open: "warning",
  assigned: "info",
  resolved: "success",
  dismissed: "neutral",
};

export function FindingStatePill({ state }: { state: FindingState }) {
  return <StatusPill tone={FINDING_TONE[state]}>{FINDING_STATE_LABEL[state]}</StatusPill>;
}

const PROJECT_TONE: Record<ProjectStatus, PillTone> = {
  draft: "neutral",
  analyzing: "info",
  analyzed: "accent",
  failed: "danger",
  closed: "ink",
};

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  return <StatusPill tone={PROJECT_TONE[status]}>{PROJECT_STATUS_LABEL[status]}</StatusPill>;
}

const INTEGRATION_TONE: Record<IntegrationStatus, PillTone> = {
  live: "success",
  pilot: "info",
  planned: "neutral",
};

export function IntegrationStatusPill({ status }: { status: IntegrationStatus }) {
  return (
    <StatusPill tone={INTEGRATION_TONE[status]}>{INTEGRATION_STATUS_LABEL[status]}</StatusPill>
  );
}
