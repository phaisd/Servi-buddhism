import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P } from "@/features/news";
import { listNewsArticles } from "@/features/news/server";
import { NewsAdminClient } from "./_components/news-admin-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const { items, total } = await listNewsArticles(ctx.tenantId, { pageSize: 50 });

  return (
    <NewsAdminClient
      initialItems={items}
      initialTotal={total}
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
      canUpdate={hasPermission(ctx, NEWS_P.newsUpdate)}
      canReview={hasPermission(ctx, NEWS_P.newsReview)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
      canDelete={hasPermission(ctx, NEWS_P.newsDelete)}
    />
  );
}
