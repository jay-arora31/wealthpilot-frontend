import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  HelpCircle,
  ChevronRight,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { JobStatusPill } from "@/features/households/components/JobStatusPill";
import { AudioJobFloatingToast } from "@/features/households/components/AudioJobFloatingToast";

const NAV_ITEMS = [
  {
    group: "Platform",
    links: [
      { to: "/", label: "Households", icon: Users, end: true, badge: null },
      { to: "/insights", label: "Insights", icon: BarChart3, end: false, badge: null },
    ],
  },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      {/* Brand mark */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <NavLink to="/" onClick={onNavClick} className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-foreground leading-none">
              WealthPilot
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              AI · Financial
            </p>
          </div>
        </NavLink>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV_ITEMS.map(({ group, links }) => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-1.5">
              {group}
            </p>
            <ul className="space-y-0.5">
              {links.map(({ to, label, icon: Icon, end, badge }) =>
                to ? (
                  <li key={label}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onNavClick}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                          isActive
                            ? "bg-primary text-white shadow-sm shadow-primary/30"
                            : "text-foreground/70 hover:text-foreground hover:bg-muted"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                          <span className="flex-1">{label}</span>
                          {badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ) : (
                  <li key={label}>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-foreground/50 cursor-not-allowed opacity-60">
                      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-left">{label}</span>
                      {badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {badge}
                        </span>
                      )}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom nav + user */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <NavLink
          to="/settings"
          onClick={onNavClick}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
              isActive
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </NavLink>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Help & Docs</span>
        </button>

        <div className="mt-2 pt-2.5 border-t border-border flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[11px] font-bold text-white">FA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate leading-none">
              Financial Advisor
            </p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              advisor@firm.com
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        </div>
      </div>
    </>
  );
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[hsl(220,20%,98%)] overflow-hidden">

      {/* ═══ SIDEBAR — desktop only (hidden on mobile) ══════════════════ */}
      <aside className="hidden md:flex w-[232px] shrink-0 flex-col h-full border-r border-border bg-white">
        <SidebarContent />
      </aside>

      {/* ═══ MOBILE DRAWER ══════════════════════════════════════════════ */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative z-10 w-[260px] h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent onNavClick={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ═══ MAIN AREA ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-[57px] shrink-0 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 gap-4">
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumb />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <JobStatusPill />
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-4 sm:px-6 md:px-8 py-5 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <AudioJobFloatingToast />
    </div>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const isInsights = location.pathname === "/insights";
  const isSettings = location.pathname === "/settings";
  const isDetail = location.pathname.startsWith("/households/");

  const currentLabel = isInsights
    ? "Insights"
    : isSettings
    ? "Settings"
    : isDetail
    ? "Detail"
    : "All Households";

  return (
    <nav className="flex items-center gap-1.5 text-sm min-w-0">
      {/* Root link — hide on very small screens to save space */}
      <NavLink
        to="/"
        className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors text-[13px] shrink-0"
      >
        Households
      </NavLink>
      <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
      <span className="text-[13px] font-semibold text-foreground truncate">{currentLabel}</span>
    </nav>
  );
}
