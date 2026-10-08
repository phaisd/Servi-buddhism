# Task Tracking & Quality Gates
## Feature: ระบบบริการออกหนังสือรับรอง (Certificates)

### Progress Tracking
| Phase | Task Description | Status | Note / Commit |
|-------|------------------|--------|---------------|
| 1     | Database Models & Enums | ✅ Done | |
| 1     | Feature Folder & i18n / Permissions | ✅ Done | |
| 2     | Validations & Unit Tests | ✅ Done | |
| 2     | Core Services (CRUD & Audit) | ✅ Done | |
| 3     | Server Actions | ✅ Done | |
| 4     | Admin UI (Master Data & Requests) | ✅ Done | |
| 4     | Portal UI (My Requests & Form) | ✅ Done | |
| 5     | Seed Data | ✅ Done | |
| 5     | Run `npm run check` | ✅ Done | |

### Quality Gates Checklist (`npm run check`)
- [ ] **Type Check** (`tsc --noEmit`): ไม่มี error จาก TypeScript
- [ ] **Linter** (`eslint`): โค้ดตรงตามมาตรฐานการเขียน
- [ ] **Dependency Cruiser** (`depcruise`): ไม่มีการ import ข้าม `_internal` ของ module อื่นอย่างผิดกฎ
- [ ] **Unit Tests** (`vitest`): Test case ของ i18n, Validations, และ Services ทำงานถูกต้องและครอบคลุม
- [ ] **Integration Tests**: มั่นใจว่าไม่ได้ทำลายระบบอื่นๆ ของโปรเจกต์
