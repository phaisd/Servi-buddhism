<#
.SYNOPSIS
  กู้คืนฐานข้อมูล PostgreSQL Production (Docker Container vibe_db)
.PARAMETER BackupFile
  ระบุพาธไฟล์ .sql ที่ต้องการกู้คืน (หากไม่ระบุ จะใช้ไฟล์ล่าสุดใน backups/)
#>
param(
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

$BackupDir = Join-Path $PSScriptRoot "..\backups"

if (-not $BackupFile) {
    $latestBackup = Get-ChildItem -Path $BackupDir -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latestBackup) {
        Write-Error "ไม่พบไฟล์สำรองใน $BackupDir กรุณาระบุ -BackupFile"
    }
    $BackupFile = $latestBackup.FullName
}

if (-not (Test-Path $BackupFile)) {
    Write-Error "ไม่พบไฟล์: $BackupFile"
}

Write-Host "==> กำลังกู้คืนฐานข้อมูลจาก: $BackupFile" -ForegroundColor Cyan

# ตรวจสอบคอนเทนเนอร์ vibe_db
$containerRunning = docker ps --filter "name=vibe_db" --filter "status=running" -q
if (-not $containerRunning) {
    Write-Error "ไม่พบคอนเทนเนอร์ vibe_db หรือคอนเทนเนอร์ไม่ได้รันอยู่"
}

# รัน psql กู้คืนฐานข้อมูล
cmd /c "type `"$BackupFile`" | docker exec -i vibe_db psql -U vibe_admin -d vibe_production"

Write-Host "✅ กู้คืนฐานข้อมูล Production สำเร็จเรียบร้อยแล้ว!" -ForegroundColor Green
