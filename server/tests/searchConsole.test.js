const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pageRows, query, syncSearchConsole } = require("../services/searchConsole");

test("page normalization removes query parameters and weights positions", () => {
  const rows = pageRows([
    { keys: ["https://www.matebid.com/about?campaign=a"], clicks: 2, impressions: 10, position: 4 },
    { keys: ["https://www.matebid.com/about?campaign=b"], clicks: 4, impressions: 30, position: 8 },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "/about");
  assert.deepEqual(rows[0].metrics, { clicks: 6, impressions: 40, position: 7 });
});

test("query sends the encoded property and bearer token", async () => {
  const rows = await query("https://www.matebid.com/", "test-only-token", { dimensions: ["page"] }, async (url, options) => {
    assert.ok(url.includes("https%3A%2F%2Fwww.matebid.com%2F"));
    assert.equal(options.headers.Authorization, "Bearer test-only-token");
    assert.deepEqual(JSON.parse(options.body), { dimensions: ["page"] });
    return { ok: true, json: async () => ({ rows: [{ clicks: 1 }] }) };
  });
  assert.equal(rows[0].clicks, 1);
});

test("provider errors are sanitized and invalid windows fail before network access", async () => {
  await assert.rejects(query("https://www.matebid.com/", "test", {}, async () => ({ ok: false, status: 403, json: async () => ({ secret: "never-return-this" }) })), /Google denied access/);
  await assert.rejects(syncSearchConsole({ days: 999 }), /days must/);
  await assert.rejects(syncSearchConsole({ endDate: "2026-02-30" }), /valid date/);
});
