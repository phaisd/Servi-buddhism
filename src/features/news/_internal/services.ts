import { prisma } from "@/shared/lib/infra/prisma";
import { logger } from "@/shared/lib/infra/logger";
import { writeAudit } from "@/features/identity/server";
import type {
  CreateNewsArticleInput,
  UpdateNewsArticleInput,
  ChangeNewsStatusInput,
  TogglePinNewsInput,
} from "./validations";
import type { NewsCategory, NewsStatus } from "@/generated/prisma";

export interface NewsAttachmentDto {
  id: string;
  articleId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  orderIndex: number;
  createdAt: string;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  titleTh: string;
  titleEn: string | null;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string | null;
  coverImageUrl: string | null;
  category: NewsCategory;
  status: NewsStatus;
  isPinned: boolean;
  pinOrder: number | null;
  viewCount: number;
  publishedAt: string | null;
  archivedAt: string | null;
  rejectionReason: string | null;
  authorId: string;
  authorName?: string;
  reviewerId: string | null;
  reviewerName?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: NewsAttachmentDto[];
}

export interface ListNewsOptions {
  category?: NewsCategory | "ALL";
  status?: NewsStatus | "ALL";
  search?: string;
  page?: number;
  pageSize?: number;
}

const MAX_PINNED_ARTICLES = 5;

export async function listNewsArticles(
  tenantId: string,
  options: ListNewsOptions = {}
): Promise<{ items: NewsArticleDto[]; total: number }> {
  const { category, status, search, page = 1, pageSize = 20 } = options;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { tenantId };

  if (category && category !== "ALL") {
    where.category = category;
  }
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { titleTh: { contains: term, mode: "insensitive" } },
      { titleEn: { contains: term, mode: "insensitive" } },
      { summaryTh: { contains: term, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { pinOrder: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: pageSize,
      include: {
        author: { select: { name: true } },
        reviewer: { select: { name: true } },
        attachments: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return {
    items: articles.map((a) => ({
      id: a.id,
      tenantId: a.tenantId,
      titleTh: a.titleTh,
      titleEn: a.titleEn,
      slug: a.slug,
      summaryTh: a.summaryTh,
      summaryEn: a.summaryEn,
      contentTh: a.contentTh,
      contentEn: a.contentEn,
      coverImageUrl: a.coverImageUrl,
      category: a.category,
      status: a.status,
      isPinned: a.isPinned,
      pinOrder: a.pinOrder,
      viewCount: a.viewCount,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      archivedAt: a.archivedAt ? a.archivedAt.toISOString() : null,
      rejectionReason: a.rejectionReason,
      authorId: a.authorId,
      authorName: a.author?.name,
      reviewerId: a.reviewerId,
      reviewerName: a.reviewer?.name ?? null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      attachments: a.attachments.map((att) => ({
        id: att.id,
        articleId: att.articleId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        orderIndex: att.orderIndex,
        createdAt: att.createdAt.toISOString(),
      })),
    })),
    total,
  };
}

export async function getNewsArticleById(
  tenantId: string,
  id: string
): Promise<NewsArticleDto | null> {
  const a = await prisma.newsArticle.findFirst({
    where: { id, tenantId },
    include: {
      author: { select: { name: true } },
      reviewer: { select: { name: true } },
      attachments: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!a) return null;

  return {
    id: a.id,
    tenantId: a.tenantId,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    category: a.category,
    status: a.status,
    isPinned: a.isPinned,
    pinOrder: a.pinOrder,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    archivedAt: a.archivedAt ? a.archivedAt.toISOString() : null,
    rejectionReason: a.rejectionReason,
    authorId: a.authorId,
    authorName: a.author?.name,
    reviewerId: a.reviewerId,
    reviewerName: a.reviewer?.name ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    attachments: a.attachments.map((att) => ({
      id: att.id,
      articleId: att.articleId,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
      orderIndex: att.orderIndex,
      createdAt: att.createdAt.toISOString(),
    })),
  };
}

export async function createNewsArticle(
  tenantId: string,
  authorId: string,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  // 1. Slug uniqueness check
  const existingSlug = await prisma.newsArticle.findUnique({
    where: { tenantId_slug: { tenantId, slug: input.slug } },
  });
  if (existingSlug) {
    throw new Error(`Slug "${input.slug}" is already in use.`);
  }

  // 2. Pin limit check
  if (input.isPinned) {
    const pinnedCount = await prisma.newsArticle.count({
      where: { tenantId, isPinned: true },
    });
    if (pinnedCount >= MAX_PINNED_ARTICLES) {
      throw new Error(`Cannot pin more than ${MAX_PINNED_ARTICLES} articles.`);
    }
  }

  const publishedDate = input.publishedAt
    ? new Date(input.publishedAt)
    : input.status === "PUBLISHED"
      ? new Date()
      : null;

  return prisma.$transaction(async (tx) => {
    const created = await tx.newsArticle.create({
      data: {
        tenantId,
        authorId,
        titleTh: input.titleTh,
        titleEn: input.titleEn ?? null,
        slug: input.slug,
        summaryTh: input.summaryTh ?? null,
        summaryEn: input.summaryEn ?? null,
        contentTh: input.contentTh,
        contentEn: input.contentEn ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        category: input.category,
        status: input.status,
        isPinned: input.isPinned,
        pinOrder: input.pinOrder ?? null,
        publishedAt: publishedDate,
        attachments: input.attachments && input.attachments.length > 0
          ? {
              create: input.attachments.map((att, idx) => ({
                tenantId,
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
                orderIndex: att.orderIndex ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { name: true } },
        attachments: { orderBy: { orderIndex: "asc" } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: authorId,
        action: "news.create",
        entity: "news_article",
        entityId: created.id,
        after: { title: created.titleTh, status: created.status },
      },
      tx
    );

    return {
      id: created.id,
      tenantId: created.tenantId,
      titleTh: created.titleTh,
      titleEn: created.titleEn,
      slug: created.slug,
      summaryTh: created.summaryTh,
      summaryEn: created.summaryEn,
      contentTh: created.contentTh,
      contentEn: created.contentEn,
      coverImageUrl: created.coverImageUrl,
      category: created.category,
      status: created.status,
      isPinned: created.isPinned,
      pinOrder: created.pinOrder,
      viewCount: created.viewCount,
      publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
      archivedAt: created.archivedAt ? created.archivedAt.toISOString() : null,
      rejectionReason: created.rejectionReason,
      authorId: created.authorId,
      authorName: created.author.name,
      reviewerId: created.reviewerId,
      reviewerName: null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      attachments: created.attachments.map((att) => ({
        id: att.id,
        articleId: att.articleId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        orderIndex: att.orderIndex,
        createdAt: att.createdAt.toISOString(),
      })),
    };
  });
}

export async function updateNewsArticle(
  tenantId: string,
  actorId: string,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("News article not found");
  }

  // Slug check if changed
  if (input.slug !== existing.slug) {
    const slugConflict = await prisma.newsArticle.findUnique({
      where: { tenantId_slug: { tenantId, slug: input.slug } },
    });
    if (slugConflict && slugConflict.id !== input.id) {
      throw new Error(`Slug "${input.slug}" is already in use.`);
    }
  }

  // Pin count check
  if (input.isPinned && !existing.isPinned) {
    const pinnedCount = await prisma.newsArticle.count({
      where: { tenantId, isPinned: true },
    });
    if (pinnedCount >= MAX_PINNED_ARTICLES) {
      throw new Error(`Cannot pin more than ${MAX_PINNED_ARTICLES} articles.`);
    }
  }

  const publishedDate = input.publishedAt
    ? new Date(input.publishedAt)
    : input.status === "PUBLISHED" && !existing.publishedAt
      ? new Date()
      : existing.publishedAt;

  return prisma.$transaction(async (tx) => {
    // Delete existing attachments if updated
    if (input.attachments) {
      await tx.newsAttachment.deleteMany({
        where: { articleId: input.id },
      });
    }

    const updated = await tx.newsArticle.update({
      where: { id: input.id, tenantId },
      data: {
        titleTh: input.titleTh,
        titleEn: input.titleEn ?? null,
        slug: input.slug,
        summaryTh: input.summaryTh ?? null,
        summaryEn: input.summaryEn ?? null,
        contentTh: input.contentTh,
        contentEn: input.contentEn ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        category: input.category,
        status: input.status,
        isPinned: input.isPinned,
        pinOrder: input.pinOrder ?? null,
        publishedAt: publishedDate,
        attachments: input.attachments && input.attachments.length > 0
          ? {
              create: input.attachments.map((att, idx) => ({
                tenantId,
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
                orderIndex: att.orderIndex ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { name: true } },
        reviewer: { select: { name: true } },
        attachments: { orderBy: { orderIndex: "asc" } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "news.update",
        entity: "news_article",
        entityId: updated.id,
        before: { title: existing.titleTh, status: existing.status },
        after: { title: updated.titleTh, status: updated.status },
      },
      tx
    );

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      titleTh: updated.titleTh,
      titleEn: updated.titleEn,
      slug: updated.slug,
      summaryTh: updated.summaryTh,
      summaryEn: updated.summaryEn,
      contentTh: updated.contentTh,
      contentEn: updated.contentEn,
      coverImageUrl: updated.coverImageUrl,
      category: updated.category,
      status: updated.status,
      isPinned: updated.isPinned,
      pinOrder: updated.pinOrder,
      viewCount: updated.viewCount,
      publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
      archivedAt: updated.archivedAt ? updated.archivedAt.toISOString() : null,
      rejectionReason: updated.rejectionReason,
      authorId: updated.authorId,
      authorName: updated.author.name,
      reviewerId: updated.reviewerId,
      reviewerName: updated.reviewer?.name ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      attachments: updated.attachments.map((att) => ({
        id: att.id,
        articleId: att.articleId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        orderIndex: att.orderIndex,
        createdAt: att.createdAt.toISOString(),
      })),
    };
  });
}

export async function changeNewsStatus(
  tenantId: string,
  reviewerId: string,
  input: ChangeNewsStatusInput
): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("News article not found");
  }

  const updateData: Record<string, unknown> = {
    status: input.status,
    reviewerId,
    rejectionReason: input.rejectionReason ?? null,
  };

  if (input.status === "PUBLISHED") {
    if (!existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
    updateData.archivedAt = null;
  } else if (input.status === "ARCHIVED") {
    updateData.archivedAt = new Date();
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.newsArticle.update({
      where: { id: input.id, tenantId },
      data: updateData,
      include: {
        author: { select: { name: true } },
        reviewer: { select: { name: true } },
        attachments: { orderBy: { orderIndex: "asc" } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: reviewerId,
        action: `news.status.${input.status.toLowerCase()}`,
        entity: "news_article",
        entityId: updated.id,
        before: { status: existing.status },
        after: { status: updated.status, rejectionReason: input.rejectionReason },
      },
      tx
    );

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      titleTh: updated.titleTh,
      titleEn: updated.titleEn,
      slug: updated.slug,
      summaryTh: updated.summaryTh,
      summaryEn: updated.summaryEn,
      contentTh: updated.contentTh,
      contentEn: updated.contentEn,
      coverImageUrl: updated.coverImageUrl,
      category: updated.category,
      status: updated.status,
      isPinned: updated.isPinned,
      pinOrder: updated.pinOrder,
      viewCount: updated.viewCount,
      publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
      archivedAt: updated.archivedAt ? updated.archivedAt.toISOString() : null,
      rejectionReason: updated.rejectionReason,
      authorId: updated.authorId,
      authorName: updated.author.name,
      reviewerId: updated.reviewerId,
      reviewerName: updated.reviewer?.name ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      attachments: updated.attachments.map((att) => ({
        id: att.id,
        articleId: att.articleId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        orderIndex: att.orderIndex,
        createdAt: att.createdAt.toISOString(),
      })),
    };
  });
}

export async function togglePinNewsArticle(
  tenantId: string,
  actorId: string,
  input: TogglePinNewsInput
): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("News article not found");
  }

  if (input.isPinned && !existing.isPinned) {
    const pinnedCount = await prisma.newsArticle.count({
      where: { tenantId, isPinned: true },
    });
    if (pinnedCount >= MAX_PINNED_ARTICLES) {
      throw new Error(`Cannot pin more than ${MAX_PINNED_ARTICLES} articles.`);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.newsArticle.update({
      where: { id: input.id, tenantId },
      data: {
        isPinned: input.isPinned,
        pinOrder: input.pinOrder ?? (input.isPinned ? 0 : null),
      },
      include: {
        author: { select: { name: true } },
        reviewer: { select: { name: true } },
        attachments: { orderBy: { orderIndex: "asc" } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: input.isPinned ? "news.pin" : "news.unpin",
        entity: "news_article",
        entityId: updated.id,
        before: { isPinned: existing.isPinned },
        after: { isPinned: updated.isPinned },
      },
      tx
    );

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      titleTh: updated.titleTh,
      titleEn: updated.titleEn,
      slug: updated.slug,
      summaryTh: updated.summaryTh,
      summaryEn: updated.summaryEn,
      contentTh: updated.contentTh,
      contentEn: updated.contentEn,
      coverImageUrl: updated.coverImageUrl,
      category: updated.category,
      status: updated.status,
      isPinned: updated.isPinned,
      pinOrder: updated.pinOrder,
      viewCount: updated.viewCount,
      publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
      archivedAt: updated.archivedAt ? updated.archivedAt.toISOString() : null,
      rejectionReason: updated.rejectionReason,
      authorId: updated.authorId,
      authorName: updated.author.name,
      reviewerId: updated.reviewerId,
      reviewerName: updated.reviewer?.name ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      attachments: updated.attachments.map((att) => ({
        id: att.id,
        articleId: att.articleId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        orderIndex: att.orderIndex,
        createdAt: att.createdAt.toISOString(),
      })),
    };
  });
}

export async function deleteNewsArticle(
  tenantId: string,
  actorId: string,
  id: string
): Promise<void> {
  const existing = await prisma.newsArticle.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new Error("News article not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.newsArticle.delete({
      where: { id, tenantId },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "news.delete",
        entity: "news_article",
        entityId: id,
        before: { title: existing.titleTh, slug: existing.slug },
      },
      tx
    );
  });
}

// -------------------------------------------------------------
// PUBLIC PORTAL QUERIES
// -------------------------------------------------------------

export async function getPublicNewsList(
  tenantId: string,
  options: {
    category?: NewsCategory | "ALL";
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ items: NewsArticleDto[]; total: number }> {
  const { category, search, page = 1, pageSize = 12 } = options;
  const skip = (page - 1) * pageSize;
  const now = new Date();

  const where: Record<string, unknown> = {
    tenantId,
    status: "PUBLISHED",
    publishedAt: { lte: now },
  };

  if (category && category !== "ALL") {
    where.category = category;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { titleTh: { contains: term, mode: "insensitive" } },
      { titleEn: { contains: term, mode: "insensitive" } },
      { summaryTh: { contains: term, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { pinOrder: "asc" },
        { publishedAt: "desc" },
      ],
      skip,
      take: pageSize,
      include: {
        author: { select: { name: true } },
        attachments: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return {
    items: articles.map((a) => ({
      id: a.id,
      tenantId: a.tenantId,
      titleTh: a.titleTh,
      titleEn: a.titleEn,
      slug: a.slug,
      summaryTh: a.summaryTh,
      summaryEn: a.summaryEn,
      contentTh: a.contentTh,
      contentEn: a.contentEn,
      coverImageUrl: a.coverImageUrl,
      category: a.category,
      status: a.status,
      isPinned: a.isPinned,
      pinOrder: a.pinOrder,
      viewCount: a.viewCount,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      archivedAt: null,
      rejectionReason: null,
      authorId: a.authorId,
      authorName: a.author.name,
      reviewerId: null,
      reviewerName: null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      attachments: a.attachments.map((att) => ({
        id: att.id,
        articleId: att.articleId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        orderIndex: att.orderIndex,
        createdAt: att.createdAt.toISOString(),
      })),
    })),
    total,
  };
}

export async function getPublicNewsBySlug(
  tenantId: string,
  slug: string,
  incrementView = false
): Promise<NewsArticleDto | null> {
  const now = new Date();
  const a = await prisma.newsArticle.findFirst({
    where: {
      tenantId,
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: now },
    },
    include: {
      author: { select: { name: true } },
      attachments: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!a) return null;

  if (incrementView) {
    // Increment viewCount asynchronously without blocking
    prisma.newsArticle
      .update({
        where: { id: a.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => logger.error("Failed to increment news viewCount", { err: String(err) }));
  }

  return {
    id: a.id,
    tenantId: a.tenantId,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    category: a.category,
    status: a.status,
    isPinned: a.isPinned,
    pinOrder: a.pinOrder,
    viewCount: a.viewCount + (incrementView ? 1 : 0),
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    archivedAt: null,
    rejectionReason: null,
    authorId: a.authorId,
    authorName: a.author.name,
    reviewerId: null,
    reviewerName: null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    attachments: a.attachments.map((att) => ({
      id: att.id,
      articleId: att.articleId,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
      orderIndex: att.orderIndex,
      createdAt: att.createdAt.toISOString(),
    })),
  };
}

export async function resolvePublicTenantId(): Promise<string> {
  const demoTenant = await prisma.tenant.findFirst({
    where: { code: "DEMO", isActive: true },
    select: { id: true },
  });
  if (demoTenant) return demoTenant.id;

  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!tenant) throw new Error("No active tenant found");
  return tenant.id;
}

