import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  BarChart3,
  User,
  Wallet,
  Heart,
  LogOut,
  Gavel,
} from "lucide-react";
import { logoutUser } from "../../api/user";

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-[#f1edff] text-[#6f5cf2]"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          active
            ? "bg-[#6f5cf2] text-white"
            : "bg-slate-100 text-slate-600 group-hover:bg-white"
        }`}
      >
        <Icon size={17} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function InvestorSidebar({ active = "dashboard" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden h-screen xl:flex xl:w-[255px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-5">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6f5cf2] text-white shadow-sm">
          <Gavel size={18} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            M8BID
          </h2>
          <p className="text-[11px] text-slate-400">Investor Portal</p>
        </div>
      </button>

      <div className="mt-10">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Main Menu
        </p>

        <div className="mt-3 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={active === "dashboard"}
            onClick={() => navigate("/investor/dashboard")}
          />
          <SidebarItem
            icon={BriefcaseBusiness}
            label="Portfolio"
            active={active === "portfolio"}
            onClick={() => navigate("/investor/portfolio")}
          />
          <SidebarItem
            icon={BarChart3}
            label="Analytics"
            active={active === "analytics"}
            onClick={() => navigate("/investor/analytics")}
          />
          <SidebarItem
            icon={Wallet}
            label="Transactions"
            active={active === "transactions"}
            onClick={() => navigate("/investor/transactions")}
          />
          <SidebarItem
            icon={User}
            label="Profile"
            active={active === "profile"}
            onClick={() => navigate("/investor/profile")}
          />
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-600">
            <LogOut size={17} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
