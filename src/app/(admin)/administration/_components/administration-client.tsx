"use client";

import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard, StatusPill } from "@/shared/components/liyon";
import type { AdminDocument } from "@/generated/prisma";
import { ExternalLink } from "lucide-react";

export function AdministrationClient({ initialItems }: { initialItems: AdminDocument[] }) {
  const t = useT();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("administration.title")}</h1>
          <p className="text-sm text-gray-500">{t("administration.subtitle")}</p>
        </div>
      </div>
      <LiyonCard>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2">Title</th>
                <th className="py-2">Category</th>
                <th className="py-2">Visibility</th>
                <th className="py-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.title}</td>
                  <td className="py-2">{t(`administration.category.${item.category}`)}</td>
                  <td className="py-2">
                    <StatusPill tone={item.visibility === "PUBLIC" ? "ok" : "warn"}>
                      {t(`administration.visibility.${item.visibility}`)}
                    </StatusPill>
                  </td>
                  <td className="py-2">
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
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
