const mongoose = require("mongoose");

// One visitor session from the first-party tracker. Rolled up into
// WebsiteAnalyticsDaily.traffic once its day (Asia/Kolkata) is complete.
const pageView = new mongoose.Schema({
  path: { type: String, required: true, maxlength: 300 },
  title: { type: String, maxlength: 200 },
  views: { type: Number, min: 0, default: 0 },
  seconds: { type: Number, min: 0, default: 0 },
}, { _id: false });

const schema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, match: /^[A-Za-z0-9-]{8,64}$/ },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  device: { type: String, required: true, enum: ["Mobile", "Desktop", "Tablet"] },
  source: { type: String, required: true, maxlength: 60 },
  entryPage: { type: String, required: true, maxlength: 300 },
  exitPage: { type: String, required: true, maxlength: 300 },
  views: { type: Number, min: 0, default: 0 },
  engagementSeconds: { type: Number, min: 0, default: 0 },
  pages: [pageView],
  lastSeenAt: { type: Date, required: true },
  rolledUp: { type: Boolean, default: false },
}, { timestamps: true });

schema.index({ rolledUp: 1, date: 1 });
schema.index({ date: 1 });
module.exports = mongoose.model("WebsiteVisitSession", schema);
