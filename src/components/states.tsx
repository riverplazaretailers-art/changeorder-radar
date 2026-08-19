import { AlertTriangle, CheckCircle2, FileQuestion, Lock, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductApiError } from "@/lib/product-api";

function Frame({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger" | "success";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel flex flex-col items-start gap-3 px-5 py-6 sm:items-center sm:text-center",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        tone === "success" && "border-success/30 bg-success/5",
        className,
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-sm border border-border bg-surface-sunken text-muted-foreground",
          tone === "danger" && "border-destructive/30 text-destructive",
          tone === "success" && "border-success/30 text-success",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <div className="max-w-prose text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="panel p-4" aria-busy="true" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {label}…
      </p>
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded-sm bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Frame
      icon={<FileQuestion className="size-4" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function PermissionDeniedState({ description }: { description?: string }) {
  return (
    <Frame
      icon={<Lock className="size-4" />}
      title="You don't have access to this"
      description={
        description ??
        "Your role can view this project but cannot change finding state. Ask an account owner for manager access."
      }
    />
  );
}

export function SuccessState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Frame
      tone="success"
      icon={<CheckCircle2 className="size-4" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (error instanceof ProductApiError && error.code === "forbidden") {
    return <PermissionDeniedState description={error.message} />;
  }
  const message =
    error instanceof ProductApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong.";
  const hint =
    error instanceof ProductApiError && error.code === "network"
      ? "The ChangeOrder Radar service could not be reached. Check VITE_API_BASE_URL or your connection."
      : null;

  return (
    <Frame
      tone="danger"
      icon={<AlertTriangle className="size-4" />}
      title="This didn't load"
      description={
        <>
          <span className="block">{message}</span>
          {hint ? <span className="mt-1 block text-xs">{hint}</span> : null}
        </>
      }
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}
