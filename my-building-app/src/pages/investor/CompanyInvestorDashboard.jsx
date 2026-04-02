import { useNavigate } from "react-router-dom";

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
      {sub && <p className="mt-1 text-sm text-slate-600">{sub}</p>}
    </div>
  );
}

export default function CompanyInvestorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase">
            Company Investor Account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {user?.name || "Company Investor"}
          </h1>
          <p className="mt-2 text-slate-600">
            Review investment opportunities, manage company verification, and monitor allocation activity.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Active Allocations" value="8" sub="Current company investments" />
          <StatCard title="Total Deployed Capital" value="₹14,50,000" sub="Across selected opportunities" />
          <StatCard title="Company Verification" value="Pending" sub="Complete company documents" />
          <StatCard title="Linked Bank Accounts" value="2" sub="Verified corporate payout accounts" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Company Investment Summary</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <p className="font-semibold text-slate-900">Retail Infra Group</p>
                <p className="text-sm text-slate-600 mt-1">Committed: ₹5,00,000</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <p className="font-semibold text-slate-900">Tech Assets Fund</p>
                <p className="text-sm text-slate-600 mt-1">Committed: ₹3,50,000</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => navigate("/browse-investors")}
                className="w-full rounded-xl bg-slate-900 text-white py-3 font-semibold"
              >
                Explore Opportunities
              </button>
              <button
                onClick={() => navigate("/profile/verification")}
                className="w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-900"
              >
                Upload Company Documents
              </button>
              <button
                onClick={() => navigate("/profile/bank-account")}
                className="w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-900"
              >
                Manage Bank Accounts
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-900"
              >
                Company Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}