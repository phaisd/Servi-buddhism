"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";
import { StatusPill } from "@/shared/components/liyon";
import type { CertificateRequest, CertificateType, User } from "@/generated/prisma";

type RequestWithRelations = CertificateRequest & {
  certificateType: CertificateType;
  user: Pick<User, "id" | "name" | "email">;
};

export function RequestsAdminClient({ initialItems }: { initialItems: RequestWithRelations[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("certificates.title")}</h1>
          <p className="text-sm text-gray-500">{t("certificates.subtitle")}</p>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">User</th>
                <th className="py-2">Certificate Type</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2">
                    <div>{item.user.name}</div>
                    <div className="text-xs text-gray-500">{item.user.email}</div>
                  </td>
                  <td className="py-2">{item.certificateType.name}</td>
                  <td className="py-2">
                    <StatusPill 
                      tone={item.status === "APPROVED" ? "ok" : item.status === "REJECTED" ? "bad" : item.status === "PENDING" ? "warn" : "off"} 
                    >
                      {t(`status.${item.status}`)}
                    </StatusPill>
                  </td>
                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {initialItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiyonCard>
    </div>
  );
}
