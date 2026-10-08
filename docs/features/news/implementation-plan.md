# Step-by-step Implementation Plan: News Feature

## Phase 1: Database & Foundation
- [x] 1.1 Update `prisma/schema.prisma` with `NewsArticle` and `NewsAttachment` models.
- [x] 1.2 Run `npx prisma migrate dev --name add_news_feature` and `npx prisma generate`.
- [x] 1.3 Add permission constants (`news:read`, `news:write`, `news:approve`, `news:manage`) to `src/permissions.ts`.
- [x] 1.4 Create `src/i18n/messages/news.ts` with required TH/EN keys.
- [x] 1.5 Register translations in `src/i18n/index.ts`.

## Phase 2: Core Logic (Services & Validations)
- [x] 2.1 Create `src/features/news/_internal/validations.ts` for Zod schemas.
- [x] 2.2 Create `src/features/news/_internal/services.ts`.
  - [x] Implement `listNews(tenantId, filters)`
  - [x] Implement `getNewsById(tenantId, id)`
  - [x] Implement `getNewsBySlug(tenantId, slug)` (for Portal view)
  - [x] Implement `createNews(tenantId, data, authorId)` (generates slug)
  - [x] Implement `updateNews(tenantId, id, data)`
  - [x] Implement `submitNewsForReview(tenantId, id)`
  - [x] Implement `reviewNews(tenantId, id, status, reason, reviewerId)`
  - [x] Implement `incrementViewCount(tenantId, id)`
- [x] 2.3 Create `src/features/news/server.ts` to export public interfaces.

## Phase 3: Server Actions
- [x] 3.1 Create `src/features/news/_internal/actions.ts`.
- [x] 3.2 Implement `createNewsAction` wrapped with `requirePermission(news:write)`.
- [x] 3.3 Implement `updateNewsAction` wrapped with `requirePermission(news:write)`.
- [x] 3.4 Implement `submitNewsAction` wrapped with `requirePermission(news:write)`.
- [x] 3.5 Implement `reviewNewsAction` wrapped with `requirePermission(news:approve)`.
- [x] 3.6 Implement `deleteNewsAction` wrapped with `requirePermission(news:manage)`.

## Phase 4: Admin UI
- [x] 4.1 Create `src/app/(admin)/news/page.tsx` (Data Table listing with Status/Category filters).
- [x] 4.2 Create `src/app/(admin)/news/create/page.tsx` (Create Form).
- [x] 4.3 Create `src/app/(admin)/news/[id]/page.tsx` (Edit Form / Review Form based on permissions).
- [x] 4.4 Add News to Sidebar in `src/components/layout/sidebar-nav.ts`.

## Phase 5: Portal UI
- [x] 5.1 Create `src/app/portal/news/page.tsx` (Public grid listing of `PUBLISHED` news with search/filters).
- [x] 5.2 Create `src/app/portal/news/[slug]/page.tsx` (Public read page with Cover Image, Date, Views, Content).
- [x] 5.3 Add `incrementViewCount` logic in `[slug]/page.tsx` (debounced or triggered on load).

## Phase 6: QA & Testing
- [x] 6.1 Add Seed data in `prisma/seed.ts`.
- [x] 6.2 Run `npm run check` to ensure Type, Lint, and Tests pass.
