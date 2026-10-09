# 📖 คู่มือการดูแลและบริหารจัดการ Production บน Docker Desktop
*(Vibe Framework & Buddhist Portal Production Runbook)*

---

## 🏛️ สถาปัตยกรรมระบบ Production (System Architecture)

```
[ Client / Browser ] 
        │
        ▼  Port 3000 (HTTP)
┌────────────────────────────────────────────────────────┐
│  Docker Bridge Network (vibe_network)                 │
│                                                        │
│  ┌────────────────────────┐    ┌────────────────────┐  │
│  │    vibe_portal_app     │───▶│      vibe_db       │  │
│  │   Next.js Standalone   │    │   PostgreSQL 16    │  │
│  │ (Non-Root User UID 1001)│   │  (Alpine Linux)    │  │
│  └────────────────────────┘    └─────────┬──────────┘  │
│                                          │             │
└──────────────────────────────────────────┼─────────────┘
                                           ▼
                                 [ Volume: postgres_data ]
                                  (เก็บข้อมูลจริงถาวร)
```

---

## 🚀 คำสั่งควบคุมระบบ (Operational Commands)

ทุกคำสั่งให้รันจากโฟลเดอร์หลักของโปรเจกต์ (`f:\FB-service\vibe-framework`):

### 1. เริ่มต้นการทำงาน (Start Stack)
```powershell
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 2. ตรวจสอบสถานะการทำงาน (Check Health Status)
```powershell
docker ps
```
*สถานะปกติของทั้ง 2 คอนเทนเนอร์ต้องแสดงเป็น `Up ... (healthy)`*

### 3. ดูบันทึกการทำงานแบบ Real-time (View Logs)
```powershell
# ดู Log ของเว็บแอปพลิเคชัน
docker logs -f vibe_portal_app

# ดู Log ของฐานข้อมูล
docker logs -f vibe_db
```

### 4. รีสตาร์ตระบบ (Restart)
```powershell
docker compose -f docker-compose.prod.yml restart
```

### 5. หยุดการทำงาน (Stop Stack)
```powershell
docker compose -f docker-compose.prod.yml down
```
*(ข้อมูลฐานข้อมูลใน Docker Volume `postgres_data` จะไม่สูญหาย)*

---

## 🔑 บัญชีผู้ดูแลระบบเริ่มต้น (Default Super Admin Credentials)

- **หน้าเข้าสู่ระบบ:** [http://localhost:3000/login](http://localhost:3000/login)
- **อีเมล:** `admin@buddhist.mcu.ac.th`
- **รหัสผ่านเริ่มต้น:** `AdminMCU2026!Secure`
- **นโยบายความปลอดภัย:** ระบบจะนำท่านเข้าสู่หน้า `/change-password` ทันทีในการเข้าสู่ระบบครั้งแรก เพื่อบังคับตั้งรหัสผ่านใหม่ส่วนตัวที่ปลอดภัย

---

## 💾 การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)

### การสำรองข้อมูลอัตโนมัติ (Backup)
รันสคริปต์ PowerShell ที่เตรียมไว้:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-production-db.ps1
```
*ไฟล์ Dump จะถูกจัดเก็บไว้ที่โฟลเดอร์ `backups/vibe_production_YYYYMMDD_HHmmss.sql`*

### การกู้คืนข้อมูล (Restore)
```powershell
# กู้คืนจากไฟล์ล่าสุดในโฟลเดอร์ backups/ อัตโนมัติ:
powershell -ExecutionPolicy Bypass -File scripts/restore-production-db.ps1

# หรือระบุไฟล์ที่ต้องการกู้คืนแบบเจาะจง:
powershell -ExecutionPolicy Bypass -File scripts/restore-production-db.ps1 -BackupFile "backups/vibe_production_20261009_111603.sql"
```

---

## 🔄 ขั้นตอนการอัปเดตโค้ดเวอร์ชันใหม่ (Redeployment Workflow)

เมื่อมีการพัฒนาโค้ดใหม่หรือดึงการเปลี่ยนแปลงจาก Git สามารถ Build และ Restart เฉพาะเว็บแอปโดยไม่กระทบฐานข้อมูลได้ทันที:

```powershell
# 1. ดึงโค้ดล่าสุดจาก Git
git pull origin main

# 2. Rebuild เฉพาะ Web Application Container
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build app

# 3. ตรวจสอบสถานะ
docker ps
```

---

## 🛡️ มาตรการความปลอดภัยที่เปิดใช้งาน (Security Hardening Measures)

1. **Least Privilege (Non-Root User):** Container รันภายใต้บัญชี `nextjs` (UID 1001) ไม่สามารถแก้ไขไฟล์ระบบหรือเข้าถึง Root ได้
2. **Secrets Protection:** ไฟล์ `.env.production` และโฟลเดอร์สำรอง `backups/` ถูกกำหนดให้อยู่ใน `.gitignore` ไม่ถูกอัปโหลดขึ้น Git
3. **Database Network Isolation:** ฐานข้อมูลถูกกักให้อยู่ในเครือข่ายภายใน (`vibe_network`) และเปิดเฉพาะพอร์ต Local loopback สำหรับการดูแลระบบ
4. **Health Checking:** มีการตรวจวัดความสมบูรณ์ของ Service ทุกๆ 10 วินาที หากมีปัญหา Container จะแจ้งเตือนและระบบสามารถกู้คืนอัตโนมัติได้
