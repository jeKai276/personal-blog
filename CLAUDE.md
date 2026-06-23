# Personal Blog - Portfolio & Lifestyle

## Mô tả
Website blog cá nhân của một backend developer đang học frontend.
Mục đích: giới thiệu bản thân, show skills, chia sẻ ảnh và cuộc sống hàng ngày.

## Tech Stack
- Frontend: Next.js (React), TypeScript, Tailwind CSS
- Backend: Go (Golang), REST API
- Database: PostgreSQL
- Storage: S3 (ảnh)
- Auth: JWT

## Tính năng chính
- Trang giới thiệu bản thân (About, Skills, Projects)
- Blog: viết bài, chia sẻ hàng ngày
- Photo gallery: upload và xem ảnh đi chơi
- Admin: chỉ mình tôi có thể đăng bài và upload ảnh
- **Piano Sight Reading** (`/piano`): ứng dụng luyện đọc nốt nhạc tích hợp (xem bên dưới)

## Quy tắc
- Backend Go: follow standard project layout
- Frontend: component nhỏ, tái sử dụng được
- API: RESTful, có error handling rõ ràng
- Không hardcode credentials
- Component phải reusable và tối ưu performance (ví dụ: dùng Canvas `createImageBitmap` thay vì `HTMLImageElement` cho scroll animation lớn)

## Module: Piano Sight Reading (2026-06-22)

### Mô tả
Ứng dụng luyện đọc nốt nhạc nhanh (sight reading). Tích hợp như một trang mới trong blog.

### Files
- `frontend/app/(public)/piano/page.tsx` — route `/piano`, server metadata + dynamic import
- `frontend/components/piano/PianoSightReading.tsx` — toàn bộ logic client-side

### Tech
- Vanilla JS (trong React client component)
- Canvas 2D để vẽ khuông nhạc (không dùng thư viện ngoài)
- Web MIDI API — kết nối đàn piano vật lý (Bluefy/iPad)
- Web Audio API (Oscillator triangle wave) — phát âm thanh khi không có MIDI
- requestAnimationFrame để render staff mượt

### Tính năng
- Chế độ hiển thị: Khóa Sol (Treble), Khóa Fa (Bass), và Grand Staff (Cả hai), chuyển qua toggle button
- Khóa nhạc được vẽ đúng chuẩn vị trí nhạc lý
- Nút Hint: Tên nốt bị ẩn mặc định, bấm Hint để hiện tên nốt dưới khuông nhạc + highlight phím trên bàn phím
- Nốt ngẫu nhiên hiển thị trên khuông nhạc với dấu gạch thêm (ledger lines)
- Bàn phím ảo SVG (click) + bàn phím PC (phím A–K = C4–B4)
- MIDI: nút "Connect Piano", hỗ trợ Web MIDI tiêu chuẩn HOẶC Web Bluetooth (BLE MIDI fallback) cho trình duyệt Bluefy/iOS.
- Mute Web Audio khi MIDI đã kết nối
- Feedback: xanh lá = đúng (auto next), đỏ = sai (giữ nốt)
- Điểm số: Correct / Wrong / Accuracy % / Streak 🔥
- Theme: tự detect dark/light mode từ class `dark` trên `<html>`
- Navbar: đã thêm link "Piano" vào NAV_LINKS

