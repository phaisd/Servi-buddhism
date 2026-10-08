"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import type { Event } from "@/generated/prisma";
import Link from "next/link";

type EventWithCounts = Event & { _count: { registrations: number } };

export function EventsClient({ initialItems }: { initialItems: EventWithCounts[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("events.title")}</h1>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Event Title</th>
                <th className="py-2">Date</th>
                <th className="py-2">Location</th>
                <th className="py-2">Registrations</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{item.title}</td>
                  <td className="py-2">
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(item.startDate))}
                  </td>
                  <td className="py-2">{item.location || "-"}</td>
                  <td className="py-2">
                    {item._count.registrations} / {item.capacity > 0 ? item.capacity : "∞"}
                  </td>
                  <td className="py-2">
                    <Link href={`/events/${item.id}/registrations`} className="text-primary hover:underline">
                      View Registrations
                    </Link>
                  </td>
                </tr>
              ))}
              {initialItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">No events found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
