import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicCurriculums } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { BookOpen, GraduationCap, Clock } from "lucide-react";

export default async function PublicCurriculumPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  
  const items = await getPublicCurriculums(tenantId);

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          {locale === "th" ? "หลักสูตรที่เปิดสอน" : "Academic Programs"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {locale === "th" ? "ข้อมูลหลักสูตร" : "Curriculums"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all duration-300">
            <div className="p-6 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold tracking-wide uppercase mb-3">
                <GraduationCap className="h-3 w-3" />
                {item.degree}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {locale === "th" ? item.nameTh : (item.nameEn || item.nameTh)}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {locale === "th" ? item.descriptionTh : (item.descriptionEn || item.descriptionTh)}
              </p>
            </div>
            <div className="px-6 py-4 bg-muted/50 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                {item.durationYears} {locale === "th" ? "ปี" : "Years"}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            {locale === "th" ? "ยังไม่มีข้อมูลหลักสูตร" : "No programs available."}
          </div>
        )}
      </div>
    </div>
  );
}
