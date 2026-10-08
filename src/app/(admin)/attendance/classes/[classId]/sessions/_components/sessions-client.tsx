"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import type { AttendanceSession } from "@/generated/prisma";

type SessionWithCounts = AttendanceSession & { _count: { records: number } };

export function SessionsClient({ initialItems, classId: _classId }: { initialItems: SessionWithCounts[], classId: string }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("attendance.sessions.title")}</h1>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Date</th>
                <th className="py-2">Topic</th>
                <th className="py-2">Records</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(item.date))}
                  </td>
                  <td className="py-2">{item.topic || "-"}</td>
                  <td className="py-2">{item._count.records} students</td>
                </tr>
              ))}
              {initialItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">No sessions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
