"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import type { Personnel, Department } from "@/generated/prisma";

type PersonnelWithDept = Personnel & { department: Department | null };

export function PersonnelAdminClient({ initialItems }: { initialItems: PersonnelWithDept[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("personnel.title")}</h1>
          <p className="text-sm text-gray-500">{t("personnel.subtitle")}</p>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Name</th>
                <th className="py-2">Position</th>
                <th className="py-2">Type</th>
                <th className="py-2">Department</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.firstNameTh} {item.lastNameTh}</td>
                  <td className="py-2">{item.positionTh}</td>
                  <td className="py-2">{t(`personnel.type.${item.type}`)}</td>
                  <td className="py-2">{item.department?.nameTh || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
