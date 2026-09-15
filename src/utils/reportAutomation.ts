import { InspectionGroup, InspectionRow, ReportData } from '../types';
import { DEFAULT_GROUPS, DEFAULT_MEMBERS, DEFAULT_RECOMMENDATIONS } from '../data/defaultData';

export interface AutomatedCreationResult {
  report: ReportData;
  transferredCount: number;
  prevMonth?: string;
  suggestedDocNum?: string;
}

/**
 * Parses "MM/YYYY" string and computes the subsequent month
 */
export function getNextMonthYear(monthYearStr?: string): {
  nextMonth: string; // e.g. "08/2026"
  monthNum: number;  // 8
  yearNum: number;   // 2026
  endDay: number;    // 31
  startDay: number;  // 29
} {
  let m = new Date().getMonth() + 1;
  let y = new Date().getFullYear();

  if (monthYearStr && monthYearStr.includes('/')) {
    const parts = monthYearStr.trim().split('/');
    const parsedM = parseInt(parts[0], 10);
    const parsedY = parseInt(parts[1], 10);
    if (!isNaN(parsedM) && !isNaN(parsedY)) {
      m = parsedM + 1;
      y = parsedY;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }

  const endDay = new Date(y, m, 0).getDate();
  const startDay = Math.max(1, endDay - 2);
  const nextMonth = `${String(m).padStart(2, '0')}/${y}`;

  return { nextMonth, monthNum: m, yearNum: y, endDay, startDay };
}

/**
 * Extracts the integer number from a document number string like "108", "108/VHIALY", "#95"
 */
export function suggestNextDocNumber(prevDocNum?: string): string {
  if (!prevDocNum) return '109';
  const match = prevDocNum.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (!isNaN(num)) {
      return String(num + 1);
    }
  }
  return '109';
}

/**
 * Scans a report to extract all unresolved issues / pending recommendations
 */
export function extractUnresolvedIssues(report: ReportData): Array<{
  originalIdx: string;
  content: string;
  recommendation: string;
  result: string;
}> {
  const issues: Array<{
    originalIdx: string;
    content: string;
    recommendation: string;
    result: string;
  }> = [];

  report.groups.forEach((group) => {
    group.rows.forEach((row) => {
      const rec = (row.recommendation || '').trim();
      const lowerRec = rec.toLowerCase();
      const isClean = 
        lowerRec === '' || 
        lowerRec.includes('không phát sinh kiến nghị') ||
        lowerRec.includes('không có kiến nghị') ||
        lowerRec.includes('đạt yêu cầu');

      const isMarkedIssue = 
        row.status === 'pending' || 
        row.status === 'in_progress' ||
        (!isClean && rec.length > 5);

      if (isMarkedIssue) {
        issues.push({
          originalIdx: row.idx,
          content: row.content || `Nội dung tại mục ${row.idx}`,
          recommendation: row.recommendation,
          result: row.result,
        });
      }
    });
  });

  return issues;
}

/**
 * Creates a new report for the next month with automatic issue rollover from previous month
 */
export function createAutomatedNewReport(
  latestReport?: ReportData,
  customOptions?: {
    customMonth?: string;
    customDocNum?: string;
    rolloverIssues?: boolean;
  }
): AutomatedCreationResult {
  const prevThangNam = latestReport?.thang_nam;
  const defaultNext = getNextMonthYear(prevThangNam);
  
  const targetMonth = customOptions?.customMonth?.trim() || defaultNext.nextMonth;
  let targetEndDay = defaultNext.endDay;
  let targetStartDay = defaultNext.startDay;

  if (targetMonth && targetMonth.includes('/')) {
    const parts = targetMonth.split('/');
    const pm = parseInt(parts[0], 10);
    const py = parseInt(parts[1], 10);
    if (!isNaN(pm) && !isNaN(py)) {
      targetEndDay = new Date(py, pm, 0).getDate();
      targetStartDay = Math.max(1, targetEndDay - 2);
    }
  }

  const suggestedDocNum = customOptions?.customDocNum?.trim() || suggestNextDocNumber(latestReport?.so_van_ban);
  const shouldRollover = customOptions?.rolloverIssues !== false;

  const startDayStr = String(targetStartDay).padStart(2, '0');
  const endDayStr = String(targetEndDay).padStart(2, '0');

  // Clone default groups
  const nextGroups: InspectionGroup[] = JSON.parse(JSON.stringify(DEFAULT_GROUPS));

  let transferredCount = 0;

  if (latestReport) {
    const unresolvedIssues = extractUnresolvedIssues(latestReport);
    
    // Find Group 7 (Thực hiện kiến nghị của các đoàn kiểm tra tháng trước)
    let group7 = nextGroups.find((g) => g.stt.trim() === '7');
    if (!group7) {
      group7 = nextGroups.find(
        (g) =>
          g.stt.trim() !== '2' &&
          (g.title.toLowerCase().includes('tháng trước') ||
            g.title.toLowerCase().includes('đoàn kiểm tra'))
      );
    }
    if (!group7 && nextGroups.length >= 7) {
      group7 = nextGroups[6]; // index 6 is Group 7
    }

    if (group7) {
      if (shouldRollover && unresolvedIssues.length > 0) {
        transferredCount = unresolvedIssues.length;
        group7.rows = unresolvedIssues.map((issue, idx) => ({
          idx: `7.${idx + 1}`,
          content: `Tồn tại đợt kiểm tra Tháng ${latestReport.thang_nam} (mục ${issue.originalIdx}): ${issue.content}`,
          result: 'Đang tiếp tục theo dõi, phối hợp các bộ phận liên quan để xử lý và khắc phục.',
          recommendation: issue.recommendation || 'Đề nghị khẩn trương xử lý dứt điểm theo quy định.',
          note: `Chuyển tiếp từ T${latestReport.thang_nam}`,
          status: 'in_progress',
        }));
      } else {
        group7.rows = [
          {
            idx: '7.1',
            content: `Thực hiện kiến nghị của đợt kiểm tra Tháng ${latestReport.thang_nam}`,
            result: `Toàn bộ các kiến nghị của kỳ kiểm tra Tháng ${latestReport.thang_nam} đã được các bộ phận liên quan hoàn thành và khắc phục đầy đủ.`,
            recommendation: 'Không phát sinh kiến nghị sau kiểm tra',
            note: 'Đã xử lý xong',
            status: 'completed',
          },
        ];
      }
    }
  }

  const newReport: ReportData = {
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    thang_nam: targetMonth,
    ngay: `${endDayStr}/${targetMonth}`,
    so_van_ban: suggestedDocNum,
    gio_bd: latestReport?.gio_bd || '08:00',
    gio_kt: latestReport?.gio_kt || '16:00',
    ngay_bd: `${startDayStr}/${targetMonth}`,
    ngay_kt: `${endDayStr}/${targetMonth}`,
    members: latestReport ? JSON.parse(JSON.stringify(latestReport.members)) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS)),
    groups: nextGroups,
    recommendations: latestReport ? [...latestReport.recommendations] : [...DEFAULT_RECOMMENDATIONS],
    images: [],
    created_at: new Date().toLocaleString('vi-VN'),
    updated_at: new Date().toLocaleString('vi-VN'),
  };

  return {
    report: newReport,
    transferredCount,
    prevMonth: prevThangNam,
    suggestedDocNum,
  };
}

/**
 * Export all reports and settings into a standardized JSON file
 */
export function exportBackupToJson(reports: ReportData[]): void {
  const backupData = {
    app: 'ATVSLD_IALY',
    title: 'Hệ thống Biên bản Kiểm tra ATVSLĐ - Phân xưởng Vận hành Ialy',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    totalReports: reports.length,
    reports,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(backupData, null, 2)
  )}`;

  const today = new Date().toISOString().slice(0, 10);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `ATVSLD_IALY_Backup_${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Parses and validates an uploaded JSON backup file
 */
export async function importBackupFromJson(file: File): Promise<ReportData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let reportsList: ReportData[] = [];
        if (Array.isArray(parsed)) {
          reportsList = parsed;
        } else if (parsed && Array.isArray(parsed.reports)) {
          reportsList = parsed.reports;
        } else {
          throw new Error('Định dạng file không hợp lệ (không tìm thấy danh sách biên bản).');
        }

        // Validate items have basic required fields
        const validated = reportsList.filter(
          (r) => r && typeof r.id === 'string' && typeof r.thang_nam === 'string'
        );

        if (validated.length === 0) {
          throw new Error('File JSON không chứa biên bản hợp lệ.');
        }

        resolve(validated);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file.'));
    reader.readAsText(file);
  });
}

/**
 * Automatically repairs any misplaced Group 7 rows that were mistakenly placed into Group 2.
 * Moves the 7.x rows to Group 7 and restores default 2.1 & 2.2 rows for Group 2.
 */
export function sanitizeReportGroups(report: ReportData): ReportData {
  if (!report || !Array.isArray(report.groups)) return report;

  const g2 = report.groups.find((g) => g.stt.trim() === '2');
  const g7 = report.groups.find((g) => g.stt.trim() === '7');

  if (g2 && g7) {
    const has7inG2 = g2.rows.some((r) => r.idx && r.idx.startsWith('7.'));
    if (has7inG2) {
      const cloned: ReportData = JSON.parse(JSON.stringify(report));
      const targetG2 = cloned.groups.find((g) => g.stt.trim() === '2')!;
      const targetG7 = cloned.groups.find((g) => g.stt.trim() === '7')!;

      const misplacedRows = targetG2.rows.filter((r) => r.idx && r.idx.startsWith('7.'));
      const remainingG2Rows = targetG2.rows.filter((r) => !r.idx || !r.idx.startsWith('7.'));

      if (remainingG2Rows.length === 0) {
        targetG2.rows = [
          {
            idx: "2.1",
            content: "Sổ theo dõi trang cấp BHLĐ; Sổ theo dõi trang bị, dụng cụ an toàn.",
            result: "Hồ sơ theo dõi trang cấp BHLĐ và dụng cụ an toàn được cập nhật đầy đủ",
            recommendation: "Không phát sinh kiến nghị sau kiểm tra",
            note: ""
          },
          {
            idx: "2.2",
            content: "Các Quy trình, quy định đã ban hành (liên quan đến công tác an toàn)",
            result: "Trong tháng không ban hành mới hoặc sửa đổi các quy trình, quy định liên quan đến công tác an toàn",
            recommendation: "Không phát sinh kiến nghị sau kiểm tra",
            note: ""
          }
        ];
      } else {
        targetG2.rows = remainingG2Rows;
      }

      targetG7.rows = misplacedRows;
      return cloned;
    }
  }

  return report;
}
