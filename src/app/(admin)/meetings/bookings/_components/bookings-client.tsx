"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard, StatusPill } from "@/shared/components/liyon";
import type { MeetingBooking, MeetingRoom, User } from "@/generated/prisma";

type BookingWithRelations = MeetingBooking & { room: MeetingRoom, requester: User };

export function BookingsClient({ initialItems }: { initialItems: BookingWithRelations[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("meetings.bookings.title")}</h1>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Room</th>
                <th className="py-2">Topic</th>
                <th className="py-2">Time</th>
                <th className="py-2">Requester</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{item.room.name}</td>
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 text-sm text-gray-600">
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.startTime))} - {new Intl.DateTimeFormat("en-GB", { timeStyle: "short" }).format(new Date(item.endTime))}
                  </td>
                  <td className="py-2">{item.requester.name}</td>
                  <td className="py-2">
                    <StatusPill tone={
                      item.status === "APPROVED" ? "ok" :
                      item.status === "PENDING" ? "warn" :
                      item.status === "REJECTED" ? "bad" : "off"
                    }>
                      {t(`meetings.status.${item.status}`)}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
