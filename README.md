# Helpdesk-Lite (#20)

`HelpdeskTicket` repurposed as a plain "did my thing get done" inbox, WhatsApp-linked. Meant to be
bundled into other CRMs in this catalog (Garage CRM, Patient CRM) as a support layer, not sold
standalone.

`Ticket` ported from Project CRM (`#08`)'s `tickets.controller.ts` (itself from `apps/crm-svc`'s
`HelpdeskController`) — same shape, `contractId` dropped (nothing project-shaped here).

**"WhatsAppBatch" reuse, reinterpreted, not literally ported**: that model's real shape (day-numbered
batches, daily quota, round-robin-by-country interleaving — see WhatsApp-Only CRM `#13`) is built for
scheduling a cold-outreach campaign against a big lead list. A "plain inbox" that WhatsApps a
customer when their ticket is done needs none of that — no campaign clock, no quota, one notification
per event. Kept only the part that fits: a flat `WhatsAppNotification` PENDING/SENT queue (same
simulate-only shape as `WhatsAppBatchLead` — a human opens `wa.me` and sends manually, then marks it
here), auto-created when a ticket closes.

## Local dev

Backend: `:3321`. Frontend: `:5195`.

```
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```

```
cd frontend
npm install
npm run dev
```
