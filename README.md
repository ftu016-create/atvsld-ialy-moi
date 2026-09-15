# Ứng Dụng Quản Lý & Xuất Biên Bản ATVSLĐ (Vercel Ready)

Hệ thống tạo, quản lý và xuất Biên bản kiểm tra An toàn Vệ sinh Lao động (ATVSLĐ) chuẩn thể thức công văn & EVN cho **Công ty Thủy điện Ialy - Phân xưởng Vận hành (NMTĐ Ialy & Ialy Mở Rộng)**.

## 🚀 Tính năng nổi bật
1. **Xuất file Word (.docx) chuẩn 100%**:
   - Quốc hiệu, Tiêu ngữ, Tên đơn vị, Số hiệu văn bản.
   - Bảng 16 nhóm tiêu chuẩn ATVSLĐ (cột STT, Nội dung, Kết quả, Kiến nghị khắc phục, Ghi chú).
   - Bảng phân công thành viên đoàn kiểm tra và Trưởng đoàn ký tên 2 cột.
   - Phụ lục hình ảnh 2 cột (NMTĐ Ialy & NMTĐ Ialy MR) kèm chú thích vị trí kiểm tra.
2. **Chạy trực tiếp & Tối ưu 100% trên Vercel**:
   - Sử dụng thư viện `docx` JavaScript/TypeScript chạy trực tiếp trên trình duyệt / Edge.
   - **Cold-start 0s**, không cần cài đặt Python, LibreOffice hay MS Word trên máy chủ.
   - Hoàn toàn miễn phí và không giới hạn lưu lượng trên Vercel Free Tier.
3. **Kho lưu trữ & Quản lý biên bản**:
   - Tự động lưu bản nháp, quản lý lịch sử các tháng.
   - Nhân bản (Duplicate) biên bản sang tháng mới chỉ với 1 click.
   - Sao lưu (Export) và Khôi phục (Import) toàn bộ dữ liệu dạng file `.json`.
4. **Xem trước trực quan A4**:
   - Chế độ xem trước thời gian thực giống hệt trang in trước khi tải file về.

---

## 📦 Hướng dẫn Triển khai lên Vercel (2 Cách)

### Cách 1: Triển khai bằng Vercel CLI (1 phút)
Mở Terminal trong thư mục dự án và chạy:
```bash
# 1. Cài đặt Vercel CLI (nếu chưa có)
npm install -g vercel

# 2. Đăng nhập và deploy lên production
vercel --prod
```

### Cách 2: Triển khai qua GitHub
1. Đẩy mã nguồn lên GitHub repository.
2. Truy cập [vercel.com/new](https://vercel.com/new).
3. Chọn Import repository vừa tạo.
4. Giữ nguyên cấu hình mặc định (Framework: `Vite`, Build command: `npm run build`, Output directory: `dist`).
5. Nhấn **Deploy**.

---

## 🛠️ Chạy ở môi trường máy cá nhân (Local Development)
```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:3000`
