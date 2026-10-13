const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const Campaign = require("../models/Fundraiser");
const Contribution = require("../models/Contribution");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const gatewayPath = require.resolve("../services/razorpayService");
const cloudPath = require.resolve("../utils/cloudinary");
let payment = { status: "captured", order_id: "order_test", currency: "INR", amount: 10000 };
let signatureValid = true;
let refund = { id: "rfnd_test", payment_id: "pay_test", amount: 10000, currency: "INR", status: "pending" };
require.cache[gatewayPath] = { id: gatewayPath, filename: gatewayPath, loaded: true, exports: {
  createOrder: async () => ({ id: "order_test", amount: 10000, currency: "INR" }),
  verifyPaymentSignature: () => signatureValid,
  fetchPayment: async () => payment,
  fetchRefund: async () => refund,
  refundPayment: async () => refund,
  createTransferFromPayment: async () => { throw new Error("Tests must not issue payouts"); },
} };
require.cache[cloudPath] = { id: cloudPath, filename: cloudPath, loaded: true, exports: { uploadToCloudinary: async () => ({ secure_url: "https://example.test/document" }) } };
const auth = require("../controllers/auth");
const fundraiser = require("../controllers/fundraiser");
const controller = require("../controllers/investmentController");
const { protect, requireInvestor, requireFundraiser, requireVerifiedIdentity } = require("../middleware/authmiddleware");
const { normalizeUser } = require("../utils/unifiedUser");
const userId = "507f1f77bcf86cd799439011";
const campaignId = "507f1f77bcf86cd799439012";
const contributionId = "507f1f77bcf86cd799439013";
const user = { _id: userId, name: "Test User", email: "test@example.test", role: "user", kycStatus: "VERIFIED", password: "secret-hash", access: { investor: { enabled: false, kycStatus: "VERIFIED" }, fundraiser: { enabled: false, kycStatus: "VERIFIED" } }, matchPassword: async () => true, save: async () => {} };
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("public browsing includes campaigns from other owners for signed-in and anonymous visitors", async (t) => {
  const all = [{ _id: campaignId, userId, status: "approved" }, { _id: "507f1f77bcf86cd799439014", userId: "507f1f77bcf86cd799439099", status: "pending" }];
  t.mock.method(Campaign, "find", (filter) => {
    assert.deepEqual(filter, { status: { $in: ["pending", "approved", "completed"] } });
    return { populate: () => ({ sort: () => ({ lean: async () => all }) }) };
  });
  const { getAllCampaigns } = require("../controllers/campaign");
  for (const visitor of [undefined, user, { ...user, _id: "507f1f77bcf86cd799439099" }]) {
    const res = response();
    await getAllCampaigns({ user: visitor, query: { userId } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.data[1].userId, all[1].userId);
  }
});

test("raising dashboard stays owner-scoped and contribution history follows the contributor, not campaign ownership", async (t) => {
  t.mock.method(Campaign, "find", (filter) => {
    assert.deepEqual(filter, { userId });
    return { populate: () => ({ sort: () => ({ lean: async () => [{ _id: campaignId, userId }] }) }) };
  });
  const raised = response();
  await fundraiser.getFundraisersByUser({ user, params: { id: userId } }, raised);
  assert.equal(raised.statusCode, 200);
  const supported = { _id: contributionId, investor: userId, campaign: { _id: campaignId, userId: "507f1f77bcf86cd799439099" }, paymentStatus: "completed", status: "confirmed" };
  t.mock.method(Contribution, "find", (filter) => {
    assert.deepEqual(filter, { investor: userId });
    return { sort: () => ({ populate: async () => [supported] }) };
  });
  const contributed = response();
  await controller.getMyInvestments({ user }, contributed);
  assert.equal(contributed.statusCode, 200);
  assert.equal(contributed.body.contributions[0].campaign.userId, supported.campaign.userId);
});

test("refund reconciliation is admin-only and stale pending refunds cannot overwrite a processed refund", async (t) => {
  let role = "user";
  t.mock.method(User, "findById", () => ({ select: async () => ({ ...user, role }) }));
  t.mock.method(Contribution, "findById", async () => ({ _id: contributionId, investor: userId, campaign: campaignId, paymentId: "pay_test", amount: 100, refundId: "rfnd_test", refundStatus: "processed", paymentStatus: "refunded" }));
  t.mock.method(Transaction, "findOne", async () => ({ _id: "ledger_test", fundraiser: userId }));
  let updates = 0;
  t.mock.method(Contribution, "findOneAndUpdate", async (filter) => {
    assert.equal(filter.refundStatus.$ne, "processed");
    assert.equal(filter.paymentStatus.$ne, "refunded");
    return null;
  });
  t.mock.method(Transaction, "findOneAndUpdate", async () => { updates++; });
  const app = express(); app.use(express.json());
  app.use("/admin/contributions", require("../routes/contributionAdmin"));
  const server = app.listen(0); t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
  const url = `http://127.0.0.1:${server.address().port}/admin/contributions/${contributionId}/refund/reconcile`;
  const options = { method: "POST", headers: { Authorization: `Bearer ${token}` } };
  assert.equal((await fetch(url, options)).status, 403);
  role = "admin";
  assert.equal((await fetch(url, options)).status, 200);
  assert.equal(updates, 0);
  refund = { ...refund, amount: 1 };
  assert.equal((await fetch(url, options)).status, 502);
  refund = { ...refund, amount: 10000 };
});

test("registration creates one account for both activities without selecting a role", async (t) => {
  t.mock.method(User, "findOne", async () => null);
  let created;
  t.mock.method(User, "create", async (data) => { created = data; return data; });
  const res = response();
  await auth.registerUser({ body: { username: "one-user", name: "One User", email: "ONE@example.test", password: "safe-password" } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.access.investor.enabled, true);
  assert.equal(created.access.fundraiser.enabled, true);
  assert.equal(created.email, "one@example.test");
});

test("login and profile expose shared activities and never the password", async (t) => {
  t.mock.method(User, "findOne", async () => user);
  const res = response();
  await auth.loginUser({ body: { emailOrUsername: user.email, password: "safe-password" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.role, "user");
  assert.equal(res.body.user.access.contributor.enabled, true);
  assert.equal(res.body.user.access.raiser.enabled, true);
  assert.equal(res.body.user.password, undefined);
  assert.equal(jwt.verify(res.body.token, process.env.JWT_SECRET || "default_secret").id, userId);
  assert.equal(normalizeUser({ ...user, role: "admin" }).role, "admin");
});

test("one token can create a pending campaign and initiate a contribution; ownership stays enforced", async (t) => {
  t.mock.method(User, "findById", () => ({ select: async () => ({ ...user, access: { investor: { enabled: false }, fundraiser: { enabled: false } } }) }));
  let createdCampaign;
  let createdContribution;
  t.mock.method(Campaign, "create", async (data) => { createdCampaign = data; return { ...data, _id: campaignId }; });
  t.mock.method(Campaign, "findById", () => ({ populate: async () => ({ _id: campaignId, projectTitle: "Approved project", userId: { _id: "507f1f77bcf86cd799439099" }, status: "approved", moneyToRaise: 1000, raisedAmount: 0 }) }));
  t.mock.method(Contribution, "create", async (data) => { createdContribution = data; return { ...data, _id: contributionId, save: async () => {} }; });
  t.mock.method(Transaction, "create", async (data) => ({ ...data, save: async () => {} }));
  const app = express(); app.use(express.json());
  app.post("/raise/:id", protect, requireFundraiser, (req, res, next) => {
    req.files = ["projectProposal", "estimateSheet", "approvalLetter", "photo"].map((fieldname) => ({ fieldname, originalname: `${fieldname}.pdf` })); next();
  }, fundraiser.createFundRaiser);
  app.post("/contribute", protect, requireInvestor, requireVerifiedIdentity, controller.createInvestment);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => server.close());
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const base = `http://127.0.0.1:${server.address().port}`;
  const payload = { projectTitle: "Shared account project", projectOverview: "A detailed overview", campaignType: "project", campaignSubcategory: "custom", projectCategory: "General", entityName: "Test User", useOfFunds: "Equipment", moneyToRaise: 1000, daysToRaise: 30, introduction: "Funding campaign story", fundingType: "Profit Return", profitPercentage: 99 };
  const raised = await fetch(`${base}/raise/${userId}`, { method: "POST", headers, body: JSON.stringify(payload) });
  assert.equal(raised.status, 201);
  assert.equal(createdCampaign.userId, userId);
  assert.equal(createdCampaign.status, "pending");
  assert.equal(createdCampaign.fundingType, "Contribution");
  assert.equal(createdCampaign.profitPercentage, undefined);
  const contributed = await fetch(`${base}/contribute`, { method: "POST", headers, body: JSON.stringify({ campaignId, amount: 100 }) });
  assert.equal(contributed.status, 201);
  assert.equal(createdContribution.investor, userId);
  assert.equal(createdContribution.paymentStatus, "created");
  assert.equal((await contributed.json()).contributionId, contributionId);
  const wrongOwner = await fetch(`${base}/raise/507f1f77bcf86cd799439099`, { method: "POST", headers, body: JSON.stringify(payload) });
  assert.equal(wrongOwner.status, 403);
});

test("verification is required by identity, without an exclusive role", () => {
  const res = response();
  requireVerifiedIdentity({ user: { ...user, kycStatus: "PENDING" } }, res, () => assert.fail("Unverified identity continued"));
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, "VERIFICATION_REQUIRED");
});

test("payment confirmation validates signature, gateway amount, currency, and ownership", async (t) => {
  const inv = { _id: contributionId, investor: userId, orderId: "order_test", amount: 100, status: "pending", paymentStatus: "created" };
  t.mock.method(Contribution, "findById", async () => inv);
  const req = { user, params: { id: contributionId }, body: { razorpay_payment_id: "pay_test", razorpay_order_id: "order_test", razorpay_signature: "signature" } };
  let res = response(); signatureValid = false;
  await controller.confirmInvestment(req, res); assert.equal(res.statusCode, 400);
  signatureValid = true;
  for (const invalid of [{ amount: 1 }, { currency: "USD" }, { order_id: "different" }, { status: "authorized" }]) {
    payment = { status: "captured", order_id: "order_test", currency: "INR", amount: 10000, ...invalid };
    res = response(); await controller.confirmInvestment(req, res); assert.equal(res.statusCode, 400);
  }
  res = response(); await controller.confirmInvestment({ ...req, user: { _id: "someone-else" } }, res); assert.equal(res.statusCode, 403);
  payment = { status: "captured", order_id: "order_test", currency: "INR", amount: 10000 };
});

test("concurrent confirmation counts funding once and repeats return the confirmed contribution", async (t) => {
  const inv = { _id: contributionId, investor: userId, campaign: campaignId, orderId: "order_test", amount: 100, status: "pending", paymentStatus: "created", save: async () => {} };
  t.mock.method(Contribution, "findById", () => { const query = Promise.resolve(inv); query.session = async () => inv; return query; });
  t.mock.method(Contribution, "findOne", () => ({ session: async () => null }));
  t.mock.method(Contribution, "distinct", () => ({ session: async () => [campaignId] }));
  let total = 0;
  t.mock.method(Campaign, "findByIdAndUpdate", async (_id, update) => { total += update.$inc.raisedAmount; return { _id: campaignId, userId, projectTitle: "Project", raisedAmount: total, moneyToRaise: 1000 }; });
  t.mock.method(User, "findByIdAndUpdate", async () => {});
  t.mock.method(User, "findById", async () => user);
  t.mock.method(Transaction, "findOneAndUpdate", async () => ({}));
  t.mock.method(Transaction, "findOne", async () => null);
  let notifications = 0;
  t.mock.method(Notification, "create", async (items) => { notifications += items.length; });
  let lock = Promise.resolve();
  t.mock.method(mongoose, "startSession", async () => ({ withTransaction: async (run) => { const prior = lock; let release; lock = new Promise((resolve) => { release = resolve; }); await prior; try { await run(); } finally { release(); } }, endSession: async () => {} }));
  const req = { user, params: { id: contributionId }, body: { razorpay_payment_id: "pay_test", razorpay_order_id: "order_test", razorpay_signature: "signature" } };
  const a = response(), b = response();
  await Promise.all([controller.confirmInvestment(req, a), controller.confirmInvestment(req, b)]);
  assert.equal(a.statusCode, 200); assert.equal(b.statusCode, 200);
  assert.equal(total, 100); assert.equal(notifications, 2);
  const repeated = response(); await controller.confirmInvestment(req, repeated);
  assert.equal(repeated.body.contribution.paymentStatus, "completed");
  assert.equal(total, 100);
});
