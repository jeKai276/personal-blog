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

## Quy tắc
- Backend Go: follow standard project layout
- Frontend: component nhỏ, tái sử dụng được
- API: RESTful, có error handling rõ ràng
- Không hardcode credentials
- Component phải reusable và tối ưu performance (ví dụ: dùng Canvas `createImageBitmap` thay vì `HTMLImageElement` cho scroll animation lớn)
