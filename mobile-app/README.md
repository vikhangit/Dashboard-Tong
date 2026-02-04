# Dashboard Mobile (Expo wrapper)

Hướng dẫn nhanh để chạy app mobile sử dụng Expo. App này mở giao diện web của bạn trong một `WebView` để đảm bảo giao diện trông giống 100% giao diện web trên màn hình mobile.

Yêu cầu:
- Node.js 18+ và `pnpm` / `npm`
- `pnpm dev` (hoặc `npm run dev`) từ root để chạy Next.js dev server trên `localhost:3000` (mặc định)

Chạy nhanh cho development (từ root workspace):

1. Chạy web dev server (root project):

```bash
pnpm dev
```

2. Mở terminal mới, vào thư mục `mobile-app` và cài deps + chạy Expo:

```bash
cd mobile-app
pnpm install
pnpm start
```

Ghi chú kết nối:
- Nếu chạy trên iOS Simulator hoặc Expo Go trên iOS, `localhost:3000` thường hoạt động.
- Nếu chạy trên Android Emulator, dùng địa chỉ `10.0.2.2:3000` (đã cấu hình mặc định trong `App.tsx`).
- Với thiết bị thật, set biến môi trường `EXPO_PUBLIC_WEB_URL` tới địa chỉ IP máy dev của bạn (ví dụ `http://192.168.1.50:3000`) trước khi chạy Expo.

Ví dụ (Windows PowerShell):

```powershell
$env:EXPO_PUBLIC_WEB_URL = 'http://192.168.1.50:3000'
pnpm start
```

Sản xuất / build:
- Để tạo bản mobile hoàn chỉnh thay vì WebView bạn cần chuyển/port các component React web sang React Native. Hiện tại giải pháp này đóng gói web trong WebView để bảo đảm giao diện giống 100%.

Nếu muốn, tôi có thể bắt đầu port từng component sang React Native để có bản mobile gốc (không dùng WebView). Hãy cho biết bạn muốn tiếp tục theo hướng nào.
