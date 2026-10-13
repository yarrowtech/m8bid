require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userSchema");

async function migrate() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const apply = process.argv.includes("--apply");
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  console.log(`Atomic payment transactions supported: ${Boolean(topology.setName || topology.msg === "isdbgrid")}`);
  if (apply) {
    const fs = require("fs");
    const path = require("path");
    const backupDir = path.join(__dirname, "../.migration-backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const accounts = await User.collection.find({}).toArray();
    fs.writeFileSync(path.join(backupDir, `users-${Date.now()}.json`), JSON.stringify(accounts), { mode: 0o600 });
  }
  let changed = 0;
  for await (const user of User.collection.find({})) {
    const changes = {
      role: user.role === "admin" ? "admin" : "user",
      "access.investor.enabled": true,
      "access.fundraiser.enabled": true,
    };
    // Preserve all historical fields, documents, IDs, and financial collections.
    for (const field of ["kycStatus", "panStatus", "bankStatus"]) {
      const a = user.access?.investor?.[field] || user.access?.contributor?.[field];
      const b = user.access?.fundraiser?.[field] || user.access?.raiser?.[field];
      const status = [a, b].includes("VERIFIED") ? "VERIFIED" : a || b || "NONE";
      changes[`access.investor.${field}`] = status;
      changes[`access.fundraiser.${field}`] = status;
      if (field === "kycStatus") changes.kycStatus = changes.fundraiserVerification = status;
    }
    for (const field of ["details", "documents"]) {
      const a = user.access?.investor?.[field] || user.access?.contributor?.[field] || {};
      const b = user.access?.fundraiser?.[field] || user.access?.raiser?.[field] || {};
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (!a[key] && b[key]) changes[`access.investor.${field}.${key}`] = b[key];
        if (!b[key] && a[key]) changes[`access.fundraiser.${field}.${key}`] = a[key];
      }
    }
    changed += 1;
    if (apply) {
      const contributions = await mongoose.connection.db.collection("investments").find({ investor: user._id, status: "confirmed", paymentStatus: "completed" }).toArray();
      const campaigns = await mongoose.connection.db.collection("fundraisers").find({ userId: user._id }).toArray();
      changes.contributorProfile = {
        totalContributed: contributions.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
        supportedCampaigns: new Set(contributions.map((entry) => String(entry.campaign))).size,
      };
      changes.fundraiserProfile = {
        totalRaised: campaigns.reduce((sum, entry) => sum + Number(entry.raisedAmount || 0), 0),
        activeCampaigns: campaigns.filter((entry) => entry.status === "approved" && (!entry.deadline || entry.deadline > new Date())).length,
      };
      await User.collection.updateOne({ _id: user._id }, { $set: changes });
      await require("../models/KYC").updateOne({ user: user._id }, { $set: { status: changes.kycStatus } }, { upsert: true });
    }
  }
  console.log(`${apply ? "Migrated" : "Would migrate"} ${changed} user accounts. Financial records remain intact.`);
}
migrate().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
