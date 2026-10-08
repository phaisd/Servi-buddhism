# AI Coding Instructions & Rules: News Feature

## 1. Scope Boundary
- **Do not modify files outside `src/features/news`** unless integrating navigation in `src/components/layout/sidebar-nav.ts`, adding permissions in `src/permissions.ts`, or registering messages in `src/i18n/index.ts`.
- Prisma Schema modifications are allowed only for the `NewsArticle` and `NewsAttachment` models and their related enums.

## 2. Technology Stack & Rules
- **Backend:** Next.js Server Actions with Zod validation. Always return `ActionResult<T>` using `ok()` or `fail()`.
- **Database:** Prisma ORM. Every table MUST have a `tenantId` field. Queries MUST always filter by `tenantId`. Use `requireSession()` or `getSessionContext()` to fetch `session.tenantId`.
- **UI Components:** Strict usage of `@/shared/components/liyon` (Liyon Design System).
  - Use `DataTable` for listings.
  - Use `AdminShell` for page layouts in `(admin)`.
  - Use `StatusPill` with standard tones: `"ok" | "warn" | "bad" | "info" | "off"`. DO NOT use `"draft"` or `"neutral"`.
- **i18n:** Hardcoded text is FORBIDDEN. All UI texts must use the translation dictionary.
  - Client components: `import { useT } from "@/shared/lib/i18n/client"`
  - Server components: `import { getT } from "@/shared/lib/i18n/server"`
  - Register keys in `src/i18n/messages/news.ts`.

## 3. Liyon Component Gotchas
- `StatusPill` component accepts only `tone` prop. `"draft"` is invalid. Map DRAFT to `"off"` or `"info"`.
- When using `next/image` in Portal, prefer standard `<img />` if it's dynamic user-uploaded content (cover image) to avoid Next.js image optimization configuration issues (unless domains are whitelisted in `next.config.ts`). A lint warning is acceptable for standard `<img>`.

## 4. Date Formatting
- DO NOT import `date-fns`. Use `formatDate(date, locale)` from `@/shared/lib/format`.

## 5. Session and Security
- Use `const session = await requireSession()` in Actions and Admin routes.
- Use `const session = await getSessionContext()` in Portal routes (non-blocking).
- Always use `session.userId` (not `session.user.id`).
- Check permissions using `requirePermission(session, P.newsRead)` in server actions.
