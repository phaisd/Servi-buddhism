import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicMeetingRooms, getUpcomingBookings } from "@/features/meetings/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { getSessionContext } from "@/features/identity/server";
import { Calendar, Users, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default async function PublicMeetingsPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  const session = await getSessionContext();
  
  const rooms = await getPublicMeetingRooms(tenantId);
  const bookings = await getUpcomingBookings(tenantId);

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <Calendar className="h-3.5 w-3.5" />
            {locale === "th" ? "จองห้องประชุม" : "Meeting Rooms"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {locale === "th" ? "รายการห้องประชุม" : "Available Rooms"}
          </h1>
        </div>
        
        {session ? (
          <Link href="/portal/meetings/book" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2">
            {locale === "th" ? "จองห้องประชุม" : "Book a Room"}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-md">
            {locale === "th" ? "เข้าสู่ระบบเพื่อจองห้องประชุม" : "Log in to book a room"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card hover:shadow-md transition-all">
            {room.imageUrl && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img src={room.imageUrl} alt={room.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-foreground mb-4">{room.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {locale === "th" ? `รองรับ ${room.capacity} ที่นั่ง` : `Capacity: ${room.capacity}`}
                </div>
                {room.equipment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {room.equipment}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          {locale === "th" ? "ตารางการใช้ห้อง (กำลังจะมาถึง)" : "Upcoming Schedule"}
        </h2>
        {bookings.length > 0 ? (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-medium">{locale === "th" ? "เวลา" : "Time"}</th>
                  <th className="p-4 font-medium">{locale === "th" ? "ห้องประชุม" : "Room"}</th>
                  <th className="p-4 font-medium">{locale === "th" ? "หัวข้อการประชุม" : "Topic"}</th>
                  <th className="p-4 font-medium">{locale === "th" ? "ผู้จอง" : "Requester"}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Clock className="h-4 w-4" />
                        {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(b.startTime))}
                        <span className="text-muted-foreground font-normal ml-1">
                          {new Intl.DateTimeFormat("en-GB", { timeStyle: "short" }).format(new Date(b.startTime))} - {new Intl.DateTimeFormat("en-GB", { timeStyle: "short" }).format(new Date(b.endTime))}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{b.room.name}</td>
                    <td className="p-4">{b.title}</td>
                    <td className="p-4 text-muted-foreground">{b.requester.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground border rounded-xl bg-muted/20">
            {locale === "th" ? "ยังไม่มีการจองที่ได้รับการอนุมัติ" : "No upcoming approved bookings."}
          </div>
        )}
      </div>
    </div>
  );
}
