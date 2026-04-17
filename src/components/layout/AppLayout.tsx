import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  HelpCircle,
  ChevronRight,
  Bell,
} from "lucide-react";

const NAV_ITEMS = [
  {
    group: "Platform",
    links: [
      { to: "/", label: "Households", icon: Users, end: true, badge: null },
      { to: "/insights", label: "Insights", icon: BarChart3, end: false, badge: null },
    ],
  },
];

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[hsl(220,20%,98%)] overflow-hidden">

      {/* ═══ SIDEBAR ═══════════════════════════════════════════════════ */}
      <aside className="w-[232px] shrink-0 flex flex-col h-full border-r border-border bg-white">

        {/* Brand mark */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
                <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight text-foreground leading-none">
                FastTrackr
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
          {[
            { label: "Settings", icon: Settings },
            { label: "Help & Docs", icon: HelpCircle },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

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
      </aside>

      {/* ═══ MAIN AREA ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-[57px] shrink-0 bg-white border-b border-border flex items-center justify-between px-8 gap-4">
          {/* Left: breadcrumb + page title */}
          <div className="flex items-center gap-3 min-w-0">
            <Breadcrumb />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const isInsights = location.pathname === "/insights";
  const isDetail = location.pathname.startsWith("/households/");

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <NavLink
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors text-[13px]"
      >
        Households
      </NavLink>

      {isInsights && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-[13px] font-semibold text-foreground">Insights</span>
        </>
      )}
      {isDetail && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-[13px] font-semibold text-foreground">Detail</span>
        </>
      )}
      {!isInsights && !isDetail && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-[13px] font-semibold text-foreground">All Households</span>
        </>
      )}
    </nav>
  );
}
