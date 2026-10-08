import { z } from "zod";

export const createCertificateRequestSchema = z.object({
  certificateTypeId: z.string().min(1, "Required"),
  note: z.string().optional(),
});

export const reviewCertificateRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
  issuedDocumentUrl: z.string().url().optional().or(z.literal("")),
}).refine(data => {
  if (data.status === "REJECTED" && !data.reason) {
    return false;
  }
  return true;
}, {
  message: "Reason is required when rejected",
  path: ["reason"]
});

export const createCertificateTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateCertificateTypeSchema = createCertificateTypeSchema.partial();
