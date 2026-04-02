import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FaBars,
  FaUsers,
  FaBullhorn,
  FaWallet,
  FaCoins,
  FaChartLine,
  FaExclamationTriangle,
  FaTimes,
  FaEye,
  FaSearch,
} from "react-icons/fa";
import {
  FaClipboardCheck,
  FaMoneyBillWave,
  FaCircleCheck,
} from "react-icons/fa6";
import { getAdminDashboard, getAdminUsers } from "../../api/admin";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const PIE_COLORS = ["#0f172a", "#f59e0b"];

const INR = (value) => {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${num}`;
  }
};

const formatNumber = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN").format(num);
};

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusTone = (status = "") => {
  const s = String(status).toLowerCase();
  if (["approved", "active", "completed", "success"].includes(s)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["pending", "review", "processing"].includes(s)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (["rejected", "failed", "inactive", "blocked"].includes(s)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");

  const fetchDashboardData = async (range = "7d") => {
    try {
      setLoading(true);
      setError("");

      const dashboardRes = await getAdminDashboard(range);
      const normalizedDashboard =
        dashboardRes?.stats ||
        dashboardRes?.data?.stats ||
        dashboardRes?.data ||
        dashboardRes ||
        {};

      setDashboard(normalizedDashboard);

      try {
        const usersRes = await getAdminUsers();
        const normalizedUsers =
          usersRes?.users || usersRes?.data?.users || usersRes?.data || [];
        setAllUsers(Array.isArray(normalizedUsers) ? normalizedUsers : []);
      } catch (userErr) {
        console.error("Error fetching admin users:", userErr);
        setAllUsers([]);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange]);

  const overview = dashboard?.overview || {};
  const recentActivities = dashboard?.recentActivities || {};
  const growth = dashboard?.growth || {};

  const totalUsers = overview.totalUsers ?? dashboard?.totalUsers ?? 0;
  const totalCampaigns =
    overview.totalCampaigns ??
    dashboard?.totalFundraisers ??
    dashboard?.totalCampaigns ??
    0;
  const totalInvestments =
    overview.totalInvestments ??
    dashboard?.totalInvestments ??
    dashboard?.totalInvestment ??
    0;
  const totalRevenue =
    overview.totalRevenue ??
    dashboard?.totalRevenue ??
    dashboard?.totalMoneyRaised ??
    0;

  const activeCampaigns =
    growth?.activeCampaigns ?? dashboard?.activeCampaigns ?? 0;
  const activeUsers = growth?.activeUsers ?? dashboard?.activeUsers ?? 0;

  const recentCampaigns =
    recentActivities.campaigns || dashboard?.recentFundraisers || [];

  const monthlyRaised = dashboard?.monthlyRaised || [];
  const monthlyUsers = dashboard?.monthlyUsers || growth?.monthlyUsers || [];

  const chartData = useMemo(() => {
    if (Array.isArray(monthlyRaised) && monthlyRaised.length > 0) {
      return monthlyRaised.map((item) => ({
        month: item.month || "—",
        raised: Number(item.raised || item.amount || 0),
      }));
    }

    return [
      { month: "Jan", raised: 0 },
      { month: "Feb", raised: 0 },
      { month: "Mar", raised: 0 },
      { month: "Apr", raised: 0 },
      { month: "May", raised: 0 },
      { month: "Jun", raised: 0 },
    ];
  }, [monthlyRaised]);

  const usersChartData = useMemo(() => {
    if (Array.isArray(monthlyUsers) && monthlyUsers.length > 0) {
      return monthlyUsers.map((item) => ({
        month: item.month || "—",
        users: Number(item.users || item.count || 0),
      }));
    }

    return [
      { month: "Jan", users: 0 },
      { month: "Feb", users: 0 },
      { month: "Mar", users: 0 },
      { month: "Apr", users: 0 },
      { month: "May", users: 0 },
      { month: "Jun", users: 0 },
    ];
  }, [monthlyUsers]);

  const pieData = useMemo(() => {
    const investments = Number(totalInvestments || 0);
    const fundraising = Number(totalRevenue || 0);

    if (investments === 0 && fundraising === 0) {
      return [
        { name: "Investments", value: 1 },
        { name: "Fundraising", value: 1 },
      ];
    }

    return [
      { name: "Investments", value: investments },
      { name: "Fundraising", value: fundraising },
    ];
  }, [totalInvestments, totalRevenue]);

  const filteredUsers = useMemo(() => {
    const nonAdminUsers = allUsers.filter((user) => {
      const role = String(user?.role || "").toLowerCase();
      const name = String(user?.name || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();

      if (role === "admin" || role === "superadmin") return false;
      if (name === "admin") return false;
      if (email.includes("admin")) return false;

      return true;
    });

    const query = userSearch.trim().toLowerCase();
    if (!query) return nonAdminUsers;

    return nonAdminUsers.filter((user) => {
      return (
        String(user?.name || "").toLowerCase().includes(query) ||
        String(user?.email || "").toLowerCase().includes(query) ||
        String(user?.role || "").toLowerCase().includes(query) ||
        String(user?._id || "").toLowerCase().includes(query)
      );
    });
  }, [allUsers, userSearch]);

  const quickActions = [
    { title: "Users", icon: FaUsers, onClick: () => navigate("/admin/users") },
    {
      title: "Campaigns",
      icon: FaClipboardCheck,
      onClick: () => navigate("/admin/campaigns"),
    },
    {
      title: "Transactions",
      icon: FaMoneyBillWave,
      onClick: () => navigate("/admin/transactions"),
    },
    {
      title: "Analytics",
      icon: FaChartLine,
      onClick: () => navigate("/admin/analytics"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="rounded-[30px] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 animate-pulse" />
          <p className="text-lg font-semibold text-slate-800">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="rounded-[30px] bg-white px-8 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
            <FaExclamationTriangle />
          </div>
          <p className="text-lg font-semibold text-slate-800">{error}</p>
          <button
            onClick={() => fetchDashboardData(timeRange)}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
            >
              <FaBars />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Monitor users, campaigns, investments and platform performance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  timeRange === range
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Users"
          value={formatNumber(totalUsers)}
          subtitle={`${formatNumber(activeUsers)} active`}
          icon={FaUsers}
          theme="amber"
        />
        <KpiCard
          title="Total Campaigns"
          value={formatNumber(totalCampaigns)}
          subtitle={`${formatNumber(activeCampaigns)} active`}
          icon={FaBullhorn}
          theme="sky"
        />
        <KpiCard
          title="Investments"
          value={formatNumber(totalInvestments)}
          subtitle="Recorded investments"
          icon={FaCoins}
          theme="emerald"
        />
        <KpiCard
          title="Revenue"
          value={INR(totalRevenue)}
          subtitle="Platform total"
          icon={FaWallet}
          theme="violet"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Recent Campaigns
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest campaign submissions
              </p>
            </div>
            <FaBullhorn className="text-slate-400" />
          </div>

          <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {campaign?.projectTitle || campaign?.title || "Untitled"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {campaign?.creator?.name ||
                          campaign?.email ||
                          "Unknown creator"}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        getStatusTone(campaign?.status)
                      )}
                    >
                      {campaign?.status || "new"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formatDate(campaign?.createdAt)}</span>
                    <span className="font-semibold text-emerald-600">
                      {INR(
                        campaign?.moneyRaised ||
                          campaign?.currentFunding ||
                          campaign?.raised ||
                          0
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No recent campaigns." compact />
            )}
          </div>
        </div>

        <div className="xl:col-span-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Monthly Users
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                User growth by month
              </p>
            </div>
            <FaChartLine className="text-slate-400" />
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersChartData} barCategoryGap={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [formatNumber(val), "Users"]}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                  }}
                />
                <Bar
                  dataKey="users"
                  fill="#0f172a"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-3 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Quick Actions
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Admin shortcuts</p>
            </div>
            <FaCircleCheck className="text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={item.onClick}
                  className="group rounded-[18px] border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100"
                >
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <Icon className="text-sm" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Users List
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Search and view only non-admin users
            </p>
          </div>

          <div className="relative w-full md:w-[320px]">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name, email, role, id..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user?._id || index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {user?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {user?.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">
                        {user?.role || "user"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            getStatusTone(
                              user?.status ||
                                (user?.isActive ? "active" : "inactive")
                            )
                          )}
                        >
                          {user?.status ||
                            (user?.isActive ? "active" : "inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(user?.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          <FaEye />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No matching non-admin users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Monthly Raised
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Fundraising amount trend month by month
              </p>
            </div>
            <FaBullhorn className="text-slate-400 text-lg" />
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#475569", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => INR(val)}
                  contentStyle={{
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  }}
                />
                <Bar
                  dataKey="raised"
                  fill="#f59e0b"
                  radius={[12, 12, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Investments vs Fundraising
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Distribution overview
              </p>
            </div>
            <FaChartLine className="text-slate-400 text-lg" />
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => INR(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  User Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Important user information
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailCard label="Name" value={selectedUser?.name || "—"} />
              <DetailCard label="Email" value={selectedUser?.email || "—"} />
              <DetailCard label="Role" value={selectedUser?.role || "user"} />
              <DetailCard
                label="Status"
                value={
                  selectedUser?.status ||
                  (selectedUser?.isActive ? "active" : "inactive")
                }
              />
              <DetailCard
                label="Joined On"
                value={formatDate(selectedUser?.createdAt)}
              />
              <DetailCard
                label="KYC Status"
                value={selectedUser?.kycStatus || "—"}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, theme = "amber" }) {
  const themes = {
    amber: {
      wrap: "from-amber-50 via-yellow-50 to-white",
      icon: "from-amber-400 to-yellow-500",
    },
    sky: {
      wrap: "from-sky-50 via-blue-50 to-white",
      icon: "from-sky-400 to-blue-500",
    },
    emerald: {
      wrap: "from-emerald-50 via-green-50 to-white",
      icon: "from-emerald-400 to-green-500",
    },
    violet: {
      wrap: "from-violet-50 via-purple-50 to-white",
      icon: "from-violet-400 to-purple-500",
    },
  };

  return (
    <div
      className={cn(
        "rounded-[20px] border border-slate-200 bg-gradient-to-br p-3.5 shadow-sm",
        themes[theme]?.wrap
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-1.5 text-[11px] font-medium text-slate-500">
            {subtitle}
          </p>
        </div>
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-base text-white shadow-lg",
            themes[theme]?.icon
          )}
        >
          <Icon />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text, compact = false }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500",
        compact ? "p-4" : "p-6"
      )}
    >
      {text}
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}