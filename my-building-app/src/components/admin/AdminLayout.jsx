import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section className="min-h-screen bg-[#f6f8fb] text-slate-800">
      <div className="flex min-h-screen">
        <AdminSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          totalUsers="--"
          totalCampaigns="--"
          pendingApprovals="--"
          platformFees="--"
        />

        <main className="w-full lg:pl-72">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet context={{ setSidebarOpen }} />
          </div>
        </main>
      </div>
    </section>
  );
}