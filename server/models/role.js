/*()
const mongoose = require("mongoose");
const roles = ["admin", "investor", "fundRaiser"];

const roleSchema = new mongoose.Schema({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  roleName: { type: String, enum: roles, required: true },
  permissions: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
});

const RoleModel = new mongoose.Schema({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  roleName: { type: [String], required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Role", RoleModel);
*/