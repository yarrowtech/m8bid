require("dotenv").config({ path: require("path").join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
const controller = require("../controllers/adminController/AdminDashboard");
async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const results = {};
  for (const [page, handler, field] of [["users", controller.getAdminUsers, "users"], ["campaigns", controller.getAdminCampaigns, "campaigns"], ["transactions", controller.getAdminTransactions, "transactions"], ["analytics", controller.getAdminAnalytics, "stats"]]) {
    let body, status = 200;
    await handler({ query: { range: "30d" } }, { status(code) { status = code; return this; }, json(data) { body = data; } });
    if (status !== 200 || !body?.success) throw new Error(`${page} did not return real data`);
    results[page] = Array.isArray(body[field]) ? body[field].length : { users: body.stats.totalUsers, campaigns: body.stats.totalCampaigns, confirmedContributions: body.stats.totalContributions };
  }
  results.contributionRecords = await require("../models/Contribution").countDocuments();
  const account = await require("../models/userSchema").findOne({ role: { $ne: "admin" } }).select("_id");
  if (account) {
    let details;
    await controller.getAdminUserDetails({ params: { userId: String(account._id) } }, { status() { return this; }, json(body) { details = body; } });
    if (!details?.success || !details.user.accountStatus || !Array.isArray(details.user.savedCampaigns)) throw new Error("Unified user details are incomplete");
    for (const campaign of details.user.campaigns) {
      if (typeof campaign.introduction !== "string" || !Array.isArray(campaign.uploadedDocuments) || !Array.isArray(campaign.projectPhotos) || !Array.isArray(campaign.updates) || !campaign.projectLocation) throw new Error("Campaign detail fields are incomplete");
    }
    results.userDetails = { verified: true, campaigns: details.user.campaigns.length, contributions: details.user.contributions.length, transactions: details.user.transactions.length };
  }
  console.log(JSON.stringify(results));
}
run().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
