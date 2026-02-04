# Hệ thống Ban Giám Đốc - Hướng dẫn sử dụng

## Tổng quan

Hệ thống Ban Giám Đốc được thiết kế đặc biệt để phục vụ lãnh đạo cấp cao trong việc:
- Ra quyết định chiến lược
- Phê duyệt đề xuất và ngân sách
- Chỉ đạo trực tiếp các bộ phận
- Theo dõi và giám sát hoạt động tổng thể
- Tương tác với AI để phân tích và đưa ra quyết định

## Sự khác biệt giữa Web và Mobile

### Giao diện Web (Desktop)
- **Không hiển thị** nút "Chỉ đạo Công Việc" bằng giọng nói
- Tập trung vào dashboard tổng quan với thống kê chi tiết
- Hiển thị đầy đủ danh sách phê duyệt, quyết định cần xử lý
- Layout rộng rãi với nhiều cột thông tin
- Truy cập: Mở trình duyệt → `https://your-domain.com/board`

### Giao diện Mobile
- **Hiển thị thông tin tổng quan** khi vào trang chủ
- **Menu bottom navigation** với 3 nút chính:
  - 📊 Thống kê: Xem thông tin tổng quan
  - 👥 AI Chat: Tương tác với trợ lý AI
  - ⊞ Dashboard: Truy cập menu các chức năng
- **AI Chat Box** tương tác trực tiếp như hình mẫu
- Tối ưu cho thao tác một tay trên điện thoại

## Tính năng chính

### 1. Phê duyệt (Approvals)
**Đường dẫn:** `/board/approvals`

**Chức năng:**
- Xem danh sách yêu cầu phê duyệt chờ xử lý
- Lọc theo trạng thái: Chờ duyệt, Đã duyệt, Từ chối
- Lọc theo loại: Ngân sách, Chiến lược, Vận hành, Chỉ đạo, Đề xuất
- Phê duyệt hoặc từ chối trực tiếp
- Thêm bình luận và yêu cầu chỉnh sửa

**Thông tin hiển thị:**
- Tiêu đề và mô tả chi tiết
- Độ ưu tiên: Khẩn cấp, Cao, Trung bình, Thấp
- Người gửi và ngày gửi
- Hạn xử lý
- Lịch sử bình luận

**Hành động:**
- ✅ Phê duyệt → Dữ liệu đồng bộ với CMS và Google Sheets
- ❌ Từ chối → Gửi thông báo với lý do
- 💬 Bình luận → Trao đổi trực tiếp với người đề xuất

### 2. Quyết định (Decisions)
**Đường dẫn:** `/board/decisions`

**Chức năng:**
- Theo dõi các quyết định đã ra
- Phân loại theo danh mục: Chiến lược, Tài chính, Vận hành, Nhân sự
- Theo dõi trạng thái: Nháp, Đang xem xét, Đã quyết định, Đã triển khai
- Xem tác động và các bên liên quan
- Theo dõi kết quả mong đợi

**Thông tin hiển thị:**
- Mức độ tác động: Rất cao, Cao, Trung bình, Thấp
- Người ra quyết định
- Các bên liên quan
- Kết quả mong đợi
- Tiến độ triển khai

### 3. Chỉ đạo trực tiếp (Direct Directives)
**Đường dẫn:** `/board/directives`

**Chức năng:**
- Nhập nội dung chỉ đạo bằng văn bản
- AI tự động phân tích và phân loại
- Gán cho bộ phận phù hợp
- Theo dõi tiến độ thực hiện
- Xem lịch sử chỉ đạo

**Quy trình AI:**
1. Nhập nội dung chỉ đạo
2. AI phân tích và xác định:
   - Lĩnh vực liên quan
   - Mức độ ưu tiên
   - Bộ phận cần thực hiện
   - Thời hạn đề xuất
3. Tự động gửi thông báo
4. Đồng bộ với CMS và Google Sheets

### 4. Dashboard Tổng quan

**Thống kê chính:**
- 🕐 Số lượng chờ phê duyệt
- ✅ Số đã phê duyệt hôm nay
- 📄 Quyết định trong tuần
- ⚠️ Vấn đề khẩn cấp

**Tổng quan dự án:**
- Tổng số dự án
- Dự án đúng tiến độ
- Dự án có rủi ro
- Dự án trễ hạn

**Tài chính:**
- Tỷ lệ sử dụng ngân sách
- Ngân sách chờ duyệt
- Ngân sách đã duyệt

### 5. AI Chat Assistant
**Truy cập:** Bottom navigation (Mobile) hoặc Dashboard

**Chức năng:**
- Hỏi đáp về dữ liệu và thống kê
- Phân tích xu hướng
- Tạo báo cáo tự động
- Gợi ý quyết định dựa trên dữ liệu
- Tóm tắt thông tin nhanh

**Hành động nhanh:**
- 📈 Xem ngay lý do? → Phân tích tình hình
- ⚡ Vào Run AI ngay! → Chạy phân tích AI
- 📄 Báo cáo tổng hợp → Tạo báo cáo
- 👥 Thống kê nhân sự → Xem hiệu suất

## Tích hợp và Đồng bộ

### Google Sheets Integration
Tất cả dữ liệu được tự động đồng bộ với Google Sheets:

**Sheets cần thiết:**
- `Approvals` - Danh sách phê duyệt
- `Decisions` - Quyết định
- `Directives` - Chỉ đạo
- `Statistics` - Thống kê tổng hợp

**Cấu hình:**
1. Vào Admin Panel → Tab "Google Sheets"
2. Nhập Spreadsheet ID
3. Cấu hình ranges cho từng loại dữ liệu
4. Test kết nối
5. Bật tự động đồng bộ

### CMS Integration
Dữ liệu được gửi đến CMS để quản lý nội dung:

**Endpoint API CMS:**
- `POST /api/cms/approvals` - Cập nhật phê duyệt
- `POST /api/cms/decisions` - Cập nhật quyết định
- `POST /api/cms/directives` - Cập nhật chỉ đạo

**Cấu hình:**
1. Vào Admin Panel → Tab "CMS Configuration"
2. Nhập CMS API URL và API Key
3. Chọn loại dữ liệu cần đồng bộ
4. Test kết nối

## Bộ lọc và Phân loại

### Lọc Phê duyệt
- **Theo trạng thái:** Tất cả, Chờ duyệt, Đã duyệt, Từ chối
- **Theo loại:** Ngân sách, Chiến lược, Vận hành, Chỉ đạo, Đề xuất
- **Theo độ ưu tiên:** Khẩn cấp, Cao, Trung bình, Thấp

### Lọc Quyết định
- **Theo trạng thái:** Nháp, Đang xem xét, Đã quyết định, Đã triển khai
- **Theo danh mục:** Chiến lược, Tài chính, Vận hành, Nhân sự
- **Theo tác động:** Rất cao, Cao, Trung bình, Thấp

### Lọc Chỉ đạo
- **Theo trạng thái:** Nháp, Đã gửi, Đã xử lý
- **Theo bộ phận:** Tự động phân loại bởi AI
- **Theo thời gian:** Hôm nay, Tuần này, Tháng này

## Quyền truy cập và Bảo mật

### Phân quyền
- **Chủ tịch HĐQT:** Full quyền, xem tất cả
- **Tổng Giám đốc:** Quyền phê duyệt và quyết định
- **Phó TGĐ:** Quyền xem và đề xuất
- **Thành viên HĐQT:** Quyền xem và bình luận

### Bảo mật
- Xác thực 2 lớp (2FA) cho tài khoản cấp cao
- Mã hóa dữ liệu nhạy cảm
- Audit log cho tất cả hành động
- Session timeout sau 30 phút không hoạt động

## API Endpoints

### Board Statistics
```
GET /api/board/statistics
Response: {
  pendingApprovals: number,
  approvedToday: number,
  decisionsThisWeek: number,
  criticalItems: number,
  directives: {...},
  projects: {...},
  financial: {...}
}
```

### Approvals
```
GET /api/board/approvals
Response: Approval[]

POST /api/board/approvals
Body: {
  approvalId: string,
  action: 'approve' | 'reject',
  comment?: string
}
```

### Decisions
```
GET /api/board/decisions
Response: Decision[]

POST /api/board/decisions
Body: {
  title: string,
  description: string,
  category: string,
  impact: string,
  stakeholders: string[]
}
```

### Directives
```
GET /api/board/directives
Response: DirectInput[]

POST /api/board/directives
Body: {
  content: string,
  createdBy: string
}
Response: {
  success: boolean,
  analysis: {
    category: string,
    priority: string,
    assignedTo: string[]
  }
}
```

## Hướng dẫn sử dụng Mobile

### Bước 1: Truy cập
Mở trình duyệt mobile → Truy cập `/board`

### Bước 2: Xem thông tin tổng quan
- Màn hình mặc định hiển thị 4 thẻ thống kê chính
- Scroll xuống để xem thông tin chi tiết

### Bước 3: Sử dụng Bottom Navigation
- **Biểu tượng bên trái (📊):** Về trang tổng quan
- **Biểu tượng giữa (👥):** Mở AI Chat
- **Biểu tượng bên phải (⊞):** Mở menu dashboard

### Bước 4: Tương tác với AI
1. Nhấn vào biểu tượng giữa
2. Chọn hành động nhanh hoặc nhập câu hỏi
3. Xem kết quả phân tích
4. Thực hiện hành động dựa trên gợi ý

### Bước 5: Xử lý phê duyệt
1. Nhấn menu → Chọn "Phê duyệt"
2. Xem danh sách chờ xử lý
3. Nhấn vào item để xem chi tiết
4. Nhấn "Phê duyệt" hoặc "Từ chối"
5. Thêm bình luận nếu cần

## Animation và Hiệu ứng

### Hiệu ứng chính
- **Slide in:** Khi chuyển trang
- **Fade in:** Khi load dữ liệu
- **Pulse:** Cho thông báo mới
- **Gradient shift:** Background holographic
- **Smooth transition:** Tất cả hover states

### Performance
- Lazy loading cho danh sách dài
- Skeleton loading khi fetch data
- Optimistic UI updates
- Debounce cho search và filter

## Tips và Best Practices

### Cho Ban lãnh đạo
- Kiểm tra dashboard mỗi sáng để nắm tình hình
- Sử dụng filter để tập trung vào việc quan trọng
- Tận dụng AI chat để phân tích nhanh
- Thêm bình luận để giao tiếp rõ ràng

### Cho Admin
- Cấu hình Google Sheets đầy đủ để đồng bộ
- Thiết lập thông báo tự động
- Backup dữ liệu định kỳ
- Theo dõi audit logs

### Tối ưu trải nghiệm
- Sử dụng mobile cho phê duyệt nhanh
- Sử dụng desktop cho phân tích chi tiết
- Bookmark các trang thường dùng
- Bật thông báo push cho mobile

## Troubleshooting

### Không load được dữ liệu
1. Kiểm tra kết nối internet
2. Refresh trang (F5)
3. Clear cache và cookies
4. Liên hệ IT support

### Google Sheets không đồng bộ
1. Kiểm tra Spreadsheet ID
2. Xác nhận quyền truy cập
3. Test connection trong Admin Panel
4. Xem logs để debug

### AI không phản hồi
1. Kiểm tra API key
2. Xem console logs
3. Thử lại sau vài phút
4. Liên hệ technical support

## Liên hệ hỗ trợ

**Technical Support:**
- Email: support@company.com
- Phone: 1900-xxxx
- Chat: Live chat trong ứng dụng

**Emergency Contact:**
- Hotline 24/7: 0xxx-xxx-xxx

---

*Tài liệu này được cập nhật lần cuối: 2024*
