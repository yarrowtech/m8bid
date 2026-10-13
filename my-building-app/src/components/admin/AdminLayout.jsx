import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { pathname } = useLocation();

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
    <section className="admin-workspace h-dvh overflow-hidden bg-[#f6f8fb] text-slate-800">
      <div className="flex h-full">
        <AdminSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          totalUsers="--"
          totalCampaigns="--"
          pendingApprovals="--"
          platformFees="--"
        />

        <main
          ref={contentRef}
          className={`h-full min-w-0 w-full overscroll-contain lg:pl-72 ${sidebarOpen ? "overflow-hidden lg:overflow-y-auto" : "overflow-y-auto"}`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet context={{ setSidebarOpen }} />
          </div>
        </main>
      </div>
    </section>
  );
}
