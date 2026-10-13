import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { loginUser } from "../api/user";

export default function LoginPage({ adminOnly = false, setLoggedInUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (adminOnly && res.user?.role !== "admin") {
      setError("Please sign in with an administrator account.");
      return;
    }

    Cookies.set("token", res.token, { expires: 7 });
    localStorage.setItem("token", res.token);
    sessionStorage.setItem("token", res.token);
    if (typeof window !== "undefined") {
      window.__BUILDING_AUTH_TOKEN = res.token;
    }
    localStorage.setItem("user", JSON.stringify(res.user));
    sessionStorage.setItem("user", JSON.stringify(res.user));
    setLoggedInUser?.(res.user);

    if (res.user?.role === "admin") {
      const destination = location.state?.from;
      navigate(
        destination?.startsWith("/admin/") && destination !== "/admin/login"
          ? destination
          : "/admin/dashboard",
        { replace: true }
      );
      return;
    }

    navigate("/dashboard", { replace: true });
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
            <h2 className="text-3xl font-bold text-slate-900">{adminOnly ? "Admin Login" : "Login"}</h2>
            <p className="mt-2 text-slate-600">{adminOnly ? "Sign in to the Building admin panel" : "Access your account"}</p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {!adminOnly && <p className="text-sm text-slate-600">One account to Raise Funds and Contribute Funds. <button type="button" onClick={() => navigate("/admin/login")} className="font-semibold hover:underline">Administrator sign in</button></p>}
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

              {!adminOnly && <div className="flex justify-between text-sm">
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
              </div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
