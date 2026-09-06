import test from "node:test";
import assert from "node:assert/strict";
import { canAccess, planHasFeature, type UsageCounts } from "@/lib/entitlements";

function usage(atsAnalysisCount: number): UsageCounts {
  return { cvCount: 0, pdfExportCount: 0, applicationCount: 0, atsAnalysisCount };
}

test("ATS analyzer is available on both free and pro plans", () => {
  assert.equal(planHasFeature("free", "ATS_ANALYZER"), true);
  assert.equal(planHasFeature("pro_monthly", "ATS_ANALYZER"), true);
});

test("AI assistant is intentionally NOT offered on any plan", () => {
  assert.equal(planHasFeature("free", "AI_ASSISTANT"), false);
  assert.equal(planHasFeature("pro_monthly", "AI_ASSISTANT"), false);
});

test("free user under the monthly ATS limit is allowed", () => {
  const r = canAccess({ planId: "free", usage: usage(2) }, "ATS_ANALYZER");
  assert.equal(r.allowed, true);
});

test("free user at the monthly ATS limit is blocked with reason 'limit'", () => {
  const r = canAccess({ planId: "free", usage: usage(3) }, "ATS_ANALYZER");
  assert.equal(r.allowed, false);
  if (!r.allowed) {
    assert.equal(r.reason, "limit");
    assert.equal(r.feature, "ATS_ANALYZER");
    assert.ok(r.message.length > 0);
  }
});

test("free user over the limit stays blocked", () => {
  const r = canAccess({ planId: "free", usage: usage(9) }, "ATS_ANALYZER");
  assert.equal(r.allowed, false);
});

test("pro user has unlimited ATS analyses", () => {
  const r = canAccess({ planId: "pro_monthly", usage: usage(9999) }, "ATS_ANALYZER");
  assert.equal(r.allowed, true);
});
