"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import { CertificateType } from "@/generated/prisma";

export function TypesAdminClient({ initialItems }: { initialItems: CertificateType[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("certificates.nav")} - Types</h1>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Name</th>
                <th className="py-2">Description</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2">{item.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
