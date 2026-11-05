import { z } from "zod";
import { InfraiClient, infrai } from "./infrai_client.ts";

export const receiptRequest = z.object({
  receiptId: z.string().min(1),
  donorId: z.string().min(1),
  amountCents: z.number().int().positive(),
  campaign: z.string().min(1),
  volunteerReminderDue: z.boolean(),
});
export type ReceiptRequest = z.infer<typeof receiptRequest>;

export function decideNextAction(input: ReceiptRequest): "remind-volunteer" | "publish-receipt" {
  return input.volunteerReminderDue ? "remind-volunteer" : "publish-receipt";
}

export async function reportReceipt(client: InfraiClient, raw: unknown) {
  const input = receiptRequest.parse(raw);
  const action = decideNextAction(input);
  await infrai.metrics.report(client, { type: "counter", name: "nonprofit.receipts.processed", value: 1, tags: { campaign: input.campaign, action } });
  await infrai.metrics.report(client, { type: "gauge", name: "nonprofit.receipts.amount_cents", value: input.amountCents, tags: { campaign: input.campaign } });
  return { receiptId: input.receiptId, action, amountCents: input.amountCents };
}
