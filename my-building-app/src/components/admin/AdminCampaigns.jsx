import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaBars, FaSearch } from "react-icons/fa";
import { getAdminCampaigns } from "../../api/admin";

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN");
};

const INR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

export default function AdminCampaigns() {
  const { setSidebarOpen } = useOutletContext();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAdminCampaigns();
        setCampaigns(res?.campaigns || res?.data?.campaigns || []);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, []);

  const filtered = campaigns.filter((c) =>
    [c?.projectTitle, c?.title, c?.email, c?.status].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            <FaBars />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Campaigns
            </h1>
            <p className="mt-1 text-sm text-slate-500">Review and monitor campaigns</p>
          </div>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Campaign</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Raised</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length > 0 ? (
                filtered.map((campaign, i) => (
                  <tr key={campaign?._id || i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {campaign?.projectTitle || campaign?.title || "Untitled"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{campaign?.status || "—"}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">
                      {INR(campaign?.moneyRaised || campaign?.currentFunding || 0)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(campaign?.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                    No campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}