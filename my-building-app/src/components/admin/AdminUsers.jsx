import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaBars, FaSearch, FaEye, FaUserCircle } from "react-icons/fa";
import { getAdminUsers } from "../../api/admin";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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

const getStatusTone = (status = "", isActive) => {
  const s = String(status || (isActive ? "active" : "inactive")).toLowerCase();

  if (["approved", "active", "completed", "success", "verified"].includes(s)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["pending", "review", "processing", "under_review", "under review"].includes(s)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (["rejected", "failed", "inactive", "blocked", "deleted"].includes(s)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const getProfileBadgeTone = (label = "") => {
  const v = String(label).toLowerCase();

  if (v.includes("investor")) {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }
  if (v.includes("fundraiser")) {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const getVerificationTone = (value = "") => {
  const v = String(value).toLowerCase();

  if (["verified", "approved", "active"].includes(v)) {
    return "text-emerald-700";
  }
  if (["pending", "processing", "review", "under_review", "under review"].includes(v)) {
    return "text-amber-700";
  }
  if (["rejected", "failed", "inactive", "blocked"].includes(v)) {
    return "text-rose-700";
  }
  return "text-slate-500";
};

const normalizeStatus = (value, fallbackActive) => {
  if (value) return String(value);
  return fallbackActive ? "active" : "inactive";
};

const normalizeMode = (value) => {
  const mode = String(value || "none").toLowerCase();
  if (["investor", "fundraiser", "none"].includes(mode)) return mode;
  return "none";
};

const getProfilesFromUser = (user) => {
  const profiles = [];
  const access = user?.access || {};

  const investorEnabled =
    access?.investor?.enabled ||
    user?.investorProfile?.enabled ||
    String(user?.role || "").toLowerCase() === "investor";

  const fundraiserEnabled =
    access?.fundraiser?.enabled ||
    user?.fundraiserProfile?.enabled ||
    String(user?.role || "").toLowerCase() === "fundraiser";

  const investorType =
    access?.investor?.type ||
    user?.investorProfile?.type ||
    "individual";

  const fundraiserType =
    access?.fundraiser?.type ||
    user?.fundraiserProfile?.type ||
    "individual";

  if (investorEnabled) {
    profiles.push(
      investorType === "company" ? "Investor Company" : "Investor Individual"
    );
  }

  if (fundraiserEnabled) {
    profiles.push(
      fundraiserType === "company"
        ? "Fundraiser Company"
        : "Fundraiser Individual"
    );
  }

  return profiles;
};

const getVerificationSummary = (user) => {
  const access = user?.access || {};

  const items = [];

  const investorEnabled =
    access?.investor?.enabled ||
    user?.investorProfile?.enabled ||
    String(user?.role || "").toLowerCase() === "investor";

  const fundraiserEnabled =
    access?.fundraiser?.enabled ||
    user?.fundraiserProfile?.enabled ||
    String(user?.role || "").toLowerCase() === "fundraiser";

  if (investorEnabled) {
    items.push({
      label: "Investor KYC",
      value:
        access?.investor?.kycStatus ||
        user?.investorProfile?.kycStatus ||
        user?.kycStatus ||
        "NONE",
    });
  }

  if (fundraiserEnabled) {
    items.push({
      label: "Fundraiser KYC",
      value:
        access?.fundraiser?.kycStatus ||
        user?.fundraiserProfile?.kycStatus ||
        user?.kycStatus ||
        "NONE",
    });

    if (
      (access?.fundraiser?.type || user?.fundraiserProfile?.type) === "company"
    ) {
      items.push({
        label: "Company Docs",
        value:
          access?.fundraiser?.companyStatus ||
          user?.fundraiserProfile?.companyStatus ||
          "NONE",
      });
    }
  }

  return items;
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await getAdminUsers();
        const list = res?.users || res?.data?.users || res?.data || [];

        const filteredAdminsRemoved = Array.isArray(list)
          ? list.filter((u) => {
              const role = String(u?.role || "").toLowerCase();
              return role !== "admin" && role !== "superadmin";
            })
          : [];

        setUsers(filteredAdminsRemoved);
      } catch (e) {
        console.error(e);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return users.filter((u) => {
      const profiles = getProfilesFromUser(u);
      const verifications = getVerificationSummary(u);
      const mode = normalizeMode(u?.activeMode);

      const matchesSearch =
        !q ||
        [
          u?.name,
          u?.email,
          u?._id,
          u?.role,
          mode,
          ...profiles,
          ...verifications.map((v) => `${v.label} ${v.value}`),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      let matchesProfile = true;

      if (profileFilter === "investor") {
        matchesProfile = profiles.some((p) => p.toLowerCase().includes("investor"));
      } else if (profileFilter === "fundraiser") {
        matchesProfile = profiles.some((p) => p.toLowerCase().includes("fundraiser"));
      } else if (profileFilter === "both") {
        matchesProfile =
          profiles.some((p) => p.toLowerCase().includes("investor")) &&
          profiles.some((p) => p.toLowerCase().includes("fundraiser"));
      } else if (profileFilter === "company") {
        matchesProfile = profiles.some((p) => p.toLowerCase().includes("company"));
      } else if (profileFilter === "individual") {
        matchesProfile = profiles.some((p) =>
          p.toLowerCase().includes("individual")
        );
      }

      let matchesVerification = true;

      if (verificationFilter !== "all") {
        matchesVerification = verifications.some(
          (v) => String(v.value).toLowerCase() === verificationFilter
        );
      }

      return matchesSearch && matchesProfile && matchesVerification;
    });
  }, [users, search, profileFilter, verificationFilter]);

  return (
    <>
<div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex items-center gap-4">
      <button
        onClick={() => setSidebarOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
      >
        <FaBars />
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage user accounts by profiles, verification states and active mode
        </p>
      </div>
    </div>

    <div className="w-full xl:flex xl:justify-end">
      <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-12 xl:w-full xl:max-w-[920px]">
        <div className="relative min-w-0 lg:col-span-6">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="min-w-0 lg:col-span-3">
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="all">All Profiles</option>
            <option value="investor">Investor</option>
            <option value="fundraiser">Fundraiser</option>
            <option value="both">Both</option>
            <option value="company">Company</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        <div className="min-w-0 lg:col-span-3">
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</div>



      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="max-h-[620px] overflow-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Account Type</th>
                  <th className="px-4 py-3 font-semibold">Active Profiles</th>
                  <th className="px-4 py-3 font-semibold">Verification Summary</th>
                  <th className="px-4 py-3 font-semibold">Current Mode</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((user, i) => {
                    const profiles = getProfilesFromUser(user);
                    const verification = getVerificationSummary(user);
                    const mode = normalizeMode(user?.activeMode);
                    const accountStatus = normalizeStatus(user?.status, user?.isActive);

                    return (
                      <tr key={user?._id || i} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                              <FaUserCircle className="text-xl" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {user?.name || "—"}
                              </p>
                              <p className="truncate text-sm text-slate-500">
                                {user?.email || "—"}
                              </p>
                              <p className="mt-1 text-xs text-slate-400 break-all">
                                ID: {user?._id || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                              {user?.role || "user"}
                            </span>
                            <div>
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                  getStatusTone(accountStatus, user?.isActive)
                                )}
                              >
                                {accountStatus}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {profiles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profiles.map((profile) => (
                                <span
                                  key={profile}
                                  className={cn(
                                    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                    getProfileBadgeTone(profile)
                                  )}
                                >
                                  {profile}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No profile enabled</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {verification.length > 0 ? (
                            <div className="space-y-1.5">
                              {verification.map((item, idx) => (
                                <p key={`${item.label}-${idx}`} className="text-xs">
                                  <span className="font-semibold text-slate-700">
                                    {item.label}:
                                  </span>{" "}
                                  <span className={cn("font-medium uppercase", getVerificationTone(item.value))}>
                                    {String(item.value || "NONE").replaceAll("_", " ")}
                                  </span>
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-700">
                            {mode}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {formatDate(user?.createdAt)}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => navigate(`/admin/users/${user?._id}`)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            <FaEye />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}