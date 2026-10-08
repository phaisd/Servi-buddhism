import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicDocuments } from "@/features/administration/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { getSessionContext } from "@/features/identity/server";
import { FileText, Download, Lock } from "lucide-react";

export default async function PublicDocumentsPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  const session = await getSessionContext();
  
  const isInternalUser = !!session;
  const items = await getPublicDocuments(tenantId, isInternalUser);

  // Group by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case "FORM": return locale === "th" ? "แบบฟอร์ม" : "Forms";
      case "MANUAL": return locale === "th" ? "คู่มือปฏิบัติงาน" : "Manuals";
      case "POLICY": return locale === "th" ? "ระเบียบและประกาศ" : "Policies";
      default: return locale === "th" ? "อื่นๆ" : "Others";
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <FileText className="h-3.5 w-3.5" />
          {locale === "th" ? "ศูนย์รวมเอกสาร" : "Document Center"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {locale === "th" ? "ดาวน์โหลดแบบฟอร์มและคู่มือ" : "Download Forms & Manuals"}
        </h1>
        {!isInternalUser && (
          <p className="mt-2 text-muted-foreground flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {locale === "th" ? "เข้าสู่ระบบเพื่อดูเอกสารสำหรับบุคลากรภายใน" : "Log in to view internal documents"}
          </p>
        )}
      </div>

      <div className="space-y-12">
        {Object.entries(grouped).map(([cat, docs]) => (
          <section key={cat} className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-2">{getCategoryName(cat)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <a 
                  key={doc.id} 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group p-5 flex flex-col justify-between overflow-hidden rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      {doc.visibility === "INTERNAL" && (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-800">
                          <Lock className="h-3 w-3" /> Internal
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    <Download className="h-4 w-4" />
                    {locale === "th" ? "เปิดเอกสาร" : "Open Document"}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
        {items.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            {locale === "th" ? "ยังไม่มีเอกสารในระบบ" : "No documents available."}
          </div>
        )}
      </div>
    </div>
  );
}
