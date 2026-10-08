import { getLocale } from "@/shared/lib/i18n/server";
import { getSessionContext } from "@/features/identity/server";
import { redirect } from "next/navigation";

export default async function BookMeetingPage() {
  const session = await getSessionContext();
  if (!session) {
    redirect("/portal/meetings");
  }
  const locale = await getLocale();

  return (
    <div className="space-y-10 max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold">
        {locale === "th" ? "แบบฟอร์มจองห้องประชุม" : "Book a Meeting Room"}
      </h1>
      <div className="p-6 border rounded-xl bg-card text-muted-foreground">
        <p>Form implementation goes here... (This is a placeholder for the booking form)</p>
      </div>
    </div>
  );
}
