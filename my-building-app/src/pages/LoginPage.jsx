import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { loginUser } from "../api/user";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getDashboardPath = (user, mode) => {
    if (mode === "investor") {
      return user?.access?.investor?.type === "company"
        ? "/investor/company/dashboard"
        : "/investor/dashboard";
    }

    if (mode === "fundraiser") {
      return user?.access?.fundraiser?.type === "company"
        ? "/fundraiser/company/dashboard"
        : "/fundraiser/dashboard";
    }

    return "/";
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!formData.emailOrUsername.trim() || !formData.password.trim()) {
    setError("Please fill in all required fields.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const payload = {
      emailOrUsername: formData.emailOrUsername.trim(),
      password: formData.password,
    };

    const res = await loginUser(payload);

    Cookies.set("token", res.token, { expires: 7 });
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    const hasInvestor = res.user?.access?.investor?.enabled;
    const hasFundraiser = res.user?.access?.fundraiser?.enabled;

    if (res.user?.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (hasInvestor && hasFundraiser) {
      navigate("/select-account-mode");
      return;
    }

    if (hasInvestor) {
      navigate(getDashboardPath(res.user, "investor"));
      return;
    }

    if (hasFundraiser) {
      navigate(getDashboardPath(res.user, "fundraiser"));
      return;
    }

    navigate("/");
  } catch (err) {
    setError(err?.message || err?.error || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-yellow-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl bg-white border border-slate-200">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-10 text-white">
          <div>
            <p className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Building Platform
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Welcome back.
              <span className="block text-yellow-300">Continue securely.</span>
            </h1>
            <p className="mt-5 text-slate-300 text-base leading-7">
              Log in to access your account, documents, profile, and platform activity.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Login</h2>
            <p className="mt-2 text-slate-600">Access your account</p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  placeholder="Enter email or username"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-yellow-300 py-3.5 font-bold text-slate-900 hover:bg-yellow-400 transition disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Create account
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}