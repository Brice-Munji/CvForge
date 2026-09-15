import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, normalizeEmail } from "./validation";

test("accepts legitimate email providers", () => {
  for (const email of [
    "name@gmail.com",
    "name@yahoo.com",
    "name@outlook.com",
    "name@hotmail.com",
    "name@icloud.com",
    "first.last@company.co.uk",
    "user+tag@sub.domain.io",
  ]) {
    assert.equal(isValidEmail(email), true, `${email} should be valid`);
  }
});

test("rejects malformed emails from the spec", () => {
  for (const email of [
    "name@gmail", // no TLD
    "name@", // no domain
    "name.com", // no @
    "name @gmail.com", // embedded space
    " name@gmail.com".replace(" ", "\t") + " x", // whitespace/extra token
    "@gmail.com", // no local part
    "name@@gmail.com", // double @
    "name@gmail..com", // consecutive dots
    "name@gmail.c", // TLD too short
    "", // empty
  ]) {
    assert.equal(isValidEmail(email), false, `${email} should be invalid`);
  }
});

test("trims surrounding whitespace when validating", () => {
  assert.equal(isValidEmail("  name@gmail.com  "), true);
});

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Name@Gmail.COM "), "name@gmail.com");
});
