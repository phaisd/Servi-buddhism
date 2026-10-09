"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, KeyRound, ExternalLink, Send, Eye, EyeOff, ShieldCheck, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSwitchRow } from "@/shared/components/liyon";
import { cn } from "@/shared/lib/utils";
import type { SmtpSettings } from "@/features/identity";
import { testSmtpAction } from "@/features/identity/actions";

interface SmtpSettingsTabProps {
  smtp: SmtpSettings;
  errors: Record<string, string[]>;
  onChange: (patch: SmtpSettings) => void;
}

export function SmtpSettingsTab({ smtp, errors, onChange }: SmtpSettingsTabProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, startTesting] = useTransition();

  const isGmail = smtp.service === "gmail";

  function updateField<K extends keyof SmtpSettings>(key: K, value: SmtpSettings[K]) {
    onChange({
      ...smtp,
      [key]: value,
    });
  }

  function handleTestConnection() {
    if (!smtp.user) {
      toast.error(isGmail ? "กรุณาระบุอีเมล Gmail ของท่าน" : "กรุณาระบุชื่อผู้ใช้ (Username)");
      return;
    }
    if (!smtp.pass) {
      toast.error(isGmail ? "กรุณาระบุรหัสผ่านสำหรับแอป (App Password)" : "กรุณาระบุรหัสผ่าน (Password)");
      return;
    }
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("กรุณาระบุอีเมลปลายทางสำหรับทดสอบที่ถูกต้อง");
      return;
    }

    startTesting(async () => {
      const res = await testSmtpAction({
        smtp,
        testEmail,
      });

      if (!res.ok) {
        const errorMsg =
          (res.error.fieldErrors && Object.values(res.error.fieldErrors).flat()[0]) ||
          res.error.message ||
          "เชื่อมต่อ SMTP ไม่สำเร็จ";
        toast.error(errorMsg, { duration: 8000 });
        return;
      }

      toast.success(res.data.message, { duration: 6000 });
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. เปิด/ปิดการใช้งานและเลือกบริการ */}
      <LiyonCard>
        <h2>ระบบส่งอีเมลผ่านเซิร์ฟเวอร์ (SMTP Gateway)</h2>
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          ตั้งค่าเชื่อมต่อเซิร์ฟเวอร์อีเมลสำหรับการแจ้งเตือน รีเซ็ตรหัสผ่าน และคำร้องต่างๆ
        </p>
        <div className="space-y-5">
          <LiyonSwitchRow
            id="smtp-enabled"
            checked={smtp.enabled}
            onCheckedChange={(checked) => updateField("enabled", checked)}
            label="เปิดใช้งานระบบส่งอีเมล (Enable SMTP)"
            description="เมื่อเปิดใช้งาน ระบบจะส่งอีเมลแจ้งเตือนผู้ใช้งานผ่านบัญชีที่กำหนดไว้"
          />

          {smtp.enabled && (
            <div className="pt-3 border-t border-[var(--glass-border)]">
              <label className="text-sm font-semibold mb-2 block text-[var(--text)]">
                ผู้ให้บริการอีเมล (Service Provider)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...smtp,
                      service: "gmail",
                      host: "smtp.gmail.com",
                      port: 465,
                      secure: true,
                    });
                  }}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer",
                    isGmail
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-[var(--glass-border)] bg-[var(--panel)]/40 hover:bg-[var(--panel)]"
                  )}
                >
                  <Mail className={cn("w-5 h-5 shrink-0 mt-0.5", isGmail ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">Gmail / Google Workspace</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      smtp.gmail.com (SSL พอร์ต 465 / รหัสผ่านแอป)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...smtp,
                      service: "custom",
                      host: smtp.host || "smtp.gmail.com",
                      port: smtp.port || 465,
                      secure: smtp.secure ?? true,
                    });
                  }}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer",
                    !isGmail
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-[var(--glass-border)] bg-[var(--panel)]/40 hover:bg-[var(--panel)]"
                  )}
                >
                  <Server className={cn("w-5 h-5 shrink-0 mt-0.5", !isGmail ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">เซิร์ฟเวอร์กำหนดเอง (Custom SMTP)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      เซิร์ฟเวอร์มหาวิทยาลัย หรือ Mail Server ภายในองค์กร
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </LiyonCard>

      {smtp.enabled && (
        <>
          {/* แนะนำวิธีทำ App Password สำหรับ Gmail */}
          {isGmail && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    คำแนะนำสำหรับการใช้งาน Gmail SMTP:
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    Google ไม่อนุญาตให้ใช้รหัสผ่านบัญชีจริงในการเชื่อมต่อ ท่านจำเป็นต้องใช้ <strong>รหัสผ่านสำหรับแอป (App Password)</strong> 16 ตัวอักษร โดยมีขั้นตอนดังนี้:
                  </p>
                  <ol className="list-decimal list-inside text-xs space-y-1 pl-1 opacity-90">
                    <li>เปิดใช้งานการยืนยันแบบ 2 ขั้นตอน (2-Step Verification) ในบัญชี Google</li>
                    <li>
                      ไปที่หน้า{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="underline inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950"
                      >
                        Google App Passwords <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>ตั้งชื่อแอปพลิเคชัน เช่น <code>MCU Buddhist Portal</code> แล้วกดสร้าง</li>
                    <li>คัดลอกรหัสผ่าน 16 หลัก (เช่น <code>abcd efgh ijkl mnop</code>) มาวางในช่องด้านล่าง</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ฟอร์มการตั้งค่า SMTP */}
          <LiyonCard>
            <h2>{isGmail ? "ข้อมูลบัญชี Gmail" : "การตั้งค่าการเชื่อมต่อ Custom SMTP"}</h2>
            <p className="text-sm text-muted-foreground -mt-2 mb-4">
              ระบุรายละเอียดบัญชีและข้อมูลสำหรับเชื่อมต่อเซิร์ฟเวอร์ส่งอีเมล
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField
                label={isGmail ? "อีเมล Gmail ผู้ส่ง (Gmail Address)" : "ชื่อผู้ใช้งาน (SMTP Username)"}
                htmlFor="smtp-user"
                hint={isGmail ? "เช่น example@gmail.com หรือ buddhist.mcu@gmail.com" : undefined}
                error={errors["smtp.user"]?.[0]}
              >
                <div className="relative">
                  <input
                    id="smtp-user"
                    type="email"
                    value={smtp.user}
                    onChange={(e) => updateField("user", e.target.value)}
                    placeholder={isGmail ? "your-email@gmail.com" : "username หรือ email"}
                    className="w-full"
                    required
                  />
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                </div>
              </LiyonField>

              <LiyonField
                label={isGmail ? "รหัสผ่านสำหรับแอป (Google App Password 16 หลัก)" : "รหัสผ่าน (SMTP Password)"}
                htmlFor="smtp-pass"
                hint={isGmail ? "รหัสผ่านแอป 16 หลักจาก Google Security" : undefined}
                error={errors["smtp.pass"]?.[0]}
              >
                <div className="relative">
                  <input
                    id="smtp-pass"
                    type={showPassword ? "text" : "password"}
                    value={smtp.pass}
                    onChange={(e) => updateField("pass", e.target.value)}
                    placeholder={isGmail ? "xxxx xxxx xxxx xxxx" : "••••••••••••"}
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </LiyonField>

              <LiyonField
                label="ชื่อผู้ส่งที่แสดง (Sender Display Name)"
                htmlFor="smtp-from-name"
                hint="ชื่อองค์กรหรือระบบที่ผู้รับจะเห็นในช่อง From"
              >
                <input
                  id="smtp-from-name"
                  type="text"
                  value={smtp.fromName}
                  onChange={(e) => updateField("fromName", e.target.value)}
                  placeholder="เช่น คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                />
              </LiyonField>

              <LiyonField
                label="อีเมลที่แสดงในช่องส่ง (From Email)"
                htmlFor="smtp-from-email"
                hint="หากเว้นว่างจะใช้อีเมลเดียวกับที่ระบุด้านบน"
              >
                <input
                  id="smtp-from-email"
                  type="email"
                  value={smtp.fromEmail}
                  onChange={(e) => updateField("fromEmail", e.target.value)}
                  placeholder={smtp.user || "no-reply@buddhist.mcu.ac.th"}
                />
              </LiyonField>

              {/* ส่วนเพิ่มเติมหากเป็น Custom SMTP หรือต้องการตั้งค่าพอร์ต */}
              {!isGmail ? (
                <>
                  <LiyonField label="SMTP Host" htmlFor="smtp-host">
                    <input
                      id="smtp-host"
                      type="text"
                      value={smtp.host}
                      onChange={(e) => updateField("host", e.target.value)}
                      placeholder="เช่น smtp.gmail.com หรือ mail.mcu.ac.th"
                    />
                  </LiyonField>

                  <div className="grid grid-cols-2 gap-3">
                    <LiyonField label="Port" htmlFor="smtp-port">
                      <input
                        id="smtp-port"
                        type="number"
                        value={smtp.port}
                        onChange={(e) => updateField("port", Number(e.target.value))}
                        placeholder="587 หรือ 465"
                      />
                    </LiyonField>
                    <div className="flex flex-col justify-center pt-5">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtp.secure}
                          onChange={(e) => updateField("secure", e.target.checked)}
                          className="rounded border-[var(--glass-border)]"
                        />
                        <span>Secure (SSL)</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 pt-2">
                  <div className="flex items-center gap-6 text-xs text-muted-foreground bg-[var(--panel)]/40 p-3 rounded-lg border border-[var(--glass-border)]">
                    <div>
                      <strong>เซิร์ฟเวอร์:</strong> smtp.gmail.com
                    </div>
                    <div>
                      <strong>พอร์ต:</strong> 465 (SSL / TLS เข้ารหัสปลอดภัย)
                    </div>
                    <div>
                      <strong>การรับรองความถูกต้อง:</strong> App Passwords
                    </div>
                  </div>
                </div>
              )}
            </div>
          </LiyonCard>

          <LiyonCard>
            <h2>ทดสอบการเชื่อมต่อและส่งอีเมล (Test SMTP Delivery)</h2>
            <p className="text-sm text-muted-foreground -mt-2 mb-4">
              ทดสอบว่าระบบสามารถเชื่อมต่อกับ Gmail SMTP และส่งอีเมลถึงผู้รับได้จริง
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full flex-1">
                  <LiyonField
                    label="ส่งอีเมลทดสอบไปยัง (Recipient Test Email)"
                    htmlFor="test-email"
                    hint="ระบุอีเมลของท่านเพื่อรับอีเมลทดสอบ"
                  >
                    <input
                      id="test-email"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your-personal@email.com"
                    />
                  </LiyonField>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || !smtp.user || !smtp.pass || !testEmail}
                  className="h-10 px-4 shrink-0 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Send className={cn("w-4 h-4", isTesting && "animate-pulse")} />
                  {isTesting ? "กำลังทดสอบและส่งอีเมล..." : "ทดสอบส่งอีเมลทันที"}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  หลังจากทดสอบสำเร็จ อย่าลืมกดปุ่ม <strong>&quot;บันทึกการตั้งค่า&quot;</strong> ด้านล่างของหน้าจอเพื่อบันทึกการตั้งค่าลงระบบ
                </span>
              </div>
            </div>
          </LiyonCard>
        </>
      )}
    </div>
  );
}
