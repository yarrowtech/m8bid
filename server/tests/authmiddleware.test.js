const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { decodeToken } = require("../middleware/authmiddleware");

for (const [name, token, code] of [
  ["expired", jwt.sign({ id: "test-user" }, process.env.JWT_SECRET || "default_secret", { expiresIn: -1 }), "TOKEN_EXPIRED"],
  ["invalid", "invalid-token", "INVALID_TOKEN"],
]) {
  test(`${name} tokens return a clear 401 without continuing`, async () => {
    let status;
    let body;
    const res = {
      status(value) { status = value; return this; },
      json(value) { body = value; return this; },
    };
    await decodeToken({ headers: { authorization: `Bearer ${token}` } }, res, () => assert.fail("Unauthorized request continued"));
    assert.equal(status, 401);
    assert.equal(body.success, false);
    assert.equal(body.code, code);
  });
}
