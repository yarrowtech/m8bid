const mongoose = require("mongoose");

const count = { type: Number, min: 0, required: true };
const searchMetrics = new mongoose.Schema({
  clicks: count, impressions: count,
  position: { type: Number, min: 0, default: null },
}, { _id: false });
const trafficMetrics = new mongoose.Schema({
  entries: count, exits: count, views: count, engaged: count,
  engagementSeconds: count, // Total engagement seconds, not an average.
}, { _id: false });
const namedSearch = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 2048 },
  title: { type: String, maxlength: 200 },
  metrics: { type: searchMetrics, required: true },
}, { _id: false });
const namedTraffic = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 2048 },
  title: { type: String, maxlength: 200 },
  metrics: { type: trafficMetrics, required: true },
}, { _id: false });
const schema = new mongoose.Schema({
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  device: { type: String, required: true, enum: ["Mobile", "Desktop", "Tablet"] },
  search: {
    type: new mongoose.Schema({
      provider: { type: String, required: true, maxlength: 100 },
      totals: { type: searchMetrics, required: true },
      pages: [namedSearch], queries: [namedSearch],
    }, { _id: false }), default: null,
  },
  traffic: {
    type: new mongoose.Schema({
      provider: { type: String, required: true, maxlength: 100 },
      totals: { type: trafficMetrics, required: true },
      pages: [namedTraffic], sources: [namedTraffic],
    }, { _id: false }), default: null,
  },
}, { timestamps: true });
schema.index({ date: 1, device: 1 }, { unique: true });
module.exports = mongoose.model("WebsiteAnalyticsDaily", schema);
