"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Newspaper,
  AlertCircle,
  Pin,
  PinOff,
  CheckCircle,
  XCircle,
  Archive,
  Send,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { NewsArticleDto, CreateNewsArticleInput } from "@/features/news";
import type { NewsCategory, NewsStatus } from "@/generated/prisma";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  deleteNewsArticleAction,
  getNewsArticlesAction,
  changeNewsStatusAction,
  togglePinNewsAction,
} from "@/features/news/actions";

interface Props {
  initialItems: NewsArticleDto[];
  initialTotal: number;
  canCreate: boolean;
  canUpdate: boolean;
  canReview: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0E00-\u0E7F-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewsAdminClient({
  initialItems,
  canCreate,
  canUpdate,
  canReview,
  canPublish,
  canDelete,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<NewsArticleDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsArticleDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleDto | null>(null);
  const [rejectDialogItem, setRejectDialogItem] = useState<NewsArticleDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Form Fields
  const [formTitleTh, setFormTitleTh] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState<NewsCategory>("GENERAL");
  const [formStatus, setFormStatus] = useState<NewsStatus>("DRAFT");
  const [formSummaryTh, setFormSummaryTh] = useState("");
  const [formSummaryEn, setFormSummaryEn] = useState("");
  const [formContentTh, setFormContentTh] = useState("");
  const [formContentEn, setFormContentEn] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const refreshItems = async () => {
    const res = await getNewsArticlesAction({
      category: selectedCategory as NewsCategory | "ALL",
      status: selectedStatus as NewsStatus | "ALL",
      search: search.trim() || undefined,
      pageSize: 50,
    });
    if (res.ok) {
      setItems(res.data.items);
    }
  };

  const handleFilterSearch = () => {
    startTransition(async () => {
      await refreshItems();
    });
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormTitleTh("");
    setFormTitleEn("");
    setFormSlug("");
    setFormCategory("GENERAL");
    setFormStatus("DRAFT");
    setFormSummaryTh("");
    setFormSummaryEn("");
    setFormContentTh("");
    setFormContentEn("");
    setFormCoverImageUrl("");
    setFormIsPinned(false);
    setFormOpen(true);
  };

  const openEditDialog = (item: NewsArticleDto) => {
    setEditingItem(item);
    setFormTitleTh(item.titleTh);
    setFormTitleEn(item.titleEn ?? "");
    setFormSlug(item.slug);
    setFormCategory(item.category);
    setFormStatus(item.status);
    setFormSummaryTh(item.summaryTh ?? "");
    setFormSummaryEn(item.summaryEn ?? "");
    setFormContentTh(item.contentTh);
    setFormContentEn(item.contentEn ?? "");
    setFormCoverImageUrl(item.coverImageUrl ?? "");
    setFormIsPinned(item.isPinned);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formTitleTh.trim() || !formContentTh.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const slug = (formSlug.trim() || generateSlug(formTitleTh)) || `news-${Date.now()}`;

    startTransition(async () => {
      if (editingItem) {
        const res = await updateNewsArticleAction({
          id: editingItem.id,
          titleTh: formTitleTh.trim(),
          titleEn: formTitleEn.trim() || null,
          slug,
          category: formCategory,
          status: formStatus,
          summaryTh: formSummaryTh.trim() || null,
          summaryEn: formSummaryEn.trim() || null,
          contentTh: formContentTh.trim(),
          contentEn: formContentEn.trim() || null,
          coverImageUrl: formCoverImageUrl.trim() || null,
          isPinned: formIsPinned,
        });
        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setFormOpen(false);
          await refreshItems();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const payload: CreateNewsArticleInput = {
          titleTh: formTitleTh.trim(),
          titleEn: formTitleEn.trim() || null,
          slug,
          category: formCategory,
          status: formStatus,
          summaryTh: formSummaryTh.trim() || null,
          summaryEn: formSummaryEn.trim() || null,
          contentTh: formContentTh.trim(),
          contentEn: formContentEn.trim() || null,
          coverImageUrl: formCoverImageUrl.trim() || null,
          isPinned: formIsPinned,
        };
        const res = await createNewsArticleAction(payload);
        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setFormOpen(false);
          await refreshItems();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const handleChangeStatus = (item: NewsArticleDto, newStatus: NewsStatus, reason?: string) => {
    startTransition(async () => {
      const res = await changeNewsStatusAction({
        id: item.id,
        status: newStatus,
        rejectionReason: reason || null,
      });
      if (res.ok) {
        toast.success(
          newStatus === "PUBLISHED"
            ? t("news.publishSuccess")
            : newStatus === "ARCHIVED"
              ? t("news.unpublishSuccess")
              : t("news.updateSuccess")
        );
        setRejectDialogItem(null);
        await refreshItems();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleTogglePin = (item: NewsArticleDto) => {
    startTransition(async () => {
      const res = await togglePinNewsAction({
        id: item.id,
        isPinned: !item.isPinned,
      });
      if (res.ok) {
        toast.success(t("news.pinSuccess"));
        await refreshItems();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleDelete = (item: NewsArticleDto) => {
    startTransition(async () => {
      const res = await deleteNewsArticleAction(item.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshItems();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const getStatusTone = (status: NewsStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "ok";
      case "PENDING_REVIEW":
        return "warn";
      case "ARCHIVED":
        return "bad";
      default:
        return "off";
    }
  };

  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "title",
      header: t("news.titleTh"),
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {row.isPinned && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Pin className="h-3 w-3" />
                {t("news.isPinned")}
              </span>
            )}
            <span className="font-medium text-foreground">{row.titleTh}</span>
          </div>
          {row.titleEn && (
            <span className="text-xs text-muted-foreground">{row.titleEn}</span>
          )}
          <span className="text-xs text-muted-foreground/80 font-mono">/{row.slug}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.category"),
      className: "nowrap",
      render: (row) => (
        <span className="inline-block rounded-md bg-muted px-2 py-1 text-xs font-medium">
          {t(`news.cat.${row.category}`)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.status"),
      className: "nowrap",
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {t(`news.status.${row.status}`)}
        </StatusPill>
      ),
    },
    {
      key: "author",
      header: t("news.author"),
      className: "nowrap",
      render: (row) => (
        <span className="text-sm text-muted-foreground">{row.authorName ?? "-"}</span>
      ),
    },
    {
      key: "views",
      header: t("news.views"),
      className: "num nowrap",
      render: (row) => (
        <span className="text-sm font-mono text-muted-foreground">
          {row.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("news.publishedAt"),
      className: "nowrap",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.publishedAt || row.createdAt, locale)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("news.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t("news.create")}
          </Button>
        )}
      </div>

      {/* Main Data Table */}
      <LiyonCard>
        <DataTable
          state={items.length === 0 ? "empty" : "data"}
          rows={items}
          columns={columns}
          getRowId={(row) => row.id}
          headHeading={t("news.title")}
          headMeta={`${t("news.views")}: ${items.length} ${locale === "th" ? "รายการ" : "items"}`}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <input
                  type="text"
                  placeholder={t("news.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFilterSearch()}
                  className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="w-[160px]">
                <LiyonSelect
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">{t("news.cat.ALL")}</option>
                  <option value="ACADEMIC">{t("news.cat.ACADEMIC")}</option>
                  <option value="EVENT">{t("news.cat.EVENT")}</option>
                  <option value="GENERAL">{t("news.cat.GENERAL")}</option>
                  <option value="PROCUREMENT">{t("news.cat.PROCUREMENT")}</option>
                  <option value="BUDDHIST_AFFAIRS">{t("news.cat.BUDDHIST_AFFAIRS")}</option>
                </LiyonSelect>
              </div>
              <div className="w-[160px]">
                <LiyonSelect
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">{t("news.status.ALL")}</option>
                  <option value="DRAFT">{t("news.status.DRAFT")}</option>
                  <option value="PENDING_REVIEW">{t("news.status.PENDING_REVIEW")}</option>
                  <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                  <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
                </LiyonSelect>
              </div>
              <Button variant="outline" size="sm" onClick={handleFilterSearch}>
                {t("common.filter")}
              </Button>
            </div>
          }
          renderRowMenu={(row) => (
            <>
              {canUpdate && (
                <RowMenuItem
                  onSelect={() => openEditDialog(row)}
                  icon={<Edit2 className="h-4 w-4" />}
                >
                  {t("news.edit")}
                </RowMenuItem>
              )}

              {canPublish && (
                <RowMenuItem
                  onSelect={() => handleTogglePin(row)}
                  icon={row.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                >
                  {row.isPinned ? t("news.unpin") : t("news.pin")}
                </RowMenuItem>
              )}

              {canPublish && row.status !== "PUBLISHED" && (
                <RowMenuItem
                  onSelect={() => handleChangeStatus(row, "PUBLISHED")}
                  icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
                >
                  {t("news.publish")}
                </RowMenuItem>
              )}

              {canPublish && row.status === "PUBLISHED" && (
                <RowMenuItem
                  onSelect={() => handleChangeStatus(row, "ARCHIVED")}
                  icon={<Archive className="h-4 w-4" />}
                >
                  {t("news.unpublish")}
                </RowMenuItem>
              )}

              {row.status === "DRAFT" && canUpdate && (
                <RowMenuItem
                  onSelect={() => handleChangeStatus(row, "PENDING_REVIEW")}
                  icon={<Send className="h-4 w-4 text-blue-600" />}
                >
                  {t("news.submitReview")}
                </RowMenuItem>
              )}

              {canReview && row.status === "PENDING_REVIEW" && (
                <RowMenuItem
                  onSelect={() => {
                    setRejectDialogItem(row);
                    setRejectionReason("");
                  }}
                  danger
                  icon={<XCircle className="h-4 w-4 text-rose-600" />}
                >
                  {t("news.reject")}
                </RowMenuItem>
              )}

              {canDelete && (
                <RowMenuItem
                  onSelect={() => setDeleteConfirmItem(row)}
                  danger
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  {t("news.delete")}
                </RowMenuItem>
              )}
            </>
          )}
          empty={{
            icon: <Newspaper className="h-10 w-10 text-muted-foreground/50" />,
            title: t("news.empty"),
            description: t("news.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Dialog สร้าง/แก้ไขข้อมูลข่าว */}
      <LiyonDialog open={formOpen} onOpenChange={setFormOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={editingItem ? t("news.edit") : t("news.create")}
          description={t("news.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LiyonField label={t("news.titleTh")} htmlFor="news-title-th">
                <input
                  id="news-title-th"
                  value={formTitleTh}
                  onChange={(e) => {
                    setFormTitleTh(e.target.value);
                    if (!editingItem && !formSlug) {
                      setFormSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="เช่น มหาวิทยาลัยเปิดรับสมัครนิสิตใหม่..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </LiyonField>

              <LiyonField label={t("news.titleEn")} htmlFor="news-title-en">
                <input
                  id="news-title-en"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="e.g. Faculty admission is now open..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <LiyonField label={t("news.slug")} htmlFor="news-slug">
                <input
                  id="news-slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="admission-2569"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </LiyonField>

              <LiyonField label={t("news.category")} htmlFor="news-category">
                <LiyonSelect
                  id="news-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as NewsCategory)}
                >
                  <option value="GENERAL">{t("news.cat.GENERAL")}</option>
                  <option value="ACADEMIC">{t("news.cat.ACADEMIC")}</option>
                  <option value="EVENT">{t("news.cat.EVENT")}</option>
                  <option value="PROCUREMENT">{t("news.cat.PROCUREMENT")}</option>
                  <option value="BUDDHIST_AFFAIRS">{t("news.cat.BUDDHIST_AFFAIRS")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("news.status")} htmlFor="news-status">
                <LiyonSelect
                  id="news-status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as NewsStatus)}
                >
                  <option value="DRAFT">{t("news.status.DRAFT")}</option>
                  <option value="PENDING_REVIEW">{t("news.status.PENDING_REVIEW")}</option>
                  <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                  <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label={t("news.coverImageUrl")} htmlFor="news-cover">
              <input
                id="news-cover"
                value={formCoverImageUrl}
                onChange={(e) => setFormCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </LiyonField>

            <LiyonField label={t("news.summaryTh")} htmlFor="news-summary-th">
              <textarea
                id="news-summary-th"
                rows={2}
                value={formSummaryTh}
                onChange={(e) => setFormSummaryTh(e.target.value)}
                placeholder="คำโปรยสรุปสาระสำคัญสั้น ๆ..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </LiyonField>

            <LiyonField label={t("news.contentTh")} htmlFor="news-content-th">
              <textarea
                id="news-content-th"
                rows={6}
                value={formContentTh}
                onChange={(e) => setFormContentTh(e.target.value)}
                placeholder="เนื้อหาข่าวแบบละเอียด..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </LiyonField>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="news-pinned"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="news-pinned" className="text-sm font-medium text-foreground cursor-pointer">
                {t("news.isPinned")} (Featured)
              </label>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isPending}>
            {t("news.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {t("news.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog ตีกลับแก้ไข */}
      <LiyonDialog open={!!rejectDialogItem} onOpenChange={(open) => !open && setRejectDialogItem(null)}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("news.reject")}
          description={rejectDialogItem?.titleTh}
        />
        <LiyonDialogBody>
          <div className="space-y-3 py-2">
            <LiyonField label={t("news.rejectionReason")} htmlFor="reject-reason">
              <textarea
                id="reject-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="ระบุข้อบกพร่องที่ต้องปรับปรุงแก้ไขก่อนเผยแพร่..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setRejectDialogItem(null)} disabled={isPending}>
            {t("news.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => rejectDialogItem && handleChangeStatus(rejectDialogItem, "DRAFT", rejectionReason)}
            disabled={isPending}
          >
            {t("news.reject")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog ยืนยันการลบ */}
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteConfirmItem(null)}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("news.delete")}
          description={deleteConfirmItem?.titleTh}
        />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("news.deleteConfirm")}</p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmItem(null)} disabled={isPending}>
            {t("news.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            disabled={isPending}
          >
            {t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
