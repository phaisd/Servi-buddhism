# Production Security Hardening & Threat Mitigation Blueprint
**โครงการ:** เว็บไซต์คณะพุทธศาสตร์ (Faculty Web Platform) — `vibe-framework`

---

## 1. การวิเคราะห์ภัยคุกคาม (Threat Vectors Analysis)

### 1.1 Crypto Mining (Cryptojacking)
- **ช่องทางที่ผู้โจมตีมักใช้:**
  1. **Supply Chain Attack (npm dependencies):** แอบฝังโค้ดขุดเหรียญในแพ็กเกจ npm ยอดนิยม หรือ Dependency ที่ไม่น่าเชื่อถือ
  2. **Remote Code Execution (RCE) / Arbitrary Code Execution:** โจมตีผ่านจุดอัปโหลดไฟล์ที่ไม่มีการตรวจสอบนามสกุลและ MIME Type หรือไม่มีการ sandbox โพรเซส ทำให้สามารถรัน binary script บนเซิร์ฟเวอร์ได้
  3. **Exposed Docker / Kubernetes Daemon หรือ Redis / Database ที่ไม่มีรหัสผ่าน:** โดนสแกนบอทเจอและสั่งรัน container เพื่อขุดเหรียญ (เช่น XMRig)
- **มาตรการป้องกัน:**
  - สแกน Dependency สม่ำเสมอด้วย `npm audit` และล็อกเวอร์ชันที่ปลอดภัยใน `package-lock.json`
  - ทำงานในโหมด Container แบบ Non-Root User เสมอ ห้ามรัน Process ของ Node.js ด้วยสิทธิ์ `root`
  - ล็อกทรัพยากร CPU / Memory Limit ในระดับ Docker/K8s เพื่อป้องกันไม่ให้โปรเซสใดดึง CPU 100%

---

### 1.2 WannaCry, Ransomware & Data Destruction
- **ช่องทางที่ผู้โจมตีมักใช้:**
  1. **SMB / Network Vulnerabilities (พอร์ต 445, 139):** ช่องโหว่ดั้งเดิมของ WannaCry เกิดจาก SMBv1 (EternalBlue) ในระบบปฏิบัติการ Windows ที่ไม่อัปเดตแพตช์
  2. **Database Port Exposure (PostgreSQL Port 5432):** เปิดพอร์ตฐานข้อมูลสู่ Public Internet โดยไม่มี Firewall ทำให้โดน Brute-force หรือโจมตีด้วย Zero-day แล้วลบข้อมูลพร้อมเรียกค่าไถ่
  3. **Insecure Storage & Local Directory File Upload:** สคริปต์อันตรายถูกอัปโหลดขึ้นเซิร์ฟเวอร์แล้วสั่งเข้ารหัสไฟล์ในระบบ
- **มาตรการป้องกัน:**
  - **Network Isolation:** ฐานข้อมูล PostgreSQL **ต้องอยู่หลัง Private Subnet / VPC เท่านั้น** ห้ามเปิด Public IP หรือ Bind `0.0.0.0` สู่ภายนอก
  - **Firewall Policy (UFW/Security Group):** ปิดพอร์ต SMB (445, 139), RDP (3389) และเปิดเฉพาะพอร์ต 80, 443 (HTTP/HTTPS) และ 22 (SSH ผ่าน Key-only)
  - **Immutable Backups (กฎ 3-2-1):** ทำ Automated Backup ทุกวัน และส่งไปเก็บยัง Object Storage ภายนอกที่เปิดใช้งาน Object Lock (WORM - Write Once, Read Many) เพื่อให้ Ransomware ไม่สามารถตามไปลบหรือเข้ารหัสไฟล์ Backup ได้

---

## 2. สิ่งที่ได้รับการปรับปรุงในระบบแล้ว (Implemented Mitigations)

1. **Dependency Audit & Patches:**
   - ตรวจสอบความปลอดภัยของ npm packages และรัน `npm audit fix` แก้ไขช่องโหว่ High/Critical ในชุดไลบรารีที่เข้ากันได้
2. **Security Headers Hardening (`next.config.ts`):**
   - `X-Content-Type-Options: nosniff` (ป้องกัน MIME Confusion Attacks)
   - `X-Frame-Options: DENY` (ป้องกัน Clickjacking)
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (บังคับใช้ HTTPS เสมอ)
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
3. **Database Isolation & Tenant Protection:**
   - 100% ของ Prisma Queries ใน 8 ระบบหลักบังคับใช้ `tenantId` ป้องกันการข้ามสิทธิ์และข้อมูลรั่วไหล
4. **Automated Testing & Boundary Verification:**
   - ผ่านการทดสอบ 207 Automated Tests (150 Unit + 57 Integration) ครบถ้วน

---

## 3. รายการตรวจสอบก่อนนำขึ้น Production (Production Deployment Checklist)

- [ ] **1. สับเปลี่ยน Secrets และลบ Seed Users:**
  - เปลี่ยนค่า `AUTH_SECRET` ใน `.env` เป็นรหัสสุ่ม 32-bytes ใหม่
  - ลบหรือเปลี่ยนรหัสผ่านบัญชีเริ่มต้น (`admin@app.local`, `Passw0rd!vibe`)
- [ ] **2. Container Security (Docker):**
  - ใช้ `USER node` หรือ non-privileged user ภายใน Dockerfile
  - ตั้งค่า Read-only root filesystem หรือจำกัดโฟลเดอร์ที่เขียนได้เฉพาะ `/tmp`
- [ ] **3. Network & Firewall:**
  - ปิดพอร์ต 5432 บน Public Interface
  - ปิดบริการ SMB, NetBIOS ทั้งหมดบนโฮสต์เซิร์ฟเวอร์
- [ ] **4. Database Backup Strategy:**
  - ตั้งค่า Cron Job / Cloud Snapshot สำรองฐานข้อมูลแบบรายวัน
