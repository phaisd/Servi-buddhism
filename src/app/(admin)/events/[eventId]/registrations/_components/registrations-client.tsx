"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard, StatusPill } from "@/shared/components/liyon";
import type { EventRegistration, Event } from "@/generated/prisma";
import Link from "next/link";

export function RegistrationsClient({ initialItems, event }: { initialItems: EventRegistration[], event: Event }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events" className="text-gray-500 hover:text-gray-900">&larr; Back</Link>
        <h1 className="text-2xl font-bold">{event.title} - Registrations</h1>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Student ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{item.studentCode}</td>
                  <td className="py-2">{item.studentName}</td>
                  <td className="py-2">
                    <StatusPill tone={
                      item.status === "ATTENDED" ? "ok" :
                      item.status === "REGISTERED" ? "info" : "bad"
                    }>
                      {t(`events.status.${item.status}`)}
                    </StatusPill>
                  </td>
                </tr>
              ))}
              {initialItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">No registrations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
