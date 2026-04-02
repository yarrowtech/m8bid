import { useNavigate } from "react-router-dom";
import { switchMode } from "../api/user";

export default function SelectAccountMode() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSelect = async (mode) => {
    try {
      const res = await switchMode({ mode });
      localStorage.setItem("user", JSON.stringify(res.user));

      if (mode === "investor") {
        navigate(
          res.user?.access?.investor?.type === "company"
            ? "/investor/company/dashboard"
            : "/investor/individual/dashboard"
        );
      }

      if (mode === "fundraiser") {
        navigate(
          res.user?.access?.fundraiser?.type === "company"
            ? "/fundraiser/company/dashboard"
            : "/fundraiser/individual/dashboard"
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <h1 className="text-3xl font-bold text-slate-900 text-center">
          Choose how you want to continue
        </h1>
        <p className="text-center text-slate-600 mt-2">
          Select the account mode you want to use right now
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {user?.access?.investor?.enabled && (
            <button
              onClick={() => handleSelect("investor")}
              className="rounded-2xl border border-slate-300 p-6 text-left hover:border-slate-900 transition"
            >
              <h2 className="text-xl font-bold text-slate-900">Investor</h2>
              <p className="text-slate-600 mt-2 capitalize">
                {user?.access?.investor?.type} account
              </p>
            </button>
          )}

          {user?.access?.fundraiser?.enabled && (
            <button
              onClick={() => handleSelect("fundraiser")}
              className="rounded-2xl border border-slate-300 p-6 text-left hover:border-yellow-400 transition"
            >
              <h2 className="text-xl font-bold text-slate-900">Fundraiser</h2>
              <p className="text-slate-600 mt-2 capitalize">
                {user?.access?.fundraiser?.type} account
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}