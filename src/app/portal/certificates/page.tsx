import Link from "next/link";
import { resolvePublicTenantId } from "@/features/news/server";
import { getMyCertificateRequests } from "@/features/certificates/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { FileText, Plus, FileBadge, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { auth } from "@/features/identity/server";
import { redirect } from "next/navigation";

export default async function PublicCertificatesPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login?callbackUrl=/portal/certificates");
  }

  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  
  const items = await getMyCertificateRequests(tenantId, session.user.id);

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <FileBadge className="h-3.5 w-3.5" />
            {locale === "th" ? "บริการเอกสาร" : "Document Services"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {locale === "th" ? "หนังสือรับรองของฉัน" : "My Certificates"}
          </h1>
        </div>
        <Link
          href="/portal/certificates/request"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {locale === "th" ? "ยื่นคำร้องใหม่" : "New Request"}
        </Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center bg-card">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {locale === "th" ? "ยังไม่มีคำร้อง" : "No requests found"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {locale === "th" ? "คุณยังไม่เคยยื่นคำร้องขอหนังสือรับรองใดๆ" : "You have not submitted any certificate requests yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-lg leading-tight">{item.certificateType.name}</h3>
                    <div className="shrink-0 mt-0.5">
                      {item.status === "APPROVED" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle className="h-3 w-3"/> Approved</span>
                      ) : item.status === "REJECTED" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full"><XCircle className="h-3 w-3"/> Rejected</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full"><Clock className="h-3 w-3"/> Pending</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {locale === "th" ? "ยื่นเมื่อ:" : "Submitted:"} {formatDate(item.createdAt, locale)}
                  </p>
                  {item.note && (
                    <p className="text-sm bg-muted/50 p-2.5 rounded mt-3 text-muted-foreground italic border-l-2 border-muted-foreground/30">
                      {item.note}
                    </p>
                  )}
                  {item.status === "REJECTED" && item.reason && (
                    <div className="mt-3 bg-red-50 p-3 rounded-md border border-red-100 text-sm">
                      <p className="font-semibold text-red-800 mb-1">{locale === "th" ? "เหตุผลที่ปฏิเสธ:" : "Reason for rejection:"}</p>
                      <p className="text-red-700">{item.reason}</p>
                    </div>
                  )}
                </div>
                {item.status === "APPROVED" && item.issuedDocumentUrl && (
                  <div className="mt-5 pt-4 border-t border-border/50">
                    <a href={item.issuedDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                      {locale === "th" ? "ดาวน์โหลดเอกสาร" : "Download Document"} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
