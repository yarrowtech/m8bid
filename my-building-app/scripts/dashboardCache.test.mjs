import { test } from "node:test";
import assert from "node:assert/strict";
import { readDashboardCache, cacheDashboardResponse } from "../src/lib/dashboardCache.js";

test("dashboard cache keeps visits instant and never exposes data from a previous login", () => {
  globalThis.window = { __BUILDING_AUTH_TOKEN: "session-a" };
  globalThis.localStorage = globalThis.sessionStorage = { getItem: () => "" };
  const response = { config: { method: "get", url: "/account/overview", headers: { Authorization: "Bearer session-a" } }, data: { data: { totalRaised: 100 } } };
  cacheDashboardResponse(response);
  assert.equal(readDashboardCache("/account/overview").data.totalRaised, 100);
  window.__BUILDING_AUTH_TOKEN = "session-b";
  assert.equal(readDashboardCache("/account/overview"), undefined);
  cacheDashboardResponse(response);
  assert.equal(readDashboardCache("/account/overview"), undefined);
});

test("successful changes invalidate cached funding totals", () => {
  window.__BUILDING_AUTH_TOKEN = "session-b";
  const headers = { Authorization: "Bearer session-b" };
  cacheDashboardResponse({ config: { method: "get", url: "/contributions/my", headers }, data: { contributions: [] } });
  assert.ok(readDashboardCache("/contributions/my"));
  cacheDashboardResponse({ config: { method: "post", url: "/contributions/example/confirm", headers }, data: { success: true } });
  assert.equal(readDashboardCache("/contributions/my"), undefined);
});
