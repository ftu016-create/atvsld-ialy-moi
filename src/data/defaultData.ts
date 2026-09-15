import { InspectionGroup, Member, ReportData } from '../types';

export const DEFAULT_MEMBERS: Member[] = [
  { name: "Nguyễn Hoàng Phi", role: "Phó Quản đốc - Trưởng đoàn" },
  { name: "Trần Thanh Chương", role: "QLKT - Người làm Công tác an toàn PX" },
  { name: "Nguyễn Văn Toàn", role: "Trực ĐKTT" },
  { name: "Võ Quang Minh", role: "Trực chính TBA 500kV" },
  { name: "A Ran", role: "Trực trạm 500kV Ialy" },
  { name: "Trần Thái Hoàng Vũ", role: "Trực phụ máy Gian máy" },
  { name: "Nguyễn Hồng Quang", role: "Trực chính Gian máy" },
  { name: "Phùng Ngọc Tú", role: "Trực chính Gian máy" },
];

export const DEFAULT_RECOMMENDATIONS: string[] = [
  "Đề nghị các cá nhân khi thực hiện cấp Lệnh công tác, người cho phép, người chỉ huy trực tiếp và thành viên Đội công tác tăng cường kiểm tra, thực hiện đầy đủ các nội dung trong Lệnh công tác trước khi ký cho phép vào làm việc, trong quá trình thực hiện và khi kết thúc công việc; bảo đảm ghi đầy đủ trình tự công việc, điều kiện an toàn và khóa Lệnh công tác theo đúng quy định.",
  "Các Trưởng ca tăng cường công tác tự kiểm tra đầu ca, trong ca và cuối ca; kịp thời phát hiện, xử lý hoặc báo cáo các nguy cơ mất an toàn, các bất thường của thiết bị và điều kiện làm việc.",
  "Nhân viên vận hành khi thực hiện công việc phải chủ động nhận diện mối nguy, đánh giá rủi ro; trường hợp điều kiện an toàn không bảo đảm phải báo cáo cấp có thẩm quyền để xử lý trước khi tiếp tục công việc.",
  "Người làm công tác an toàn Phân xưởng phối hợp với các Trưởng ca tiếp tục rà soát hồ sơ, biểu mẫu và minh chứng liên quan đến công tác ATVSLĐ; bảo đảm hồ sơ đầy đủ, thống nhất, đúng quy định.",
  "Tiếp tục phổ biến, rút kinh nghiệm các vụ tai nạn lao động, sự cố và vụ cận nguy; nâng cao ý thức chấp hành quy trình, quy định và Văn hóa an toàn của toàn thể nhân viên vận hành./.",
];

export const DEFAULT_GROUPS: InspectionGroup[] = [
  {
    stt: "1",
    title: "Việc thực hiện các quy định về ATVSLĐ; khai báo, điều tra, thống kê tai nạn lao động; đánh giá nguy cơ rủi ro về ATVSLĐ; huấn luyện về ATVSLĐ, xây dựng và thực hiện VHAT",
    rows: [
      {
        idx: "1.1",
        content: "Việc thực hiện các quy định về ATVSLĐ; khai báo, điều tra, thống kê tai nạn lao động",
        result: "Thực hiện đầy đủ các quy định về ATVSLĐ; không xảy ra tai nạn lao động, không có vụ việc phải khai báo hoặc điều tra",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "1.2",
        content: "Đánh giá nguy cơ rủi ro về ATVSLĐ",
        result: "Đã thực hiện đánh giá nguy cơ rủi ro về ATVSLĐ theo quy định",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "1.3",
        content: "Huấn luyện về ATVSLĐ, xây dựng và thực hiện VHAT",
        result: "- Người lao động được huấn luyện đầy đủ về ATVSLĐ và chấp hành tốt các quy định về Văn hóa an toàn.\n- Phân xưởng đã Diễn tập XLSC; ứng cứu khẩn cấp ATVSLĐ; chữa cháy và cứu nạn, cứu hộ tại các Nhà máy Ialy và Ialy MR năm 2026 theo Lịch diễn tập số 1067/VHIALY, ngày 07/07/2026",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "1.4",
        content: "Thống kê tổng hợp vụ cận nguy xảy ra tại đơn vị",
        result: "Không phát sinh vụ cận nguy trong kỳ kiểm tra",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "2",
    title: "Hồ sơ, sổ sách, nội quy, quy trình và biện pháp an toàn, sổ ghi biên bản kiểm tra, sổ ghi kiến nghị.",
    rows: [
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
    ]
  },
  {
    stt: "3",
    title: "Việc thực hiện các tiêu chuẩn, quy chuẩn, biện pháp an toàn đã ban hành",
    rows: [
      {
        idx: "3.1",
        content: "Thực hiện thao tác theo PTT: Số lượng, kết quả",
        result: "Các thao tác theo PTT được thực hiện 41 phiếu đúng quy trình, bảo đảm an toàn.",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "3.2",
        content: "Tuân thủ, thực hiện đầy đủ thủ tục PCT, LCT: Số lượng, kết quả",
        result: "Việc thực hiện Phiếu công tác (PCT): 99 PCT, Lệnh công tác (LCT): 49 LCT tại Nhà máy Thủy điện Ialy và Ialy MR: Tỷ lệ PCT không phù hợp là 0%; tỷ lệ LCT không phù hợp là 6,12%.\nQua hậu kiểm phát hiện 03 Lệnh công tác còn tồn tại: Người CHTT không nhập thời gian kết tại cột Kết thúc công tác; Người cấp lệnh không tạo mục “Kiểm tra các biện pháp an toàn trước khi thực hiện lệnh công tác”; Nhân viên đội ĐCT không ký ra khỏi vị trí làm việc.",
        recommendation: "Đề nghị các cá nhân liên quan tiếp tục rà soát, nâng cao chất lượng lập, kiểm tra Phiếu công tác/Lệnh công tác trước khi phát hành nhằm hạn chế sai sót.",
        note: ""
      },
      {
        idx: "3.3",
        content: "Các biện pháp an toàn",
        result: "Các biện pháp an toàn được triển khai đầy đủ và hiệu quả",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "4",
    title: "Tình trạng an toàn, vệ sinh của các máy, thiết bị, nhà xưởng, kho tàng và nơi làm việc như: Che chắn tại các vị trí nguy hiểm, độ tin cậy của các cơ cấu an toàn, chống nóng, chống bụi, chiếu sáng, thông gió, thoát nước và các hệ thống khác",
    rows: [
      {
        idx: "4.1",
        content: "Vệ sinh của các máy, thiết bị, nhà xưởng, kho tàng và nơi làm việc như: Che chắn tại các vị trí nguy hiểm, độ tin cậy của các cơ cấu an toàn, chống nóng, chống bụi, chiếu sáng, thông gió, thoát nước và các hệ thống khác",
        result: "Các khu vực sản xuất được duy trì sạch sẽ; máy móc, thiết bị và hệ thống phụ trợ bảo đảm điều kiện an toàn phục vụ sản xuất.",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "4.2",
        content: "Trang bị, phương tiện phục vụ công tác bảo vệ môi trường",
        result: "Trang bị và phương tiện bảo vệ môi trường đầy đủ, hoạt động tốt",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "4.3",
        content: "Việc thu gom, phân loại, xử lý chất thải",
        result: "Chất thải được thu gom, phân loại và xử lý đúng quy định",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "5",
    title: "Việc sử dụng, bảo quản trang bị phương tiện bảo vệ cá nhân, phương tiện kỹ thuật phòng cháy chữa cháy, phương tiện cấp cứu y tế",
    rows: [
      {
        idx: "5.1",
        content: "Trang bị phương tiện bảo vệ cá nhân: Sổ theo dõi trang cấp, giao nhận PTBVCN",
        result: "Trang bị phương tiện bảo vệ cá nhân đầy đủ, hồ sơ theo dõi được cập nhật",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "5.2",
        content: "Kiểm tra trang bị phương tiện kỹ thuật phòng cháy chữa cháy",
        result: "Phương tiện kỹ thuật PCCC được trang bị đầy đủ, tình trạng tốt",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "5.3",
        content: "Theo dõi kiểm tra, thử nghiệm, kiểm định các dụng cụ an toàn",
        result: "Dụng cụ an toàn được kiểm tra, thử nghiệm, kiểm định đúng thời hạn",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "5.4",
        content: "Phương tiện cấp cứu y tế",
        result: "Phương tiện cấp cứu y tế đầy đủ, sẵn sàng sử dụng",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "6",
    title: "Việc thực hiện các nội dung của kế hoạch ATVSLĐ",
    rows: [
      {
        idx: "6.1",
        content: "Việc thực hiện các nội dung của kế hoạch ATVSLĐ",
        result: "Các nội dung kế hoạch ATVSLĐ được thực hiện theo tiến độ",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "7",
    title: "Thực hiện kiến nghị của các đoàn kiểm tra tháng trước",
    rows: [
      {
        idx: "7.1",
        content: "Thực hiện kiến nghị của các đoàn kiểm tra tháng trước",
        result: "Các kiến nghị của kỳ kiểm tra trước đã được các bộ phận liên quan thực hiện và khắc phục đầy đủ",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "8",
    title: "Quản lý các thiết bị, vật tư và các chất có yêu cầu nghiêm ngặt về an toàn lao động và các yếu tố nguy hiểm có hại",
    rows: [
      {
        idx: "8.1",
        content: "Quản lý các thiết bị, vật tư và các chất có yêu cầu nghiêm ngặt về an toàn lao động",
        result: "Thiết bị, vật tư có yêu cầu nghiêm ngặt về ATLĐ được quản lý đúng quy định",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      },
      {
        idx: "8.2",
        content: "Quản lý các yếu tố nguy hiểm có hại, các khu vực, vị trí làm việc có kết quả quan trắc môi trường không đạt.",
        result: "Các yếu tố nguy hiểm, có hại được kiểm soát; Qua kiểm tra không phát hiện yếu tố nguy hiểm, có hại vượt mức cho phép hoặc bất thường ảnh hưởng đến an toàn lao động.",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "9",
    title: "Kiến thức ATVSLĐ, khả năng xử lý sự cố và sơ cứu, cấp cứu của NLĐ",
    rows: [
      {
        idx: "9.1",
        content: "Kiến thức ATVSLĐ, khả năng xử lý sự cố và sơ cứu, cấp cứu của NLĐ",
        result: "Người lao động nắm vững kiến thức ATVSLĐ và kỹ năng xử lý sự cố",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "10",
    title: "Tổ chức ăn uống bồi dưỡng, chăm sóc sức khỏe NLĐ",
    rows: [
      {
        idx: "10.1",
        content: "Tổ chức ăn uống bồi dưỡng, chăm sóc sức khỏe NLĐ",
        result: "Công tác chăm sóc sức khỏe và bồi dưỡng NLĐ được thực hiện đầy đủ",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "11",
    title: "Hoạt động tự kiểm tra các Kíp, việc khắc phục và giải quyết các đề xuất, kiến nghị về ATVSLĐ",
    rows: [
      {
        idx: "11.1",
        content: "Hoạt động tự kiểm tra các Kíp, việc khắc phục và giải quyết các đề xuất, kiến nghị về ATVSLĐ",
        result: "Các kíp trực thực hiện đầy đủ việc tự kiểm tra đầu ca, trong ca; Các tồn tại được xử lý kịp thời hoặc báo cáo cấp có thẩm quyền để theo dõi, xử lý theo quy định.",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "12",
    title: "Trách nhiệm quản lý công tác ATVSLĐ và phong trào quần chúng về ATVSLĐ",
    rows: [
      {
        idx: "12.1",
        content: "Trách nhiệm quản lý công tác ATVSLĐ và phong trào quần chúng về ATVSLĐ",
        result: "Thực hiện tốt trách nhiệm quản lý ATVSLĐ và phong trào quần chúng",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "13",
    title: "Công tác sơ kết, tổng kết, báo cáo theo các quy định hiện hành",
    rows: [
      {
        idx: "13.1",
        content: "Công tác sơ kết, tổng kết, báo cáo theo các quy định hiện hành",
        result: "Trong tháng không phát sinh yêu cầu sơ kết, tổng kết hoặc báo cáo chuyên đề riêng về công tác ATVSLĐ",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "14",
    title: "Kiểm tra việc xây dựng và thực hiện các phương án ứng cứu khẩn cấp",
    rows: [
      {
        idx: "14.1",
        content: "Kiểm tra việc xây dựng và thực hiện các phương án ứng cứu khẩn cấp",
        result: "Các phương án ứng cứu khẩn cấp được xây dựng và duy trì thực hiện",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "15",
    title: "Kiểm tra hiện trường đường dây trên không, trạm điện, nhà máy điện",
    rows: [
      {
        idx: "15.1",
        content: "Kiểm tra hiện trường đường dây trên không, trạm điện, nhà máy điện",
        result: "Hiện trường đường dây trên không, nhà máy, trạm điện bảo đảm yêu cầu an toàn",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  },
  {
    stt: "16",
    title: "Các nội dung khác",
    rows: [
      {
        idx: "16.1",
        content: "Các nội dung khác",
        result: "Không có nội dung bất thường khác được ghi nhận",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: ""
      }
    ]
  }
];

export function getCurrentMonthYear(): string {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
}

export function createNewReport(monthYear?: string): ReportData {
  const now = new Date();
  const currentMonth = monthYear || getCurrentMonthYear();
  
  let endDay = 30;
  if (currentMonth.includes('/')) {
    const [m, y] = currentMonth.split('/');
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);
    if (!isNaN(monthNum) && !isNaN(yearNum)) {
      endDay = new Date(yearNum, monthNum, 0).getDate();
    }
  } else {
    endDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  const dateStr = `${String(endDay).padStart(2, '0')}/${currentMonth}`;
  const startDay = String(Math.max(1, endDay - 2)).padStart(2, '0');
  
  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    thang_nam: currentMonth,
    ngay: dateStr,
    so_van_ban: "",
    gio_bd: "08:00",
    gio_kt: "16:00",
    ngay_bd: `${startDay}/${currentMonth}`,
    ngay_kt: `${String(endDay).padStart(2, '0')}/${currentMonth}`,
    members: JSON.parse(JSON.stringify(DEFAULT_MEMBERS)),
    groups: JSON.parse(JSON.stringify(DEFAULT_GROUPS)),
    recommendations: [...DEFAULT_RECOMMENDATIONS],
    images: [],
    created_at: new Date().toLocaleString('vi-VN'),
    updated_at: new Date().toLocaleString('vi-VN'),
  };
}

export function createInitialReportsList(): ReportData[] {
  const rep7 = createNewReport('07/2026');
  rep7.id = 'report_2026_07_fixed';
  rep7.so_van_ban = '108';
  rep7.ngay = '31/07/2026';
  rep7.ngay_bd = '29/07/2026';
  rep7.ngay_kt = '31/07/2026';

  const rep6 = createNewReport('06/2026');
  rep6.id = 'report_2026_06_fixed';
  rep6.so_van_ban = '95';
  rep6.ngay = '30/06/2026';
  rep6.ngay_bd = '28/06/2026';
  rep6.ngay_kt = '30/06/2026';

  const rep5 = createNewReport('05/2026');
  rep5.id = 'report_2026_05_fixed';
  rep5.so_van_ban = '82';
  rep5.ngay = '31/05/2026';
  rep5.ngay_bd = '29/05/2026';
  rep5.ngay_kt = '31/05/2026';

  return [rep7, rep6, rep5];
}
