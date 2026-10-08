"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import type { Department } from "@/generated/prisma";

export function DepartmentsAdminClient({ initialItems }: { initialItems: Department[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("personnel.nav")} (Departments)</h1>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Name (TH)</th>
                <th className="py-2">Name (EN)</th>
                <th className="py-2">Order</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.nameTh}</td>
                  <td className="py-2">{item.nameEn}</td>
                  <td className="py-2">{item.orderIndex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
