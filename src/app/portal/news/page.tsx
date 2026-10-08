import Link from "next/link";
import { getPublicNewsList, resolvePublicTenantId } from "@/features/news/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { Pin, Eye, Calendar, ArrowRight, Search, Newspaper } from "lucide-react";
import type { NewsCategory } from "@/generated/prisma";

interface Props {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

const CATEGORIES: { key: string; labelTh: string; labelEn: string }[] = [
  { key: "ALL", labelTh: "ทั้งหมด", labelEn: "All" },
  { key: "ACADEMIC", labelTh: "ข่าววิชาการ", labelEn: "Academic" },
  { key: "EVENT", labelTh: "ข่าวกิจกรรม", labelEn: "Events" },
  { key: "GENERAL", labelTh: "ข่าวทั่วไป", labelEn: "General" },
  { key: "PROCUREMENT", labelTh: "จัดซื้อจัดจ้าง", labelEn: "Procurement" },
  { key: "BUDDHIST_AFFAIRS", labelTh: "กิจการพระพุทธศาสนา", labelEn: "Buddhist Affairs" },
];

export default async function PublicNewsPage({ searchParams }: Props) {
  const { category, search, page } = await searchParams;
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const selectedCategory = (category as NewsCategory) || undefined;
  const currentPage = page ? parseInt(page, 10) : 1;

  const { items, total } = await getPublicNewsList(tenantId, {
    category: selectedCategory,
    search,
    page: currentPage,
    pageSize: 12,
  });

  const pinnedItems = items.filter((item) => item.isPinned);
  const regularItems = items.filter((item) => !item.isPinned);

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Title Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Newspaper className="h-3.5 w-3.5" />
          {locale === "th" ? "ข่าวสารและกิจกรรม" : "News & Activities"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {locale === "th" ? "ข่าวสารประชาสัมพันธ์ คณะพุทธศาสตร์" : "Faculty of Buddhism News Portal"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {locale === "th"
            ? "ติดตามข่าววิชาการ กิจกรรมคณะ งานศาสนกิจ และประกาศสำคัญต่าง ๆ"
            : "Stay updated with academic news, faculty events, Buddhist affairs, and announcements"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => {
            const isActive = (!category && cat.key === "ALL") || category === cat.key;
            return (
              <Link
                key={cat.key}
                href={cat.key === "ALL" ? "/portal/news" : `/portal/news?category=${cat.key}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {locale === "th" ? cat.labelTh : cat.labelEn}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/portal/news" className="relative w-full md:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder={locale === "th" ? "ค้นหาข่าวสาร..." : "Search news..."}
            className="w-full rounded-full border border-input bg-background pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-muted-foreground" />
        </form>
      </div>

      {/* Pinned / Featured Section */}
      {pinnedItems.length > 0 && !search && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <Pin className="h-4 w-4" />
            <span>{locale === "th" ? "ข่าวเด่น / ข่าวปักหมุด" : "Featured News"}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pinnedItems.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                      {locale === "th" ? "ข่าวเด่น" : "Featured"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.publishedAt || item.createdAt, locale)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    <Link href={`/portal/news/${item.slug}`}>
                      <span className="absolute inset-0" />
                      {locale === "en" && item.titleEn ? item.titleEn : item.titleTh}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {locale === "en" && item.summaryEn ? item.summaryEn : item.summaryTh || item.contentTh}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="h-3 w-3" />
                    {item.viewCount.toLocaleString()} {locale === "th" ? "ครั้ง" : "views"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    {locale === "th" ? "อ่านรายละเอียด" : "Read more"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {locale === "th" ? "ข่าวสารทั้งหมด" : "All News Articles"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {total} {locale === "th" ? "รายการ" : "articles"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {locale === "th" ? "ไม่พบข่าวสารในหมวดหมู่นี้" : "No news articles found"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {locale === "th"
                ? "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น"
                : "Try a different search term or select another category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(pinnedItems.length > 0 && !search ? regularItems : items).map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/40"
              >
                {item.coverImageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.coverImageUrl}
                      alt={item.titleTh}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1 p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-0.5 font-medium">
                      {CATEGORIES.find((c) => c.key === item.category)?.labelTh || item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.publishedAt || item.createdAt, locale)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/portal/news/${item.slug}`}>
                      <span className="absolute inset-0" />
                      {locale === "en" && item.titleEn ? item.titleEn : item.titleTh}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {locale === "en" && item.summaryEn ? item.summaryEn : item.summaryTh || item.contentTh}
                  </p>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="h-3 w-3" />
                    {item.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    {locale === "th" ? "อ่านต่อ" : "Read"}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
