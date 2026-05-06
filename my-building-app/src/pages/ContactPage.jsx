import React, { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { sendContactEnquiry } from "../api/contact";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await sendContactEnquiry(form);
      setStatus({
        type: "success",
        message: res?.message || "Your enquiry has been sent successfully.",
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message ||
          "Unable to send enquiry right now. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
              Contact M8-BID
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Send us your enquiry
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Have a question about fundraising, investing, campaign setup, or
              support? Fill this form and your details will be sent to the
              platform email account.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Mail className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <h2 className="font-semibold text-slate-900">Email</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    support@M8-BID.com
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Phone className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <h2 className="font-semibold text-slate-900">Phone</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    +91 98765 43210
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <MapPin className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <h2 className="font-semibold text-slate-900">Operations</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Digital-first campaign and platform support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Enquiry Form
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Guest users can submit questions directly to our team.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Full Name
                </span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Phone
                </span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional phone number"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Subject
                </span>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="What is this about?"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">
                Message
              </span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Write your enquiry details..."
              />
            </label>

            {status.message ? (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {status.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Sending Enquiry..." : "Send Enquiry"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
