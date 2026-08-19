import { Link } from "@tanstack/react-router";
import { Menu, Radar } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo-banner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/workflow", label: "How it works" },
  { to: "/integrations", label: "Integrations" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/faq", label: "FAQ" },
] as const;

export function ProductMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground"
        aria-hidden
      >
        <Radar className="size-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          ChangeOrder Radar
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          A TwoRiverOps solution
        </span>
      </span>
    </span>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" aria-label="ChangeOrder Radar home">
          <ProductMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/request-access">Request private beta</Link>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="size-4" />
        </Button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border md:hidden">
          <ul className="mx-auto max-w-6xl px-2 py-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-3 py-2.5 text-sm text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 border-t border-border px-3 pt-3">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/signin" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to="/request-access" onClick={() => setOpen(false)}>
                  Request access
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <ProductMark />
          <p className="max-w-xs text-sm text-muted-foreground">
            Software for expensive operational problems.
          </p>
        </div>
        <nav aria-label="Product">
          <p className="eyebrow">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <p className="eyebrow">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/signin" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/request-access" className="text-muted-foreground hover:text-foreground">
                Request private beta
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-muted-foreground hover:text-foreground">
                Help
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Status</p>
          <p className="mt-3 text-sm text-muted-foreground">
            ChangeOrder Radar is in private beta. Document intake and PDF/CSV analysis are live;
            project-management and accounting integrations are planned.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} TwoRiverOps. All rights reserved.</p>
          <p>ChangeOrder Radar — private beta.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface-raised">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {lede ? <p className="mt-3 max-w-2xl text-base text-muted-foreground">{lede}</p> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
