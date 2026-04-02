import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  User,
  Wallet,
  LogOut,
  Gavel,
} from "lucide-react";

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-sky-50 text-sky-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          active
            ? "bg-sky-600 text-white"
            : "bg-slate-100 text-slate-600 group-hover:bg-white"
        }`}
      >
        <Icon size={17} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function FundraiserSidebar({ active = "dashboard" }) {
  const navigate = useNavigate();

  return (
    <aside className="hidden xl:flex xl:w-[255px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-5">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
          <Gavel size={18} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            M8BID
          </h2>
          <p className="text-[11px] text-slate-400">Fundraiser Portal</p>
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
            onClick={() => navigate("/fundraiser/dashboard")}
          />
          <SidebarItem
            icon={FolderKanban}
            label="Campaigns"
            active={active === "campaigns"}
            onClick={() => navigate("/fundraiser/campaigns")}
          />
          <SidebarItem
            icon={BarChart3}
            label="Analytics"
            active={active === "analytics"}
            onClick={() => navigate("/fundraiser/analytics")}
          />
          <SidebarItem
            icon={Wallet}
            label="Withdrawals"
            active={active === "withdrawals"}
            onClick={() => navigate("/fundraiser/withdrawals")}
          />
          <SidebarItem
            icon={User}
            label="Profile"
            active={active === "profile"}
            onClick={() => navigate("/fundraiser/profile")}
          />
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={() => navigate("/logout")}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
            <LogOut size={17} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}