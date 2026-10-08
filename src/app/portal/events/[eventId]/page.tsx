import { resolvePublicTenantId } from "@/features/news/server";
import { getEventById } from "@/features/events/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { getSessionContext } from "@/features/identity/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function PublicEventDetailPage({ params }: PageProps) {
  const { eventId } = await params;
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  const session = await getSessionContext();
  
  const event = await getEventById(tenantId, eventId);
  if (!event) notFound();

  return (
    <div className="space-y-10 max-w-3xl mx-auto py-12 px-4">
      <div>
        <Link href="/portal/events" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          &larr; Back to Events
        </Link>
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <div className="p-6 border rounded-xl bg-card">
          <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          <div className="mt-8 pt-6 border-t">
            {session ? (
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium">
                {locale === "th" ? "ลงทะเบียนเข้าร่วม" : "Register Now"}
              </button>
            ) : (
              <p className="text-muted-foreground">
                {locale === "th" ? "กรุณาเข้าสู่ระบบเพื่อลงทะเบียน" : "Please login to register."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
