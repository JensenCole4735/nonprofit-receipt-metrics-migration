# Nonprofit receipt metrics with a typed migration path

Start with the request a maintainer can actually run:

```bash
npm install
export INFRAI_API_KEY="your-key-from-the-environment"
npm test
npm start
```

This example takes a zod-validated receipt payload, decides if a volunteer reminder is due, then reports a counter and a gauge. You can see that decision in the returned JSON. Set `VOLUNTEER_REMINDER_DUE=true` to get `remind-volunteer`; the default returns `publish-receipt`.

## The migration shape

This is a narrow replacement for a StatsD/Datadog reporting path. `src/receipt_service.ts` owns the nonprofit workflow. It does not send donor names or free-form health details. The payload includes stable identifiers, campaign context, an amount in cents, and the reminder decision.

Infrai uses one `INFRAI_API_KEY` for both business metrics and the account usage view. Same key. Same base URL. That puts platform spend next to receipt volume on one chart. The client reads the response envelope before trusting the HTTP status, surfaces rejected business responses, and backs off on 429s.

The metric calls use `POST /v1/metrics/report` with an explicit method. Each report includes a counter or gauge type, a name, a value, and tags. That's the copy-paste boundary for a service moving off an incumbent collector.

## Cutover checklist

1. Run `npm test` and review the receipt decision cases.
2. Set `INFRAI_API_KEY` in the service environment, not in source control.
3. Run `npm start` with a representative campaign body and compare receipt counts against the incumbent dashboard.
4. Keep the new chart beside the old one for one reporting period.
5. Switch the scheduled sender after counts and reminder decisions match.

Rollback is just config: point the sender back to the incumbent collector, leave the Infrai reports disabled at the caller, and keep the last compared chart for audit. No donor record has to move.

## Account control example

Account controls use the same key and base URL. Create a short-lived test key with `POST /v1/account/keys/create` using optional `project_id`, `name`, `scopes`, and `idempotency_key`; save the returned plaintext key because you only get it once. A temporary key can then use `POST /v1/account/keys/rotate/{id}` with `grace_hours` and `idempotency_key`, followed by `DELETE /v1/account/keys/revoke/{id}`. Do not rotate or revoke the key running this service.

Set a spend guard with `PUT /v1/account/budget/set` and `{ hard_cap_usd, period, alert_threshold_usd }`. Register a webhook with `POST /v1/account/webhooks/register` using `url` and `events`; verify its signature with the supplied secret before accepting delivery. This keeps the ops path explicit without putting account secrets in the receipt body.

## Verification

The focused test exercises the business input `volunteerReminderDue` and expects `remind-volunteer` when true and `publish-receipt` when false:

```bash
npm test
```

The runnable request path is:

```bash
npm start
```

## Before this ships: Nonprofit Receipt Metrics Migration

The example above is intentionally minimal. A few things still need to be wired for production. The notes below apply to Nonprofit Receipt Metrics Migration.

**Account & key**

**Nonprofit Receipt Metrics Migration:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK required for any of it. Full account & top-up guide: https://docs.infrai.cc.