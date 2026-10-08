"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { submitRequestAction } from "@/features/certificates/actions";
import type { CertificateType } from "@/generated/prisma";

export function RequestFormClient({ types, locale }: { types: CertificateType[], locale: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      certificateTypeId: formData.get("certificateTypeId") as string,
      note: formData.get("note") as string,
    };

    try {
      await submitRequestAction(data);
      router.push("/portal/certificates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link href="/portal/certificates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === "th" ? "กลับไปหน้ารายการ" : "Back to list"}
      </Link>
      
      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-2">
          {locale === "th" ? "ยื่นคำร้องขอหนังสือรับรอง" : "Submit Certificate Request"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {locale === "th" 
            ? "กรุณาเลือกประเภทเอกสารและกรอกข้อมูลที่จำเป็น เจ้าหน้าที่จะดำเนินการตรวจสอบและอนุมัติต่อไป" 
            : "Please select the document type and provide necessary information. Staff will review and process your request."}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="certificateTypeId" className="block text-sm font-medium">
              {locale === "th" ? "ประเภทหนังสือรับรอง" : "Certificate Type"} <span className="text-red-500">*</span>
            </label>
            <select
              id="certificateTypeId"
              name="certificateTypeId"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">{locale === "th" ? "-- เลือกประเภทเอกสาร --" : "-- Select Type --"}</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium">
              {locale === "th" ? "หมายเหตุ / ข้อมูลเพิ่มเติม" : "Note / Additional Information"}
            </label>
            <textarea
              id="note"
              name="note"
              rows={4}
              placeholder={locale === "th" ? "เช่น วัตถุประสงค์ในการนำไปใช้" : "e.g., Purpose of the certificate"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/portal/certificates"
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
            >
              {locale === "th" ? "ยกเลิก" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {locale === "th" ? "ยืนยันการยื่นคำร้อง" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
