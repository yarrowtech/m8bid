function summarizeFunding({ users, campaigns, contributions, range = "30d", now = new Date() }) {
  const days = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 }[range];
  if (!days) throw new Error("Invalid range");
  const start = new Date(now.getTime() - days * 86400000);
  const regular = users.filter((user) => user.role !== "admin");
  const confirmed = contributions.filter((entry) => entry.paymentStatus === "completed" && entry.status === "confirmed");
  const sum = (list, field) => list.reduce((total, entry) => total + Number(entry[field] || 0), 0);
  const inPeriod = (date) => date && new Date(date) >= start && new Date(date) <= now;
  const period = confirmed.filter((entry) => inPeriod(entry.date));
  const monthly = new Map();
  const userMonths = new Map();
  regular.filter((user) => inPeriod(user.createdAt)).forEach((user) => {
    const month = new Date(user.createdAt).toISOString().slice(0, 7);
    userMonths.set(month, (userMonths.get(month) || 0) + 1);
  });
  period.forEach((entry) => {
    const month = new Date(entry.date).toISOString().slice(0, 7);
    monthly.set(month, (monthly.get(month) || 0) + Number(entry.amount));
  });
  const creatorIds = new Set(campaigns.map((entry) => String(entry.userId?._id || entry.userId)));
  const supporterIds = new Set(confirmed.map((entry) => String(entry.investor)));
  const active = campaigns.filter((entry) => entry.status === "approved" && (!entry.deadline || new Date(entry.deadline) > now));
  const stats = {
    totalUsers: regular.length, adminUsers: users.length - regular.length,
    activeUsers: regular.filter((user) => user.accountStatus !== "disabled").length,
    disabledUsers: regular.filter((user) => user.accountStatus === "disabled").length,
    raisers: regular.filter((user) => creatorIds.has(String(user._id))).length,
    contributors: regular.filter((user) => supporterIds.has(String(user._id))).length,
    bothActivities: regular.filter((user) => creatorIds.has(String(user._id)) && supporterIds.has(String(user._id))).length,
    pendingVerification: regular.filter((user) => user.kycStatus === "PENDING" || user.access?.investor?.kycStatus === "PENDING").length,
    totalCampaigns: campaigns.length, totalFundraisers: campaigns.length,
    approvedCampaigns: campaigns.filter((entry) => entry.status === "approved").length,
    pendingCampaigns: campaigns.filter((entry) => entry.status === "pending").length,
    completedCampaigns: campaigns.filter((entry) => entry.status === "completed").length,
    rejectedCampaigns: campaigns.filter((entry) => entry.status === "rejected").length,
    activeCampaigns: active.length, totalFundingGoal: sum(campaigns, "moneyToRaise"),
    totalMoneyRaised: sum(campaigns, "raisedAmount"), totalContributions: confirmed.length,
    platformFees: sum(confirmed, "platformFee"), totalRevenue: sum(confirmed, "platformFee"),
    payoutsPaid: sum(confirmed.filter((entry) => entry.transferStatus === "processed"), "netAmount"),
    payoutsPending: sum(confirmed.filter((entry) => entry.transferStatus !== "processed"), "netAmount"),
    refundedAmount: sum(contributions.filter((entry) => entry.paymentStatus === "refunded"), "amount"),
    period: { range, start, end: now, contributions: period.length, amount: sum(period, "amount"), fees: sum(period, "platformFee") },
    monthlyRaised: [...monthly].sort(([a], [b]) => a.localeCompare(b)).map(([month, raised]) => ({ month, raised })),
    monthlyUsers: [...userMonths].sort(([a], [b]) => a.localeCompare(b)).map(([month, users]) => ({ month, users })),
    recentFundraisers: campaigns.slice(0, 5).map((entry) => ({ _id: entry._id, projectTitle: entry.projectTitle, status: entry.status, raisedAmount: entry.raisedAmount, createdAt: entry.createdAt, creator: { name: entry.userId?.name || "Unknown", _id: entry.userId?._id } })),
    recentUsers: regular.slice(0, 5).map((user) => ({ _id: user._id, name: user.name, email: user.email, role: "user", accountStatus: user.accountStatus || "active", kycStatus: user.kycStatus || user.access?.investor?.kycStatus || "NONE", createdAt: user.createdAt })),
  };
  return stats;
}
module.exports = { summarizeFunding };
