<#
.SYNOPSIS
  สำรองข้อมูลฐานข้อมูล PostgreSQL Production (Docker Container vibe_db)
.DESCRIPTION
  สคริปต์นี้จะสั่ง pg_dump ภายใน vibe_db container และดึงไฟล์สำรองมาเก็บไว้ในโฟลเดอร์ backups/
#>

$ErrorActionPreference = "Stop"

$BackupDir = Join-Path $PSScriptRoot "..\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$FileName = "vibe_production_$Timestamp.sql"
$LocalBackupPath = Join-Path $BackupDir $FileName

Write-Host "==> เริ่มต้นการสำรองข้อมูลฐานข้อมูล Production..." -ForegroundColor Cyan

# ตรวจสอบว่า Container กำลังทำงานอยู่หรือไม่
$containerRunning = docker ps --filter "name=vibe_db" --filter "status=running" -q
if (-not $containerRunning) {
    Write-Error "ไม่พบคอนเทนเนอร์ vibe_db หรือคอนเทนเนอร์ไม่ได้รันอยู่ กรุณาเริ่ม container ด้วย docker compose ก่อน"
}

# รัน pg_dump และบันทึกลงไฟล์
cmd /c "docker exec vibe_db pg_dump -U vibe_admin vibe_production > `"$LocalBackupPath`""

if (Test-Path $LocalBackupPath) {
    $fileSize = (Get-Item $LocalBackupPath).Length / 1KB
    Write-Host "✅ สำรองข้อมูลสำเร็จ!" -ForegroundColor Green
    Write-Host "📁 บันทึกไว้ที่: $LocalBackupPath ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Error "เกิดข้อผิดพลาด: ไม่พบไฟล์สำรองข้อมูลหลังรันคำสั่ง"
}
