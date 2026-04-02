import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/user";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountMode: "investor",
    profileType: "individual",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        accountMode: formData.accountMode,
        profileType: formData.profileType,
      };

      const res = await registerUser(payload);

      setSuccess(res?.message || "Registration successful. Please login to continue.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-sky-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl bg-white border border-slate-200">
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white">
          <div>
            <p className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Building Platform
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Create your account.
              <span className="block text-yellow-300">Start securely.</span>
            </h1>
            <p className="mt-5 text-slate-300 leading-7">
              Register once and continue through the correct login flow for your account type.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-2 text-slate-600">Register to get started</p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Register as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, accountMode: "investor" }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      formData.accountMode === "investor"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    Investor
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, accountMode: "fundraiser" }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      formData.accountMode === "fundraiser"
                        ? "border-yellow-400 bg-yellow-300 text-slate-900"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    Fundraiser
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profileType: "individual" }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      formData.profileType === "individual"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profileType: "company" }))
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      formData.profileType === "company"
                        ? "border-yellow-400 bg-yellow-300 text-slate-900"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    Company
                  </button>
                </div>
              </div>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}