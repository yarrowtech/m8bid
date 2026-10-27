const { test } = require("node:test");
const assert = require("node:assert/strict");
const { summarizeFunding } = require("../services/adminFundingSummary");
test("admin counts one account with both activities and separates contributions, fees, payouts and refunds", () => {
  const stats = summarizeFunding({ now: new Date("2026-10-14T12:00:00Z"), range: "7d",
    users: [{ _id: "u1", role: "user", kycStatus: "PENDING" }, { _id: "u2", role: "user", accountStatus: "disabled" }, { _id: "a1", role: "admin" }],
    campaigns: [{ _id: "c1", userId: "u1", status: "approved", deadline: "2026-10-12", raisedAmount: 100, moneyToRaise: 1000 }],
    contributions: [{ investor: "u1", amount: 100, platformFee: 5, netAmount: 95, date: "2026-10-13", status: "confirmed", paymentStatus: "completed", transferStatus: "processed" }, { investor: "u2", amount: 200, date: "2026-10-13", status: "pending", paymentStatus: "created" }, { investor: "u2", amount: 50, platformFee: 2, date: "2026-10-13", status: "refunded", paymentStatus: "refunded" }],
  });
  assert.equal(stats.totalUsers, 2); assert.equal(stats.adminUsers, 1);
  assert.equal(stats.activeUsers, 1); assert.equal(stats.bothActivities, 1);
  assert.equal(stats.pendingVerification, 1); assert.equal(stats.activeCampaigns, 0);
  assert.equal(stats.totalContributions, 1); assert.equal(stats.platformFees, 5);
  assert.equal(stats.payoutsPaid, 95); assert.equal(stats.refundedAmount, 50);
  assert.equal(stats.period.amount, 100); assert.deepEqual(stats.monthlyRaised, [{ month: "2026-10", raised: 100 }]);
});
test("reporting ranges filter contribution dates rather than campaign creation dates", () => {
  const stats = summarizeFunding({ now: new Date("2026-10-14T12:00:00Z"), range: "24h", users: [], campaigns: [], contributions: [{ investor: "u1", amount: 100, date: "2026-10-10", paymentStatus: "completed", status: "confirmed" }] });
  assert.equal(stats.totalContributions, 1); assert.equal(stats.period.contributions, 0);
  assert.deepEqual(stats.monthlyRaised, []);
  assert.throws(() => summarizeFunding({ users: [], campaigns: [], contributions: [], range: "bad" }));
});
