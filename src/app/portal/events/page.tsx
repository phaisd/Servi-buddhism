import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicEvents } from "@/features/events/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

export default async function PublicEventsPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  
  const events = await getPublicEvents(tenantId);

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Calendar className="h-3.5 w-3.5" />
          {locale === "th" ? "กิจกรรม" : "Events"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {locale === "th" ? "กิจกรรมที่กำลังจะจัดขึ้น" : "Upcoming Events"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card hover:shadow-md transition-all">
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-foreground mb-4">{event.title}</h3>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(event.startDate))}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
                {event.capacity > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Limit: {event.capacity} seats
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t">
                <Link href={`/portal/events/${event.id}`} className="text-primary text-sm font-medium hover:underline">
                  View Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground border rounded-xl bg-muted/20">
            {locale === "th" ? "ยังไม่มีกิจกรรมในเร็ว ๆ นี้" : "No upcoming events."}
          </div>
        )}
      </div>
    </div>
  );
}
