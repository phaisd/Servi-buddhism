import { describe, it, expect } from "vitest";
import {
  createNewsArticleSchema,
  updateNewsArticleSchema,
  changeNewsStatusSchema,
  togglePinNewsSchema,
} from "./validations";

describe("news validations", () => {
  it("validate createNewsArticleSchema ผ่านเมื่อข้อมูลครบถ้วน", () => {
    const input = {
      titleTh: "ข่าวสัมมนาวิชาการพุทธศาสนา",
      slug: "buddhist-seminar-2026",
      category: "ACADEMIC",
      contentTh: "รายละเอียดการจัดสัมมนาวิชาการประจำปี 2569",
    };
    const result = createNewsArticleSchema.parse(input);
    expect(result.titleTh).toBe(input.titleTh);
    expect(result.slug).toBe("buddhist-seminar-2026");
    expect(result.category).toBe("ACADEMIC");
    expect(result.status).toBe("DRAFT");
    expect(result.isPinned).toBe(false);
  });

  it("validate createNewsArticleSchema ปฏิเสธ slug ที่มีอักขระพิเศษหรือเว้นวรรค", () => {
    expect(() =>
      createNewsArticleSchema.parse({
        titleTh: "ข่าวสารทดสอบ",
        slug: "invalid slug with spaces",
        contentTh: "เนื้อหาข่าวสารที่ยาวเกิน 5 ตัวอักษร",
      })
    ).toThrow();
  });

  it("validate updateNewsArticleSchema ต้องการ id รูปแบบ UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      titleTh: "แก้ไขหัวข้อข่าว",
      slug: "updated-news-slug",
      contentTh: "เนื้อหาข่าวสารที่แก้ไขใหม่",
    };
    expect(updateNewsArticleSchema.parse(valid).id).toBe(valid.id);

    expect(() =>
      updateNewsArticleSchema.parse({
        id: "invalid-uuid",
        titleTh: "หัวข้อข่าว",
        slug: "slug",
        contentTh: "เนื้อหา",
      })
    ).toThrow();
  });

  it("validate changeNewsStatusSchema และ togglePinNewsSchema", () => {
    const statusChange = changeNewsStatusSchema.parse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "PUBLISHED",
    });
    expect(statusChange.status).toBe("PUBLISHED");

    const pinChange = togglePinNewsSchema.parse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      isPinned: true,
      pinOrder: 1,
    });
    expect(pinChange.isPinned).toBe(true);
    expect(pinChange.pinOrder).toBe(1);
  });
});
