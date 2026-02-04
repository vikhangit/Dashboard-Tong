# Hệ thống Quản lý Công việc LEVEL

Nền tảng quản lý công việc thông minh với tính năng chỉ đạo bằng giọng nói và phân tích AI.

## Tính năng chính

### 1. Chỉ đạo bằng giọng nói
- Nhấn vào nút tròn lớn ở giữa màn hình để bắt đầu ghi âm
- Nói chỉ đạo công việc của bạn
- Hệ thống sẽ tự động chuyển đổi giọng nói thành văn bản
- Chỉ đạo được lưu và hiển thị trong danh sách

### 2. Dashboard thống kê
Dashboard hiển thị 7 loại thống kê chính:

- **Chỉ đạo**: Theo dõi các chỉ đạo (đã chỉ đạo, đã tiếp nhận, đã hoàn thành)
- **Công việc**: Quản lý công việc (chờ xử lý, đang thực hiện, hoàn thành)
- **Dự án**: Theo dõi tiến độ dự án với progress bar
- **Đề xuất**: Quản lý các đề xuất và phê duyệt
- **Sự cố**: Theo dõi và xử lý sự cố
- **Kế hoạch**: Lập và quản lý kế hoạch
- **Phân tích**: Xem báo cáo tổng hợp và insights

### 3. Giao diện responsive
- Hoạt động mượt mà trên cả mobile và desktop
- Thiết kế holographic gradient hiện đại
- Animations mượt mà và hiệu ứng glass morphism

### 4. CMS quản lý cấu hình
Truy cập trang admin bằng cách nhấn vào icon menu (☰) ở góc phải trên cùng.

#### Quản lý thẻ dashboard:
- Bật/tắt các thẻ hiển thị
- Đổi tên thẻ
- Thêm/xóa thẻ
- Sắp xếp thứ tự (kéo thả)

#### Tích hợp Google Sheets:
1. Nhập ID của Google Sheet
2. Cấu hình ranges cho từng loại dữ liệu
3. Kiểm tra kết nối
4. Đồng bộ dữ liệu tự động

#### Cài đặt AI:
- Bật/tắt phân tích giọng nói
- Phân loại tự động
- Đề xuất thông minh
- Báo cáo tự động

### 5. Tích hợp Google Sheets

#### Cấu hình:
1. Tạo Google Sheet mới
2. Lấy ID từ URL (docs.google.com/spreadsheets/d/[ID]/edit)
3. Vào trang Admin → Tab "Google Sheets"
4. Nhập ID và cấu hình ranges
5. Nhấn "Kiểm tra kết nối"

#### Format Sheet mẫu:

**Sheet "Directives":**
```
| ID | Nội dung | Trạng thái | Ngày tạo | Người thực hiện |
```

**Sheet "Tasks":**
```
| ID | Tiêu đề | Mô tả | Trạng thái | Ưu tiên | Ngày tạo | Hạn |
```

**Sheet "Projects":**
```
| ID | Tên | Mô tả | Trạng thái | Tiến độ | Ngày bắt đầu | Ngày kết thúc | Ngày tạo |
```

### 6. Tính năng AI

#### Speech-to-Text:
- Tự động chuyển đổi giọng nói thành văn bản
- Hỗ trợ tiếng Việt
- Độ chính xác cao

#### Phân tích nội dung:
- Tự động phân loại công việc
- Xác định mức độ ưu tiên
- Đề xuất hành động
- Phân tích sentiment

#### Insights và báo cáo:
- Tỷ lệ hoàn thành công việc
- Thời gian trung bình
- Phát hiện bottlenecks
- Đề xuất cải thiện

## Cấu trúc dự án

```
/app
  /api
    /statistics        - API thống kê
    /directives        - API chỉ đạo
    /tasks            - API công việc
    /projects         - API dự án
    /sheets/sync      - API đồng bộ Google Sheets
    /ai/insights      - API phân tích AI
    /ai/analyze       - API phân tích nội dung
  /directives         - Trang chi tiết chỉ đạo
  /tasks             - Trang chi tiết công việc
  /projects          - Trang chi tiết dự án
  /proposals         - Trang đề xuất
  /incidents         - Trang sự cố
  /plans             - Trang kế hoạch
  /analysis          - Trang phân tích
  /admin             - Trang quản trị
  
/components
  voice-recorder.tsx  - Component ghi âm giọng nói
  stats-card.tsx      - Component thẻ thống kê
  
/lib
  types.ts           - Type definitions
  mock-data.ts       - Dữ liệu mẫu
  sheets-service.ts  - Service Google Sheets
  ai-service.ts      - Service AI
```

## Cài đặt và triển khai

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình môi trường (tùy chọn)

Tạo file `.env.local`:

```env
# Google Sheets (nếu dùng API thực)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Services (nếu dùng API thực)
OPENAI_API_KEY=sk-...
# hoặc
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Chạy development server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### 4. Deploy lên Vercel
```bash
vercel deploy
```

## Hướng dẫn tích hợp production

### Google Sheets API

1. Tạo project trong [Google Cloud Console](https://console.cloud.google.com)
2. Bật Google Sheets API
3. Tạo Service Account và download key JSON
4. Thêm credentials vào environment variables
5. Cài đặt package:
```bash
npm install googleapis
```

6. Uncomment code trong `/lib/sheets-service.ts`

### AI/ML Integration

#### OpenAI:
```bash
npm install openai
```

#### Anthropic Claude:
```bash
npm install @anthropic-ai/sdk
```

#### Web Speech API (miễn phí, chạy trên browser):
- Đã được tích hợp sẵn trong voice-recorder component
- Không cần API key
- Chỉ hoạt động trên HTTPS

## Tùy chỉnh giao diện

### Thay đổi màu sắc:
Chỉnh sửa file `/app/globals.css`, section `:root`:

```css
:root {
  --primary: oklch(0.55 0.2 270);  /* Màu chính (tím) */
  --accent: oklch(0.65 0.18 200);  /* Màu nhấn (xanh) */
  /* ... */
}
```

### Gradient holographic:
Chỉnh sửa `.gradient-holographic` class trong `globals.css`

### Font chữ:
Thay đổi trong `/app/layout.tsx` và `globals.css`

## API Endpoints

### Thống kê
- `GET /api/statistics` - Lấy tất cả thống kê

### Chỉ đạo
- `GET /api/directives` - Lấy danh sách chỉ đạo
- `POST /api/directives` - Tạo chỉ đạo mới

### Công việc
- `GET /api/tasks` - Lấy danh sách công việc

### Dự án
- `GET /api/projects` - Lấy danh sách dự án

### Google Sheets
- `POST /api/sheets/sync` - Đồng bộ dữ liệu
  ```json
  {
    "type": "all|directives|tasks|projects|test",
    "config": {
      "spreadsheetId": "...",
      "ranges": { ... }
    }
  }
  ```

### AI
- `GET /api/ai/insights` - Lấy insights tổng quan
- `POST /api/ai/analyze` - Phân tích nội dung
  ```json
  {
    "text": "Nội dung cần phân tích"
  }
  ```

## Troubleshooting

### Microphone không hoạt động:
1. Kiểm tra quyền truy cập microphone trong browser
2. Đảm bảo website chạy trên HTTPS (hoặc localhost)
3. Thử browser khác (Chrome/Edge được khuyến nghị)

### Google Sheets không kết nối:
1. Kiểm tra lại spreadsheet ID
2. Đảm bảo đã share sheet với service account email
3. Kiểm tra credentials trong environment variables

### AI không hoạt động:
1. Kiểm tra API key đã được cấu hình đúng
2. Kiểm tra credit/quota của API
3. Xem logs trong console để debug

## Bảo mật

- Không commit API keys vào git
- Sử dụng environment variables cho sensitive data
- Cấu hình CORS đúng cho production
- Implement authentication cho admin panel
- Rate limiting cho API endpoints

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs (F12)
2. Xem file này để tìm hướng dẫn
3. Liên hệ team phát triển

---

**Phiên bản:** 1.0.0  
**Cập nhật:** 2024
