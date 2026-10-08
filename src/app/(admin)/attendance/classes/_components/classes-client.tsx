"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import type { AttendanceClass } from "@/generated/prisma";
import Link from "next/link";

export function ClassesClient({ initialItems }: { initialItems: AttendanceClass[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("attendance.classes.title")}</h1>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Course Code</th>
                <th className="py-2">Course Name</th>
                <th className="py-2">Term</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{item.courseCode}</td>
                  <td className="py-2">{item.courseName}</td>
                  <td className="py-2">{item.term}</td>
                  <td className="py-2">
                    <Link href={`/attendance/classes/${item.id}/sessions`} className="text-primary hover:underline">
                      Manage Sessions
                    </Link>
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
