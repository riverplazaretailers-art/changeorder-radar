import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/app-shell";
import { ErrorState, LoadingState, PermissionDeniedState, SuccessState } from "@/components/states";
import { settingsQuery } from "@/lib/queries";
import { getProductApi, isDemoMode, type AccountSettings } from "@/lib/product-api";
import { useSession } from "@/lib/session";
import { canActOnFindings } from "@/lib/workflow/finding-transitions";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const canAct = canActOnFindings(user?.role);
  const queryClient = useQueryClient();
  const settings = useQuery(settingsQuery());
  const [form, setForm] = useState<AccountSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => getProductApi().updateSettings(form as AccountSettings),
    onSuccess: async () => {
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return (
    <AppShell title="Settings" description="Account defaults used across every project review.">
      {settings.isPending || !form ? (
        settings.isError ? (
          <ErrorState error={settings.error} onRetry={() => settings.refetch()} />
        ) : (
          <LoadingState label="Loading settings" rows={3} />
        )
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <form
            className="panel space-y-5 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                disabled={!canAct}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="currency">Default currency</Label>
                <Input
                  id="currency"
                  value={form.defaultCurrency}
                  disabled={!canAct}
                  onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reminder">Closeout reminder (days before)</Label>
                <Input
                  id="reminder"
                  type="number"
                  min={0}
                  max={120}
                  value={form.closeoutReminderDays}
                  disabled={!canAct}
                  onChange={(e) =>
                    setForm({ ...form, closeoutReminderDays: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
              <div>
                <Label htmlFor="notify">Email me when an analysis finishes</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Notifications contain project names and counts only — never document contents.
                </p>
              </div>
              <Switch
                id="notify"
                checked={form.notifyOnAnalysisComplete}
                disabled={!canAct}
                onCheckedChange={(checked) =>
                  setForm({ ...form, notifyOnAnalysisComplete: checked })
                }
              />
            </div>

            {!canAct ? <PermissionDeniedState description="Viewer access is read-only for account settings." /> : null}
            {save.isError ? <ErrorState error={save.error} /> : null}
            {saved ? <SuccessState title="Settings saved" /> : null}

            <Button type="submit" disabled={!canAct || save.isPending}>
              {save.isPending ? "Saving…" : "Save settings"}
            </Button>
          </form>

          <aside className="panel h-fit p-5 text-sm">
            <h2 className="text-sm font-semibold">Signed in as</h2>
            <p className="mt-2">{user?.name}</p>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              Role: {user?.role}
            </p>
            <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              {isDemoMode()
                ? "Demo mode is active. Changes are held in memory and are discarded on reload."
                : "Connected to the ChangeOrder Radar service. Changes are audited."}
            </p>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
