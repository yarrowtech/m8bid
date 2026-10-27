import { getAdminDashboard } from "../../api/admin";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminTheme.css";

export default function AdminLayout() {
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    getAdminDashboard().then((response) => { if (active) setSummary(response.stats); }).catch(() => {});
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  return (
    <section data-scroll-motion-disabled className="admin-workspace h-dvh overflow-hidden text-slate-800">
      <div className="flex h-full">
        <AdminSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          totalUsers={summary?.totalUsers ?? "--"}
          totalCampaigns={summary?.totalCampaigns ?? "--"}
          pendingApprovals={summary?.pendingCampaigns ?? "--"}
          platformFees={summary?.platformFees ?? "--"}
        />

        <main
          ref={contentRef}
          className={`h-full min-w-0 w-full overscroll-contain lg:pl-72 ${sidebarOpen ? "overflow-hidden lg:overflow-y-auto" : "overflow-y-auto"}`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet context={{ setSidebarOpen, setSummary }} />
          </div>
        </main>
      </div>
    </section>
  );
}
