"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import fs from "node:fs/promises";
import path from "node:path";
import { errors } from "@/shared/lib/errors";
import { updateSettingsSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
    revalidatePath("/portal", "layout");
    revalidatePath("/(admin)", "layout");
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");
    if (!file || !(file instanceof File) || file.size === 0) {
      throw errors.validation("No file provided", { file: ["กรุณาเลือกไฟล์รูปภาพ"] });
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      throw errors.validation("Invalid file type", { file: ["รองรับเฉพาะไฟล์ PNG, JPEG, WebP และ SVG เท่านั้น"] });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw errors.validation("File too large", { file: ["ขนาดไฟล์ต้องไม่เกิน 5MB"] });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const ext = ["png", "jpg", "jpeg", "webp", "svg"].includes(rawExt) ? rawExt : "png";
    const filename = `logo-${ctx.tenantId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return { url: `/uploads/${filename}` };
  });
}
