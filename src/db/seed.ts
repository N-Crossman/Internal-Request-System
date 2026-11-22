// Fills an empty database with realistic demo requests: `npm run db:seed`.
// It never deletes anything. If the requests table already has rows, it stops, so running it twice cannot create duplicates or wipe real data.

import "dotenv/config";
import { count } from "drizzle-orm";
import type { RequestPriority, RequestStatus, RequestType } from "../lib/constants";
import { client, db } from "./index";
import { requests, statusHistory } from "./schema";

type SeedRequest = {
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  requesterName: string;
  // Each status the request has moved through, with how many days ago it happened.
  // The first entry is when the request was created; the last is its current status.
  path: { status: RequestStatus; daysAgo: number }[];
};

const SEED: SeedRequest[] = [
  {
    title: "Game night ticket banner update",
    description:
      "Swap the homepage ticket banner to promote Saturday's game night package. New artwork is in the shared drive.",
    type: "website_update",
    priority: "high",
    requesterName: "Priya S.",
    path: [
      { status: "new", daysAgo: 12 },
      { status: "in_progress", daysAgo: 11 },
      { status: "completed", daysAgo: 9 },
    ],
  },
  {
    title: "Season ticket portal login issue",
    description:
      "Several season ticket holders report being sent back to the login page after entering the correct password.",
    type: "support",
    priority: "urgent",
    requesterName: "Marcus T.",
    path: [
      { status: "new", daysAgo: 3 },
      { status: "in_progress", daysAgo: 2 },
    ],
  },
  {
    title: "Add parking info to the game day page",
    description:
      "Fans keep asking where to park. Add lot locations, opening times and a link to the transit options.",
    type: "website_update",
    priority: "normal",
    requesterName: "Jenna K.",
    path: [{ status: "new", daysAgo: 1 }],
  },
  {
    title: "Fan zone live score widget",
    description:
      "Show the live score and period on the fan zone screens and the matching web page during home games.",
    type: "new_feature",
    priority: "low",
    requesterName: "Devon R.",
    path: [{ status: "new", daysAgo: 6 }],
  },
  {
    title: "Broken links in concert event listings",
    description:
      "The 'Buy tickets' buttons on three upcoming concert listings return a 404 page.",
    type: "support",
    priority: "high",
    requesterName: "Aisha M.",
    path: [
      { status: "new", daysAgo: 8 },
      { status: "in_progress", daysAgo: 7.9 },
      { status: "completed", daysAgo: 7 },
    ],
  },
  {
    title: "Promo code field for group ticket sales",
    description:
      "Group sales needs a promo code field on the group booking form so partner discounts apply at checkout.",
    type: "new_feature",
    priority: "normal",
    requesterName: "Liam O.",
    path: [
      { status: "new", daysAgo: 10 },
      { status: "in_progress", daysAgo: 5 },
    ],
  },
  {
    title: "Update staff directory photos",
    description: "Replace the placeholder photos for the six new hires in the internal staff directory.",
    type: "other",
    priority: "low",
    requesterName: "Grace L.",
    path: [{ status: "new", daysAgo: 4 }],
  },
  {
    title: "Accessible seating map refresh",
    description:
      "Update the accessible seating map to match the new arena layout. Reopened after the first version missed two sections.",
    type: "other",
    priority: "normal",
    requesterName: "Samir H.",
    path: [
      { status: "new", daysAgo: 14 },
      { status: "in_progress", daysAgo: 13 },
      { status: "completed", daysAgo: 10 },
      { status: "in_progress", daysAgo: 2 },
    ],
  },
];

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  const [{ total }] = await db.select({ total: count() }).from(requests);
  if (total > 0) {
    console.log(`Skipped: the requests table already has ${total} rows.`);
    return;
  }

  // One transaction: either every demo request and history row is saved, or none are.
  await db.transaction(async (tx) => {
    for (const item of SEED) {
      const created = daysAgo(item.path[0].daysAgo);
      const last = item.path[item.path.length - 1];

      const [row] = await tx
        .insert(requests)
        .values({
          title: item.title,
          description: item.description,
          type: item.type,
          priority: item.priority,
          requesterName: item.requesterName,
          status: last.status,
          createdAt: created,
          updatedAt: daysAgo(last.daysAgo),
        })
        .returning({ id: requests.id });

      // One history row per step; the first has no previous status.
      await tx.insert(statusHistory).values(
        item.path.map((step, i) => ({
          requestId: row.id,
          fromStatus: i === 0 ? null : item.path[i - 1].status,
          toStatus: step.status,
          changedAt: daysAgo(step.daysAgo),
        })),
      );
    }
  });

  console.log(`Seeded ${SEED.length} requests with their status history.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
