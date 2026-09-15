import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  ImageRun,
  convertInchesToTwip,
  UnderlineType,
  PageOrientation,
} from 'docx';
import { saveAs } from 'file-saver';
import { ReportData } from '../types';
import { getCurrentMonthYear } from '../data/defaultData';

// Helper to convert base64 dataUrl to Uint8Array
async function dataUrlToUint8Array(dataUrl: string): Promise<Uint8Array> {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function generateAndDownloadDocx(report: ReportData): Promise<void> {
  const defaultMonth = getCurrentMonthYear();
  const thang = report.thang_nam || defaultMonth;
  const ngay = report.ngay || `30/${defaultMonth}`;
  const dateParts = ngay.split('/');
  const dayNum = dateParts[0] || '30';
  const monthNum = dateParts[1] || (thang.split('/')[0] || defaultMonth.split('/')[0]);
  const yearNum = dateParts[2] || (thang.split('/')[1] || defaultMonth.split('/')[1]);

  // Format month text like "7/2026" or "07/2026"
  const thangFormatted = thang.includes('/') ? `${parseInt(thang.split('/')[0], 10)}/${thang.split('/')[1]}` : thang;

  // Table Borders helper
  const standardBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  };

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  // 1. Header 2-column table (Quốc hiệu & Đơn vị) - Cỡ chữ 13pt - 14pt
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      // Row 1: Org name & National Motto
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CÔNG TY THỦY ĐIỆN IALY',
                    bold: true,
                    size: 24, // 12pt
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'PHÂN XƯỞNG VHIALY',
                    bold: true,
                    size: 24, // 12pt
                    font: 'Times New Roman',
                    underline: { type: UnderlineType.SINGLE },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    bold: true,
                    size: 24, // 12pt
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    bold: true,
                    size: 26, // 13pt
                    font: 'Times New Roman',
                    underline: { type: UnderlineType.SINGLE },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Row 2: Document Number & Location/Date
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 120 },
                children: [
                  new TextRun({
                    text: 'Số: ',
                    size: 26, // 14pt
                    font: 'Times New Roman',
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: report.so_van_ban ? `     ${report.so_van_ban}/VHIALY` : '       /VHIALY',
                    size: 26, // 14pt
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 120 },
                children: [
                  new TextRun({
                    text: `Gia Lai, ngày ${dayNum} tháng ${monthNum} năm ${yearNum}`,
                    italics: true,
                    size: 26, // 14pt
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 2. Main Title (2 Lines uppercase centered) - Cỡ chữ 14pt đậm
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 60 },
      children: [
        new TextRun({
          text: 'BIÊN BẢN KIỂM TRA',
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: `CÔNG TÁC AN TOÀN, VỆ SINH LAO ĐỘNG THÁNG ${thangFormatted}`,
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
  ];

  // 3. Legal Bases / Opening Clauses (Căn cứ...) - Cỡ chữ 14pt & Thụt đầu dòng chuẩn 1cm
  const legalClausesParagraphs = [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 40, line: 276 },
      indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
      children: [
        new TextRun({
          text: '- Căn cứ Thông tư 07/2016/TT-BLĐTBXH ngày 15/5/2016 quy định một số nội dung tổ chức thực hiện công tác an toàn, vệ sinh lao động đối với cơ sở sản xuất, kinh doanh.',
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 40, line: 276 },
      indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
      children: [
        new TextRun({
          text: '- Căn cứ Quy định công tác an toàn trong Tập đoàn Điện lực Việt Nam ban hành kèm theo Quyết định số 278/QĐ-EVN và Quy định thực hiện công tác an toàn ban hành kèm theo Quyết định số 279/QĐ-EVN.',
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 40, line: 276 },
      indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
      children: [
        new TextRun({
          text: `- Quyết định số 423/QĐ-TĐIAL ngày 20/7/${yearNum} ban hành Quy định an toàn khi thực hiện công việc trong Công ty Thủy điện Ialy.`,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 120, line: 276 },
      indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
      children: [
        new TextRun({
          text: `- Phân xưởng VHIALY thực hiện tự kiểm tra công tác ATVSLĐ định kỳ tháng ${parseInt(monthNum, 10)} năm ${yearNum}`,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
  ];

  // 4. Section A: Thành phần đoàn kiểm tra - Cỡ chữ 14pt
  const sectionATitle = new Paragraph({
    spacing: { before: 140, after: 80 },
    children: [
      new TextRun({
        text: 'A. THÀNH PHẦN ĐOÀN KIỂM TRA',
        bold: true,
        size: 28, // 14pt
        font: 'Times New Roman',
      }),
    ],
  });

  // Borderless table for Section A to ensure perfect alignment in Landscape
  const memberRows: TableRow[] = report.members.map((m, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: noBorder,
          children: [
            new Paragraph({
              spacing: { before: 30, after: 30 },
              indent: { left: convertInchesToTwip(0.2) },
              children: [
                new TextRun({
                  text: `${idx + 1}. Ông ${m.name}`,
                  size: 28, // 14pt
                  font: 'Times New Roman',
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          borders: noBorder,
          children: [
            new Paragraph({
              spacing: { before: 30, after: 30 },
              children: [
                new TextRun({
                  text: m.role,
                  size: 28, // 14pt
                  font: 'Times New Roman',
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  const membersTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: memberRows,
  });

  // 5. Section B: Thời gian và địa điểm kiểm tra - Cỡ chữ 14pt
  const sectionBParagraphs = [
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text: 'B. THỜI GIAN VÀ ĐỊA ĐIỂM KIỂM TRA',
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 30, after: 30 },
      indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
      children: [
        new TextRun({
          text: `- Thời gian: Từ ${report.gio_bd || '08:00'} đến ${report.gio_kt || '16:00'}, trong các ngày từ ${report.ngay_bd || ngay} đến ${report.ngay_kt || ngay}.`,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 30, after: 120 },
      indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
      children: [
        new TextRun({
          text: '- Địa điểm: Nhà máy Thủy điện Ialy và Nhà máy Thủy điện Ialy Mở Rộng.',
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
  ];

  // 6. Section C: Nội dung và kết quả kiểm tra (16 Nhóm tiêu chuẩn) - Cỡ chữ 14pt (28)
  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'STT', bold: true, size: 28, font: 'Times New Roman' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 27, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Nội dung kiểm tra', bold: true, size: 28, font: 'Times New Roman' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 37, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Kết quả kiểm tra', bold: true, size: 28, font: 'Times New Roman' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Tồn tại/kiến nghị cần xử lý', bold: true, size: 28, font: 'Times New Roman' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Ghi chú', bold: true, size: 28, font: 'Times New Roman' })],
            }),
          ],
        }),
      ],
    }),
  ];

  // Populate Groups and Rows
  report.groups.forEach((g) => {
    // Group Header row
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: standardBorder,
            shading: { fill: 'EAEAEA' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: g.stt, bold: true, size: 28, font: 'Times New Roman' })],
              }),
            ],
          }),
          new TableCell({
            borders: standardBorder,
            shading: { fill: 'EAEAEA' },
            columnSpan: 4,
            children: [
              new Paragraph({
                children: [new TextRun({ text: g.title, bold: true, size: 28, font: 'Times New Roman' })],
              }),
            ],
          }),
        ],
      })
    );

    // Group child rows
    g.rows.forEach((r) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: standardBorder,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: r.idx, size: 28, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              borders: standardBorder,
              children: r.content.split('\n').map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 28, font: 'Times New Roman' })],
                  })
              ),
            }),
            new TableCell({
              borders: standardBorder,
              children: r.result.split('\n').map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 28, font: 'Times New Roman' })],
                  })
              ),
            }),
            new TableCell({
              borders: standardBorder,
              children: r.recommendation.split('\n').map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 28, font: 'Times New Roman' })],
                  })
              ),
            }),
            new TableCell({
              borders: standardBorder,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: r.note || '', size: 28, font: 'Times New Roman' })],
                }),
              ],
            }),
          ],
        })
      );
    });
  });

  const inspectionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: standardBorder,
    rows: tableRows,
  });

  // 7. Section D: Kiến nghị đoàn kiểm tra - Cỡ chữ 14pt
  const sectionDParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({ text: 'D. KIẾN NGHỊ ĐOÀN KIỂM TRA', bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
  ];

  report.recommendations.forEach((rec, idx) => {
    sectionDParagraphs.push(
      new Paragraph({
        spacing: { before: 40, after: 60, line: 276 },
        indent: { firstLine: convertInchesToTwip(0.4) }, // Thụt lùi đầu dòng 1cm
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, size: 28, font: 'Times New Roman' }),
          new TextRun({ text: rec, size: 28, font: 'Times New Roman' }),
        ],
      })
    );
  });

  // 8. Signatures Section (2 Columns: Left is Members 2-by-2 in a nested table, Right is Leader) - Cỡ chữ 14pt
  const leaderMember = report.members.find((m) => m.role.toLowerCase().includes('trưởng đoàn')) || report.members[0];
  const otherMembers = report.members.filter((m) => m !== leaderMember);

  // Nested 2-column table for members to guarantee 100% vertical column alignment
  const memberInnerRows: TableRow[] = [];
  for (let i = 0; i < otherMembers.length; i += 2) {
    const m1 = otherMembers[i];
    const m2 = otherMembers[i + 1];

    // Member names row
    memberInnerRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                spacing: { before: 40, after: 20 },
                children: [
                  new TextRun({
                    text: `${i + 1}. Ông: ${m1.name}`,
                    size: 28, // 14pt
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                spacing: { before: 40, after: 20 },
                children: m2
                  ? [
                      new TextRun({
                        text: `${i + 2}. Ông: ${m2.name}`,
                        size: 28, // 14pt
                        font: 'Times New Roman',
                      }),
                    ]
                  : [new TextRun({ text: '' })],
              }),
            ],
          }),
        ],
      })
    );

    // Member signatures row (images or space)
    const m1SigParagraphs: Paragraph[] = [];
    if (m1?.signatureUrl) {
      try {
        const sigBytes = await dataUrlToUint8Array(m1.signatureUrl);
        m1SigParagraphs.push(
          new Paragraph({
            spacing: { before: 20, after: 80 },
            children: [
              new ImageRun({
                data: sigBytes,
                transformation: { width: 110, height: 45 },
                type: 'png',
              }),
            ],
          })
        );
      } catch {
        m1SigParagraphs.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: '(Đã ký)', italics: true, size: 24, font: 'Times New Roman' })],
          })
        );
      }
    } else {
      m1SigParagraphs.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: '' })] }));
    }

    const m2SigParagraphs: Paragraph[] = [];
    if (m2?.signatureUrl) {
      try {
        const sigBytes = await dataUrlToUint8Array(m2.signatureUrl);
        m2SigParagraphs.push(
          new Paragraph({
            spacing: { before: 20, after: 80 },
            children: [
              new ImageRun({
                data: sigBytes,
                transformation: { width: 110, height: 45 },
                type: 'png',
              }),
            ],
          })
        );
      } catch {
        m2SigParagraphs.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: '(Đã ký)', italics: true, size: 24, font: 'Times New Roman' })],
          })
        );
      }
    } else {
      m2SigParagraphs.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: '' })] }));
    }

    memberInnerRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: m1SigParagraphs,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: m2SigParagraphs,
          }),
        ],
      })
    );
  }

  const memberSubTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: memberInnerRows,
  });

  const memberSignBlock: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'CÁC THÀNH VIÊN ĐOÀN KIỂM TRA', bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
    memberSubTable,
  ];

  const leaderSignParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'TRƯỞNG ĐOÀN KIỂM TRA', bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, size: 26, font: 'Times New Roman' }),
      ],
    }),
  ];

  if (leaderMember?.signatureUrl) {
    try {
      const leaderSigBytes = await dataUrlToUint8Array(leaderMember.signatureUrl);
      leaderSignParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60 },
          children: [
            new ImageRun({
              data: leaderSigBytes,
              transformation: { width: 150, height: 65 },
              type: 'png',
            }),
          ],
        })
      );
    } catch {
      leaderSignParagraphs.push(new Paragraph({ spacing: { after: 320 } }));
    }
  } else {
    leaderSignParagraphs.push(new Paragraph({ spacing: { after: 360 } }));
  }

  leaderSignParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Ông: ${leaderMember?.name || ''}`, bold: true, size: 28, font: 'Times New Roman' }),
      ],
    })
  );

  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: memberSignBlock,
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: leaderSignParagraphs,
          }),
        ],
      }),
    ],
  });

  // 9. Appendix: Images Table (Optimized for Landscape with large 320x210 pictures)
  const appendixParagraphs: Paragraph[] = [
    new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 160 },
      children: [
        new TextRun({
          text: `PHỤ LỤC: CÁC HÌNH ẢNH KIỂM TRA THỰC TẾ THÁNG ${thangFormatted}`,
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
  ];

  const maxStt = Math.max(
    1,
    ...report.images.map((img) => img.stt || 1),
    4
  );

  const imageTableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true, size: 26, font: 'Times New Roman' })] })],
        }),
        new TableCell({
          width: { size: 44, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Hình ảnh hiện trường NMTĐ Ialy', bold: true, size: 26, font: 'Times New Roman' })] })],
        }),
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true, size: 26, font: 'Times New Roman' })] })],
        }),
        new TableCell({
          width: { size: 44, type: WidthType.PERCENTAGE },
          borders: standardBorder,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Hình ảnh hiện trường NMTĐ Ialy Mở Rộng', bold: true, size: 26, font: 'Times New Roman' })] })],
        }),
      ],
    }),
  ];

  for (let stt = 1; stt <= maxStt; stt++) {
    const imgST = report.images.find((x) => x.stt === stt && x.side === 'ST');
    const imgMR = report.images.find((x) => x.stt === stt && x.side === 'MR');

    // Caption row
    imageTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: standardBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(stt), bold: true, size: 26, font: 'Times New Roman' })] })],
          }),
          new TableCell({
            borders: standardBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: imgST?.caption || `Vị trí kiểm tra ${stt} - NMTĐ Ialy`, italics: true, size: 26, font: 'Times New Roman' })],
              }),
            ],
          }),
          new TableCell({
            borders: standardBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(stt), bold: true, size: 26, font: 'Times New Roman' })] })],
          }),
          new TableCell({
            borders: standardBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: imgMR?.caption || `Vị trí kiểm tra ${stt} - NMTĐ Ialy Mở Rộng`, italics: true, size: 26, font: 'Times New Roman' })],
              }),
            ],
          }),
        ],
      })
    );

    // Image container row
    const stImgParagraphs: Paragraph[] = [];
    if (imgST && imgST.dataUrl) {
      try {
        const imgBytes = await dataUrlToUint8Array(imgST.dataUrl);
        stImgParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imgBytes,
                transformation: {
                  width: 320,
                  height: 220,
                },
                type: 'jpg',
              }),
            ],
          })
        );
      } catch {
        stImgParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '[Ảnh đính kèm]', italics: true, size: 26, font: 'Times New Roman' })],
          })
        );
      }
    } else {
      stImgParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '(Chưa có ảnh)', italics: true, color: '888888', size: 24, font: 'Times New Roman' })],
        })
      );
    }

    const mrImgParagraphs: Paragraph[] = [];
    if (imgMR && imgMR.dataUrl) {
      try {
        const imgBytes = await dataUrlToUint8Array(imgMR.dataUrl);
        mrImgParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imgBytes,
                transformation: {
                  width: 320,
                  height: 220,
                },
                type: 'jpg',
              }),
            ],
          })
        );
      } catch {
        mrImgParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '[Ảnh đính kèm]', italics: true, size: 26, font: 'Times New Roman' })],
          })
        );
      }
    } else {
      mrImgParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '(Chưa có ảnh)', italics: true, color: '888888', size: 24, font: 'Times New Roman' })],
        })
      );
    }

    imageTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: standardBorder,
            children: [new Paragraph({ text: '' })],
          }),
          new TableCell({
            borders: standardBorder,
            children: stImgParagraphs,
          }),
          new TableCell({
            borders: standardBorder,
            children: [new Paragraph({ text: '' })],
          }),
          new TableCell({
            borders: standardBorder,
            children: mrImgParagraphs,
          }),
        ],
      })
    );
  }

  const imageTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: standardBorder,
    rows: imageTableRows,
  });

  // Construct Document with Standard A4 LANDSCAPE (Khổ ngang A4: 297mm x 210mm) & Cỡ chữ 14pt (28)
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            size: 28, // 14pt default font size
            font: 'Times New Roman',
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 11906, // Standard A4 width (210mm in twips) - docx assigns this to height when orientation is LANDSCAPE
              height: 16838, // Standard A4 height (297mm in twips) - docx assigns this to width when orientation is LANDSCAPE
            },
            margin: {
              top: 1134, // 20mm (1134 twips)
              bottom: 1134, // 20mm (1134 twips)
              left: 1417, // 25mm (1417 twips)
              right: 1134, // 20mm (1134 twips)
            },
          },
        },
        children: [
          headerTable,
          ...titleParagraphs,
          ...legalClausesParagraphs,
          sectionATitle,
          membersTable,
          ...sectionBParagraphs,
          new Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
              new TextRun({
                text: 'C. NỘI DUNG VÀ KẾT QUẢ KIỂM TRA',
                bold: true,
                size: 28, // 14pt
                font: 'Times New Roman',
              }),
            ],
          }),
          inspectionTable,
          ...sectionDParagraphs,
          new Paragraph({ spacing: { before: 160 } }),
          signaturesTable,
          ...appendixParagraphs,
          imageTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanMonth = thang.replace(/[\/\\]/g, '_');
  const filename = `Bien_ban_kiem_tra_ATVSLD_thang_${cleanMonth}_VHIALY_KhoNgang.docx`;
  saveAs(blob, filename);
}
