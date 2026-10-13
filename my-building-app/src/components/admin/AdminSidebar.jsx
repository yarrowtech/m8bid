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

  const items = [
    { label: "Dashboard", path: "/admin/dashboard", icon: FaFolderOpen },
    { label: "Users", path: "/admin/users", icon: FaUsers },
    { label: "Campaigns", path: "/admin/campaigns", icon: FaBullhorn },
    { label: "Transactions", path: "/admin/transactions", icon: FaWallet },
    { label: "Contributions & Refunds", path: "/admin/contributions", icon: FaWallet },
    { label: "Analytics", path: "/admin/analytics", icon: FaChartLine },
    { label: "Website Analytics", path: "/admin/website-analytics", icon: FaGlobe },
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
          "admin-sidebar fixed left-0 top-0 z-40 h-dvh w-72 border-r border-white/10 bg-[#0f172a] text-white shadow-xl transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:visible lg:translate-x-0 lg:transition-none",
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Admin Panel
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  Control Center
                </h2>
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <nav aria-label="Admin navigation" className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )
                    }
                    onClick={() => setOpen(false)}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-black/10">
                      <Icon />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-400/20 text-amber-300">
                  <FaUserShield />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Overview</p>
                  <p className="text-xs text-slate-400">Live metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-sm font-semibold text-white"
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-white">{value}</p>
    </div>
  );
}
