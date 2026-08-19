import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldAlert,
  X,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo-banner";
import { ProductMark } from "@/components/site-chrome";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/projects", label: "Projects", icon: FolderKanban, exact: false },
  { to: "/app/history", label: "History", icon: Activity, exact: false },
  { to: "/app/settings", label: "Settings", icon: Settings, exact: false },
  { to: "/app/billing", label: "Account & billing", icon: CreditCard, exact: false },
  { to: "/app/operations", label: "Operations", icon: ShieldAlert, exact: false },
  { to: "/app/help", label: "Help", icon: LifeBuoy, exact: false },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {NAV.map(({ to, label, icon: Icon, exact }) => (
        <li key={to}>
          <Link
            to={to}
            activeOptions={{ exact }}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{
              className: "bg-sidebar-accent text-accent-foreground font-medium",
            }}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AppShell({
  title,
  description,
  actions,
  breadcrumb,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  children: ReactNode;
}) {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);

  async function handleSignOut() {
    await signOut();
    await navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner compact />
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          <div className="border-b border-sidebar-border px-4 py-4">
            <Link to="/app" aria-label="Dashboard">
              <ProductMark />
            </Link>
          </div>
          <nav aria-label="Application" className="flex-1 overflow-y-auto p-2">
            <NavList />
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <p className="truncate text-sm font-medium capitalize">{user?.name ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">Role: {user?.role}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" aria-hidden />
              Log out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
            >
              <Menu className="size-4" />
            </Button>
            <ProductMark />
          </header>

          {drawer ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                className="absolute inset-0 bg-foreground/40"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-lg">
                <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
                  <ProductMark />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close menu"
                    onClick={() => setDrawer(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <nav aria-label="Application" className="flex-1 overflow-y-auto p-2">
                  <NavList onNavigate={() => setDrawer(false)} />
                </nav>
                <div className="border-t border-sidebar-border p-3">
                  <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="size-4" aria-hidden />
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="border-b border-border bg-surface-raised">
            <div className="mx-auto max-w-6xl px-4 py-5">
              {breadcrumb ? <div className="mb-2 text-xs">{breadcrumb}</div> : null}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
                  {description ? (
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
                  ) : null}
                </div>
                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
              </div>
            </div>
          </div>

          <main className={cn("mx-auto max-w-6xl px-4 py-6")}>{children}</main>
        </div>
      </div>
    </div>
  );
}
