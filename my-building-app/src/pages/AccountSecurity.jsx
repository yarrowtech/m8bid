import { useState } from "react";
import api from "../lib/axiox";

export default function AccountSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await api.patch("/account/security/password", { currentPassword, newPassword });
      setMessage(response.data.message); setCurrentPassword(""); setNewPassword("");
    } catch (error) { setMessage(error.response?.data?.message || "Unable to change password"); }
    finally { setSaving(false); }
  };
  return <div className="min-h-full bg-[#f5f8fc]"><main className="mx-auto max-w-3xl px-4 py-5 md:px-5"><h1 className="text-2xl font-semibold">Account Security</h1><form onSubmit={submit} className="mt-6 space-y-4 rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm"><label className="block">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label><label className="block">New password<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label><button disabled={saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Change password"}</button>{message && <p role="status">{message}</p>}</form></main></div>;
}
