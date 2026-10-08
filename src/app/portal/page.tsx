import Link from "next/link";
import { resolveTenantSettings } from "@/features/identity/server";
import { getPublicNewsList, resolvePublicTenantId } from "@/features/news/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { PortalHero } from "./_components/portal-hero";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Award,
  Video,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default async function PortalIndexPage() {
  const [settings, locale, tenantId] = await Promise.all([
    resolveTenantSettings(),
    getLocale(),
    resolvePublicTenantId(),
  ]);

  const { items: latestNews } = await getPublicNewsList(tenantId, {
    page: 1,
    pageSize: 4,
  }).catch(() => ({ items: [], total: 0 }));

  const quickServices = [
    {
      title: locale === "th" ? "หลักสูตรระดับปริญญา" : "Academic Programs",
      desc: locale === "th" ? "ปริญญาตรี โท เอก สาขาพระพุทธศาสนา" : "Undergraduate, Master & Ph.D.",
      href: "/portal/programs",
      icon: BookOpen,
      badge: locale === "th" ? "เปิดรับสมัคร" : "Admissions",
    },
    {
      title: locale === "th" ? "ระบบจองห้องประชุม" : "Room Booking System",
      desc: locale === "th" ? "จองห้องประชุมและอุปกรณ์ออนไลน์" : "Online Conference Reservations",
      href: "/portal/meetings",
      icon: Video,
      badge: locale === "th" ? "บริการออนไลน์" : "Online",
    },
    {
      title: locale === "th" ? "คำร้อง & ขอใบรับรอง" : "Student Requests & Forms",
      desc: locale === "th" ? "ยื่นคำร้องขอเอกสารสำคัญทางการศึกษา" : "Official Certificates & Requests",
      href: "/portal/certificates/request",
      icon: Award,
      badge: locale === "th" ? "บริการนิสิต" : "Services",
    },
    {
      title: locale === "th" ? "คลังเอกสาร & แบบฟอร์ม" : "Document Downloads",
      desc: locale === "th" ? "ดาวน์โหลดแบบฟอร์มคำร้องและระเบียบ" : "Academic Guidelines & Downloads",
      href: "/portal/documents",
      icon: FileText,
      badge: locale === "th" ? "ดาวน์โหลด" : "Downloads",
    },
  ];

  return (
    <div className="w-full">
      {/* ══════════ EMBER.dsgn / MotionSites-style Cinematic Hero Section (Full Bleed) ══════════ */}
      <PortalHero tenantSettings={settings} locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* ══════════ Section 1: Quick Services Grid ══════════ */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{locale === "th" ? "บริการสำคัญ" : "Core Services"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {locale === "th" ? "ระบบบริการการศึกษาและสารสนเทศ" : "Academic & Information Services"}
              </h2>
            </div>
            <Link
              href="/portal/programs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>{locale === "th" ? "ดูบริการทั้งหมด" : "View All"}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link
                  key={idx}
                  href={service.href}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-card/60 hover:bg-card border border-border/60 hover:border-border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {service.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span>{locale === "th" ? "เข้าใช้งาน" : "Access Service"}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ══════════ Section 2: Latest News & Activities ══════════ */}
        {latestNews.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{locale === "th" ? "ประชาสัมพันธ์" : "Announcements"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                  {locale === "th" ? "ข่าวสารและกิจกรรมล่าสุด" : "Latest News & Events"}
                </h2>
              </div>
              <Link
                href="/portal/news"
                className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <span>{locale === "th" ? "ดูข่าวสารทั้งหมด" : "All News"}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestNews.map((news) => {
                const title = locale === "th" ? news.titleTh : (news.titleEn || news.titleTh);
                const summary = locale === "th" ? news.summaryTh : (news.summaryEn || news.summaryTh);
                return (
                  <Link
                    key={news.id}
                    href={`/portal/news/${news.slug}`}
                    className="group flex flex-col rounded-2xl overflow-hidden border border-border/60 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {news.coverImageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={news.coverImageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-emerald-900/20 text-muted-foreground">
                          <BookOpen className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{news.publishedAt ? formatDate(news.publishedAt, locale) : "เร็วๆ นี้"}</span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {title}
                        </h3>
                        {summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                            {summary}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
                        <span>{locale === "th" ? "อ่านรายละเอียด" : "Read More"}</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════ Section 3: Faculty Personnel & Community Banner ══════════ */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-border/60 bg-gradient-to-r from-card to-muted/50 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>{locale === "th" ? "คณาจารย์ผู้ทรงคุณวุฒิ" : "Distinguished Faculty"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === "th"
                ? "รวมคณาจารย์และนักวิชาการพระพุทธศาสนาระดับโลก"
                : "World-Class Buddhist Scholars & Academic Faculty"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {locale === "th"
                ? "พบกับผู้เชี่ยวชาญด้านพระไตรปิฎกศึกษา ปรัชญา ศาสนาเปรียบเทียบ และการบริหารจัดการศึกษา ที่พร้อมถ่ายทอดองค์ความรู้แก่นิสิตทุกระดับชั้น"
                : "Learn from specialized professors in Tipitaka studies, Buddhist philosophy, and comparative religion."}
            </p>
            <div className="pt-2">
              <Link
                href="/portal/personnel"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                <span>{locale === "th" ? "ทำเนียบคณาจารย์และบุคลากร" : "View Faculty Directory"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex -space-x-4 overflow-hidden p-4">
            <div className="h-20 w-20 rounded-full border-4 border-background bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              MCU
            </div>
            <div className="h-20 w-20 rounded-full border-4 border-background bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              ธรรม
            </div>
            <div className="h-20 w-20 rounded-full border-4 border-background bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              ปัญญา
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
