export interface AttendanceStudentItem {
  studentCode: string;
  studentName: string;
  yearLevel?: number | null;
  major?: string | null;
}

export function parseClassStudents(topicOrDesc?: string | null): AttendanceStudentItem[] {
  if (!topicOrDesc) return [];
  const marker = "<!-- STUDENTS:";
  const idx = topicOrDesc.indexOf(marker);
  if (idx === -1) return [];
  const endIdx = topicOrDesc.indexOf(" -->", idx);
  if (endIdx === -1) return [];
  try {
    const json = topicOrDesc.substring(idx + marker.length, endIdx);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function injectClassStudents(baseText: string, students: AttendanceStudentItem[]): string {
  const clean = baseText.replace(/<!-- STUDENTS:.*? -->/g, "").trim();
  const marker = `<!-- STUDENTS:${JSON.stringify(students)} -->`;
  return clean ? `${clean}\n\n${marker}` : marker;
}
