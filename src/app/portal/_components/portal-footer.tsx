import Link from "next/link";
import { resolveTenantSettings } from "@/features/identity/server";
import { getLocale } from "@/shared/lib/i18n/server";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Globe,
  GraduationCap,
} from "lucide-react";

export async function PortalFooter() {
  const [settings, locale] = await Promise.all([
    resolveTenantSettings(),
    getLocale(),
  ]);

  const brandName =
    locale === "th"
      ? settings?.nameTh || "คณะพุทธศาสตร์"
      : settings?.nameEn || "Faculty of Buddhism";

  const brandTagline =
    locale === "th"
      ? "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)"
      : "Mahachulalongkornrajavidyalaya University (MCU)";

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full border-t border-white/10">
      {/* Upper Grid (Liyon .foot-in) */}
      <div className="foot-in">
        {/* Column 1: Brand & About */}
        <div>
          <Link href="/portal" className="brand inline-flex items-center gap-3">
            <i className="overflow-hidden">
              {settings?.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="h-full w-full object-contain p-0.5 rounded-[inherit]"
                />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
            </i>
            <span className="font-bold tracking-tight text-base sm:text-lg">
              {brandName}
            </span>
          </Link>

          <p className="foot-tag text-sm leading-relaxed">
            {locale === "th"
              ? "ศูนย์กลางการศึกษาพระพุทธศาสนาระดับอุดมศึกษา มุ่งผลิตบัณฑิตให้มีปฏิปทาน่าเลื่อมใส ใฝ่รู้ใฝ่คิด มีความเป็นผู้นำทางจิตใจและปัญญา บูรณาการพุทธธรรมกับศาสตร์สมัยใหม่ เพื่อประโยชน์สุขของสังคม"
              : "Center of Buddhist Higher Education, integrating Dhamma principles with modern sciences to cultivate ethical leadership and global wisdom."}
          </p>

          <div className="mt-5 space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 opacity-70 mt-0.5" />
              <span>
                {locale === "th"
                  ? "79 หมู่ 1 ถนนพหลโยธิน กม. 55 ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170"
                  : "79 Moo 1, Phahonyothin Rd., Lamsai, Wang Noi, Phra Nakhon Si Ayutthaya 13170, Thailand"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 opacity-70" />
              <span>035-248-000 ต่อ 8100-8104</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 opacity-70" />
              <span>buddhist@mcu.ac.th</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links / เมนูลัด */}
        <div>
          <h4>{locale === "th" ? "เมนูลัด & บริการนิสิต" : "QUICK LINKS & SERVICES"}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/portal/news" className="transition-colors hover:underline">
                {locale === "th" ? "ข่าวสารและประกาศ" : "News & Announcements"}
              </Link>
            </li>
            <li>
              <Link href="/portal/programs" className="transition-colors hover:underline">
                {locale === "th" ? "หลักสูตรการศึกษา" : "Academic Programs"}
              </Link>
            </li>
            <li>
              <Link href="/portal/personnel" className="transition-colors hover:underline">
                {locale === "th" ? "คณาจารย์และบุคลากร" : "Faculty & Staff"}
              </Link>
            </li>
            <li>
              <Link href="/portal/events" className="transition-colors hover:underline">
                {locale === "th" ? "กิจกรรมและปฏิทิน" : "Events & Calendar"}
              </Link>
            </li>
            <li>
              <Link href="/portal/documents" className="transition-colors hover:underline">
                {locale === "th" ? "ดาวน์โหลดเอกสาร / แบบฟอร์ม" : "Downloads & Forms"}
              </Link>
            </li>
            <li>
              <Link href="/portal/certificates/request" className="transition-colors hover:underline">
                {locale === "th" ? "ยื่นขอหนังสือรับรอง / คำร้อง" : "Certificate Requests"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: ระบบบริการ & ระบบจัดการ */}
        <div>
          <h4>{locale === "th" ? "ระบบสารสนเทศองค์กร" : "INFORMATION SYSTEMS"}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/portal/meetings" className="transition-colors hover:underline">
                {locale === "th" ? "ระบบจองห้องประชุมออนไลน์" : "Online Room Booking"}
              </Link>
            </li>
            <li>
              <Link href="/portal/attendance" className="transition-colors hover:underline">
                {locale === "th" ? "ระบบเช็คชื่อและประเมินผล" : "Attendance & Evaluation"}
              </Link>
            </li>
            <li>
              <a
                href="https://www.mcu.ac.th"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:underline"
              >
                <Globe className="h-3.5 w-3.5 opacity-80" />
                <span>{locale === "th" ? "เว็บไซต์หลัก มหาวิทยาลัย มจร" : "MCU Main Website"}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </li>
            <li className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{locale === "th" ? "ระบบบริหารจัดการ (Staff Console)" : "Staff Console (Admin)"}</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar (Liyon .foot-bottom) */}
      <div className="foot-bottom">
        <div className="foot-bottom-in">
          <div>
            © {currentYear} {brandName} · {brandTagline}. {locale === "th" ? "สงวนลิขสิทธิ์ทั้งหมด" : "All rights reserved."}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/portal/news" className="hover:underline">
              {locale === "th" ? "ข่าวประชาสัมพันธ์" : "News"}
            </Link>
            <span>·</span>
            <Link href="/portal/documents" className="hover:underline">
              {locale === "th" ? "เอกสารเผยแพร่" : "Documents"}
            </Link>
            <span>·</span>
            <Link href="/login" className="hover:underline">
              {locale === "th" ? "สำหรับเจ้าหน้าที่" : "Staff Login"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
