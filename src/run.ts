import { InfraiClient } from "./infrai_client.ts";
import { reportReceipt } from "./receipt_service.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example.");

const result = await reportReceipt(new InfraiClient(key), {
  receiptId: process.env.RECEIPT_ID ?? "receipt-local-1",
  donorId: process.env.DONOR_ID ?? "donor-local-1",
  amountCents: Number(process.env.AMOUNT_CENTS ?? "12500"),
  campaign: process.env.CAMPAIGN ?? "community-clinic",
  volunteerReminderDue: process.env.VOLUNTEER_REMINDER_DUE === "true",
});
console.log(JSON.stringify({ result, chart: "business metrics + platform usage", migration: "ready" }, null, 2));
