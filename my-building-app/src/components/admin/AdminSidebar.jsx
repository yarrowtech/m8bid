import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FaTimes,
  FaUsers,
  FaBullhorn,
  FaWallet,
  FaChartLine,
  FaGlobe,
} from "react-icons/fa";
import {
  FaFolderOpen,
  FaRightFromBracket,
  FaUserShield,
  FaHandHoldingDollar,
} from "react-icons/fa6";
import { logoutUser } from "../../api/user";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AdminSidebar({
  open,
  setOpen,
  totalUsers = "--",
  totalCampaigns = "--",
  pendingApprovals = "--",
  platformFees = "--",
}) {
  const navigate = useNavigate();

  const sections = [
    { title: "Overview", items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: FaFolderOpen },
      { label: "Analytics", path: "/admin/analytics", icon: FaChartLine },
      { label: "Website Analytics", path: "/admin/website-analytics", icon: FaGlobe },
    ] },
    { title: "Manage", items: [
      { label: "Users", path: "/admin/users", icon: FaUsers },
      { label: "Campaigns", path: "/admin/campaigns", icon: FaBullhorn, badge: pendingApprovals },
    ] },
    { title: "Finance", items: [
      { label: "Transactions", path: "/admin/transactions", icon: FaWallet },
      { label: "Contributions & Refunds", path: "/admin/contributions", icon: FaHandHoldingDollar },
    ] },
  ];

  const handleLogout = () => {
    Cookies.remove("token");
    logoutUser();
    setOpen(false);
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "admin-sidebar fixed left-0 top-0 z-40 h-dvh w-72 border-r border-white/5 bg-[linear-gradient(180deg,#1e1b4b_0%,#172554_55%,#0f172a_100%)] text-white shadow-2xl transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:visible lg:translate-x-0 lg:transition-none",
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 px-6 pb-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 text-lg text-white shadow-lg shadow-indigo-900/50">
                  <FaUserShield />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-300">Admin Panel</p>
                  <h2 className="text-lg font-extrabold tracking-tight">Control Center</h2>
                </div>
              </div>

              <button
                aria-label="Close admin navigation"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10 lg:hidden"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
            <nav aria-label="Admin navigation" className="space-y-5">
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/60">{section.title}</p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.label}
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-150",
                              isActive
                                ? "bg-gradient-to-r from-indigo-500/90 to-blue-500/70 text-white shadow-lg shadow-indigo-950/40"
                                : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                            )
                          }
                          onClick={() => setOpen(false)}
                        >
                          {({ isActive }) => (
                            <>
                              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px]", isActive ? "bg-white/20" : "bg-white/5 text-indigo-200 group-hover:bg-white/10")}>
                                <Icon />
                              </span>
                              <span className="flex-1">{item.label}</span>
                              {Number(item.badge) > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">{item.badge}</span>}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold text-white">Live metrics</p>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />Live</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MiniDarkStat label="Users" value={totalUsers} />
                <MiniDarkStat label="Campaigns" value={totalCampaigns} />
                <MiniDarkStat label="Pending" value={pendingApprovals} />
                <MiniDarkStat label="Fees" value={platformFees} />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-white"
            >
              <FaRightFromBracket />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function MiniDarkStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200/70">{label}</p>
      <p className="mt-0.5 truncate text-base font-extrabold text-white">{value}</p>
    </div>
  );
}
