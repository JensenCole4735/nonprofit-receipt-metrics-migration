import test from "node:test";
import assert from "node:assert/strict";
import { decideNextAction } from "./receipt_service.ts";

test("a due volunteer reminder wins the receipt routing decision", () => {
  assert.equal(decideNextAction({ receiptId: "r1", donorId: "d1", amountCents: 500, campaign: "clinic", volunteerReminderDue: true }), "remind-volunteer");
  assert.equal(decideNextAction({ receiptId: "r2", donorId: "d2", amountCents: 500, campaign: "clinic", volunteerReminderDue: false }), "publish-receipt");
});
