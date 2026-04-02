import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FaTimes,
  FaUsers,
  FaBullhorn,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";
import {
  FaFolderOpen,
  FaRightFromBracket,
  FaUserShield,
} from "react-icons/fa6";

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
    { label: "Analytics", path: "/admin/analytics", icon: FaChartLine },
  ];

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    navigate("/login");
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
          "fixed left-0 top-0 z-40 h-screen w-72 bg-[#0f172a] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
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
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10 lg:hidden"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 py-5">
            <nav className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )
                    }
                    onClick={() => setOpen(false)}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-black/10">
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

          <div className="border-t border-white/10 p-4">
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