import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaBars, FaSearch } from "react-icons/fa";
import { getAdminTransactions } from "../../api/admin";

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

export default function AdminTransactions() {
  const { setSidebarOpen } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAdminTransactions();
        setTransactions(res?.transactions || res?.data?.transactions || []);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, []);

  const filtered = transactions.filter((t) =>
    [t?.transactionId, t?.status, t?.type, t?.user?.name, t?.user?.email]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
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
              Transactions
            </h1>
            <p className="mt-1 text-sm text-slate-500">Track payment activity</p>
          </div>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Transaction</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length > 0 ? (
                filtered.map((t, i) => (
                  <tr key={t?._id || i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {t?.transactionId || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t?.user?.name || t?.user?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">
                      {INR(t?.amount || 0)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t?.status || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(t?.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                    No transactions found.
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