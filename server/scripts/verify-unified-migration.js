require("dotenv").config({ path: require("path").join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
async function verify() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  const invalid = users.filter((user) => !["user", "admin"].includes(user.role) || !user.access?.investor?.enabled || !user.access?.fundraiser?.enabled);
  const fs = require("fs");
  const path = require("path");
  const folder = path.join(__dirname, "../.migration-backups");
  const latest = fs.readdirSync(folder).filter((file) => file.endsWith(".json")).sort().at(-1);
  const previous = JSON.parse(fs.readFileSync(path.join(folder, latest), "utf8"));
  const preserved = previous.every((user) => users.some((current) => String(current._id) === user._id && current.password === user.password));
  const duplicatePayments = await db.collection("investments").aggregate([
    { $match: { paymentId: { $type: "string", $gt: "" } } },
    { $group: { _id: "$paymentId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }, { $count: "count" },
  ]).toArray();
  console.log(JSON.stringify({ accounts: users.length, invalidAccounts: invalid.length, accountIdsAndPasswordHashesPreserved: preserved, contributions: await db.collection("investments").countDocuments(), transactions: await db.collection("transactions").countDocuments(), duplicatePayments: duplicatePayments[0]?.count || 0 }));
  if (invalid.length || !preserved || duplicatePayments.length) process.exitCode = 1;
}
verify().catch(() => { console.error("Migration verification could not complete"); process.exitCode = 1; }).finally(() => mongoose.disconnect());
