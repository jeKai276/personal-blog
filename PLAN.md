# Personal Blog — Project Plan

## Mô tả

Website blog cá nhân của một backend developer đang học frontend.
Mục đích: giới thiệu bản thân, show skills, chia sẻ ảnh và cuộc sống hàng ngày.
Single admin user — không có hệ thống đăng ký.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Go (Golang), Gin, standard project layout |
| Database | PostgreSQL |
| Storage | Cloudflare R2 (S3-compatible) |
| Auth | JWT trong httpOnly cookie |

---

## Quyết định kỹ thuật

| # | Vấn đề | Quyết định | Lý do |
|---|---|---|---|
| 1 | Upload ảnh | Presigned S3 URL (upload thẳng từ browser) | Tiết kiệm bandwidth backend, scale tốt hơn |
| 2 | Markdown editor | TipTap (rich text) | Dễ dùng hơn Markdown thuần |
| 3 | JWT storage | httpOnly cookie (`auth_token`) | An toàn hơn localStorage, không bị XSS đọc được |
| 4 | Thumbnail | Go backend tự resize khi upload | Đủ cho personal blog, đơn giản hơn Lambda@Edge |
| 5 | Seed admin | Migration code trong `main.go` startup | Cần bcrypt hash — không thể làm trong SQL migration |
| 6 | Repo layout | Monorepo (`backend/` + `frontend/`) | Project nhỏ, một developer, dễ quản lý |

---

## Cấu trúc thư mục

```
personal-blog/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── auth/               # model, repository, service, handler
│   │   ├── blog/               # handler, service, repo
│   │   ├── photo/              # handler, service, repo
│   │   ├── profile/            # handler, service, repo
│   │   ├── database/           # connect, migrate
│   │   └── middleware/         # auth (JWT), cors, ratelimit
│   ├── pkg/
│   │   ├── response/           # chuẩn hóa JSON response
│   │   ├── validator/          # input validation helpers
│   │   └── storage/            # S3 client wrapper
│   ├── migrations/
│   │   ├── embed.go            # //go:embed *.sql
│   │   ├── 000001_create_tables.up.sql
│   │   └── 000001_create_tables.down.sql
│   ├── config/
│   │   └── config.go
│   ├── .env.example
│   └── go.mod
│
├── frontend/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                # Home
│   │   │   ├── about/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            # Blog list
│   │   │   │   └── [slug]/page.tsx     # Blog detail
│   │   │   └── photos/
│   │   │       ├── page.tsx            # Album list
│   │   │       └── [albumId]/page.tsx  # Album detail
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Auth guard
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   └── photos/
│   │   │       ├── page.tsx
│   │   │       └── [albumId]/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Button, Card, Badge... (reusable primitives)
│   │   ├── blog/               # BlogCard, BlogList, PostEditor
│   │   ├── photo/              # PhotoGrid, AlbumCard, Lightbox
│   │   ├── profile/            # SkillBadge, ProjectCard, Timeline
│   │   └── layout/             # Navbar, Footer
│   ├── lib/
│   │   ├── api.ts              # Fetch client, base URL
│   │   ├── auth.ts             # Auth helpers
│   │   └── utils.ts            # Format date, slug, v.v.
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   └── usePhotos.ts
│   └── package.json
│
├── docker-compose.yml          # PostgreSQL local dev
├── .gitignore
├── CLAUDE.md
└── PLAN.md
```

---

## Database Schema

### `admin`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(50) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `posts`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL, UNIQUE |
| content | TEXT | NOT NULL |
| excerpt | TEXT | |
| cover_image_url | VARCHAR(500) | |
| status | VARCHAR(20) | DEFAULT 'draft' |
| tags | TEXT[] | |
| published_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

> `updated_at` cần trigger BEFORE UPDATE để tự cập nhật (TODO: thêm vào migration tiếp theo).

### `albums`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| cover_photo_id | INT | FK → photos.id, ON DELETE SET NULL |
| location | VARCHAR(255) | |
| taken_at | DATE | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### `photos`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| album_id | INT | NOT NULL, FK → albums.id, ON DELETE CASCADE |
| url | VARCHAR(500) | NOT NULL |
| thumbnail_url | VARCHAR(500) | |
| caption | TEXT | |
| width | INT | |
| height | INT | |
| size_bytes | BIGINT | |
| sort_order | INT | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `skills`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| level | SMALLINT | NOT NULL, CHECK (1–5) |
| icon_url | VARCHAR(255) | |
| sort_order | INT | DEFAULT 0 |

### `projects`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| tech_stack | TEXT[] | |
| github_url | VARCHAR(500) | |
| demo_url | VARCHAR(500) | |
| cover_image_url | VARCHAR(500) | |
| is_featured | BOOLEAN | DEFAULT false |
| sort_order | INT | DEFAULT 0 |

**Quan hệ:**
- `photos.album_id` → `albums.id` (Many-to-One, CASCADE DELETE)
- `albums.cover_photo_id` → `photos.id` (nullable, SET NULL on delete)

---

## API Endpoints

Base path: `/api/v1`

### Auth

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/login` | Đăng nhập, set httpOnly cookie | Không |
| POST | `/auth/logout` | Clear cookie | Không |
| GET | `/auth/me` | Kiểm tra session | Có |

### Blog — Public

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/posts` | Danh sách bài published (`?tag=&page=&limit=`) | Không |
| GET | `/posts/:slug` | Chi tiết bài theo slug | Không |

### Blog — Admin

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/admin/posts` | Tất cả bài (kể cả draft) | Có |
| POST | `/admin/posts` | Tạo bài mới | Có |
| PUT | `/admin/posts/:id` | Cập nhật bài | Có |
| DELETE | `/admin/posts/:id` | Xóa bài | Có |
| PATCH | `/admin/posts/:id/publish` | Publish / unpublish | Có |

### Photos — Public

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/albums` | Danh sách albums | Không |
| GET | `/albums/:id` | Chi tiết album + danh sách ảnh | Không |

### Photos — Admin

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/admin/albums` | Tạo album | Có |
| PUT | `/admin/albums/:id` | Cập nhật album | Có |
| DELETE | `/admin/albums/:id` | Xóa album (cascade xóa ảnh) | Có |
| POST | `/admin/albums/:id/photos` | Lưu metadata ảnh sau khi upload S3 | Có |
| DELETE | `/admin/photos/:id` | Xóa ảnh | Có |
| PATCH | `/admin/photos/:id` | Cập nhật caption, sort_order | Có |
| POST | `/admin/upload/presigned-url` | Lấy presigned URL (legacy, giữ lại) | Có |
| POST | `/admin/upload/presigned-r2-url` | Lấy R2 presigned URL để upload thẳng từ browser | Có |

### Profile

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/skills` | Danh sách skills | Không |
| GET | `/projects` | Danh sách projects | Không |
| POST | `/admin/skills` | Thêm skill | Có |
| PUT | `/admin/skills/:id` | Cập nhật skill | Có |
| DELETE | `/admin/skills/:id` | Xóa skill | Có |
| POST | `/admin/projects` | Thêm project | Có |
| PUT | `/admin/projects/:id` | Cập nhật project | Có |
| DELETE | `/admin/projects/:id` | Xóa project | Có |

---

## Thứ tự implement

### Phase 1 — Foundation ✅ DONE
- [x] Monorepo setup, docker-compose, .gitignore
- [x] Go module, cấu trúc thư mục backend
- [x] Config loader từ env vars (DB, JWT, Cookie, CORS, SSLMode)
- [x] Database connection (sslmode từ env)
- [x] Migrations runner dùng embed.FS (binary mang migrations theo)
- [x] Migration: tạo 6 tables
- [x] Auth: bcrypt hash, login/logout/me endpoints
- [x] JWT httpOnly cookie (SameSite=Strict, Secure từ env)
- [x] RequireAuth middleware
- [x] CORS middleware (origins từ env)
- [x] Rate limiting: 5 req/phút/IP trên login endpoint
- [x] Admin seed khi startup (idempotent, ON CONFLICT DO NOTHING)

### Phase 2 — Backend CRUD APIs ✅ DONE + REVIEWED
- [x] Blog: CRUD posts, slug generation, publish/unpublish (`internal/blog/`)
- [x] S3 client wrapper (`pkg/storage/`) — presigned PUT, delete, put, get, publicURL
- [x] Presigned URL endpoint (`POST /admin/upload/presigned-url`)
- [x] Photos: album CRUD, photo upload metadata, delete (`internal/photo/`)
- [x] Thumbnail resize khi upload (Go `imaging` library, 400px width, JPEG 85%)
- [x] Skills CRUD (`internal/skill/`)
- [x] Projects CRUD (`internal/project/`)
- [x] Migration 000002: `updated_at` triggers cho posts và albums
- [x] Config: AWS S3 env vars (`AWS_S3_BUCKET`, `AWS_S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BASE_URL`)

> **Ghi chú kỹ thuật:** S3 keys (không phải full URL) được lưu trong DB. Service tự convert sang full URL trước khi trả response (qua `enrichPhoto` — copy struct, không mutate). `DeletePhoto` dùng keys gốc để xóa S3 object đúng.

#### Issues đã fix sau review

| # | Severity | Vấn đề | File | Fix |
|---|---|---|---|---|
| 1 | CRITICAL | `enrichPhoto` mutate struct in-place, key bị mất sau enrich | `photo/service.go` | Copy struct trước khi gán URL; `GetAlbum` dùng index assignment |
| 2 | CRITICAL | Path traversal: `req.URL` không được validate trước khi dùng làm S3 key | `photo/service.go` | Validate prefix `"photos/"` và không chứa `".."` |
| 3 | MAJOR | `ContentType` không giới hạn MIME — có thể upload script lên S3 | `photo/model.go` | `binding:"oneof=image/jpeg image/png image/webp image/gif"` |
| 4 | MAJOR | `UpdateAlbum` gọi `FindAlbumByID` (load cả photos) chỉ để lấy album row | `photo/service.go` | Bỏ pre-fetch, build struct trực tiếp từ request + id |
| 5 | MAJOR | `repository.List` hard-code `"published"` thay vì dùng `params.Status` | `blog/repository.go` | Dùng `params.Status` — fragile contract được loại bỏ |
| 6 | MAJOR | S3 config trống không được cảnh báo — lỗi chỉ lộ runtime | `cmd/server/main.go` | Log warning nếu thiếu `AWS_S3_*` vars khi startup |
| 7 | MAJOR | `GetBySlug` (public) trả về draft nếu slug bị đoán đúng | `blog/repository.go` | Thêm `AND status = 'published'` vào query |
| 8 | MINOR | `sanitizeFilename` không chặn `..`, `#`, `?`, `%` | `photo/handler.go` | Strip tất cả ký tự nguy hiểm |
| 9 | MINOR | `Publish` reset `published_at` khi re-publish — mất ngày gốc | `blog/service.go` | Chỉ set `published_at` lần đầu (`if post.PublishedAt == nil`) |

**Known limitation (chấp nhận):** `DeleteAlbum` không xóa S3 files của photos trong album — chỉ cascade xóa DB rows. Acceptable cho personal blog.

### Phase 3 — Frontend Public Pages ✅ DONE

#### Hạ tầng — DONE
- [x] Next.js setup, Tailwind, `package.json`, `next.config.ts`, `tailwind.config.ts`
- [x] TypeScript interfaces (`types/index.ts`)
- [x] API client + helpers (`lib/api.ts`, `lib/auth.ts`, `lib/utils.ts`)
- [x] Layout: Navbar (responsive hamburger), Footer (`components/layout/`)
- [x] UI primitives: Button, Card, Badge (`components/ui/`)
- [x] Components: BlogCard, BlogList, AlbumCard, PhotoGrid, SkillBadge, ProjectCard, AlbumGallery, Lightbox
- [x] Route scaffolding + loading states tất cả pages

#### Trang Public
- [x] Home (`app/(public)/page.tsx`) — hero + recent posts section
- [x] About/Profile (`app/(public)/about/page.tsx`) — gọi `/skills`, `/projects`
- [x] Blog list (`app/(public)/blog/page.tsx`) — gọi `/posts`
- [x] Blog detail (`app/(public)/blog/[slug]/page.tsx`) — gọi `/posts/:slug` + render TipTap HTML
- [x] Photo album list (`app/(public)/photos/page.tsx`) — gọi `/albums`
- [x] Photo album detail (`app/(public)/photos/[albumId]/page.tsx`) — gọi `/albums/:id` + Lightbox
- [x] Lightbox component (`components/photo/Lightbox.tsx`) — keyboard nav (ESC, ←, →)

### Phase 4 — Frontend Admin Panel ✅ DONE

#### Backend support — DONE
- [x] Auth login validation (binding: required, min=8, max=72)
- [x] Dashboard stats endpoint (`GET /admin/stats`)
- [x] `internal/admin/` package: model, repository, service, handler
- [x] Unit tests: tổng 44 tests PASS

#### Frontend — DONE
- [x] Auth guard (`app/admin/(panel)/layout.tsx`) — redirect nếu chưa login
- [x] Login form (`app/admin/login/page.tsx`) — form + `POST /auth/login`
- [x] Dashboard (`app/admin/(panel)/dashboard/page.tsx`) — stats cards
- [x] AdminNav với logout button
- [x] Blog list admin — full CRUD: list, publish/unpublish, delete, link to edit
- [x] PostEditor với TipTap (`components/blog/PostEditor.tsx`) — Bold, Italic, H1–H3, lists, code block, link
- [x] Tạo bài mới (`app/admin/(panel)/blog/new/page.tsx`)
- [x] Sửa bài (`app/admin/(panel)/blog/[id]/edit/page.tsx`)
- [x] Album list admin — create form inline, delete
- [x] Album detail + upload (`components/admin/AlbumUploadPage.tsx`) — drag-and-drop, presigned R2 URL flow, delete photos

### Phase 5a — Vercel Serverless Migration + Production Deploy ✅ DONE

#### Architecture
- **Single catch-all function** `api/index.go` at project root — Vercel routes all `/api/*` there
- **`internal/bootstrap/bootstrap.go`** — `sync.Once` shared init: DB connect, migrations, admin seed, R2 storage, all services; exposes `Router *gin.Engine`
- **Root `go.mod`** (`module personal-blog-api`) with `replace github.com/yendp/personal-blog => ./backend` — lets Vercel compile `api/index.go` against the backend module
- **Deployment**: 2 separate Vercel projects, same repo
  - **Backend project**: Root Directory = `/` (project root), env vars from Vercel dashboard
  - **Frontend project**: Root Directory = `frontend/`, Vercel auto-detects Next.js
- **Cookie / CORS**: Frontend dùng catch-all Route Handler (`frontend/app/api/[...path]/route.ts`) proxy tất cả `/api/*` sang backend ở runtime — không dùng `next.config.ts` rewrites (build-time, không đọc được `BACKEND_URL` lúc runtime). `SameSite=Strict` JWT cookie được set trên frontend domain, không bị cross-site.
- **Proxy details**: Xóa `host` + `expect` headers trước khi forward. Đọc body qua `req.arrayBuffer()`. Retry 1 lần (2s delay) để handle backend cold start (Go init + Neon DB wake-up = 10–15s). Timeout 28s/attempt qua `AbortSignal.timeout(28000)`.

#### Completed
- [x] Convert Gin routes → Vercel `/api/v1` functions (22 handlers, full path preserved)
- [x] Replace AWS S3 → Cloudflare R2 (`pkg/storage.NewR2` with custom endpoint + `UsePathStyle=true`)
- [x] `DATABASE_URL` support in `internal/database.Connect` (Vercel Postgres; falls back to individual `DB_*` vars)
- [x] Config: `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BASE_URL`, `DATABASE_URL`
- [x] `vercel.json` config (`maxDuration: 30` for all Go functions)
- [x] Migration auto-run on cold start (same `embed.FS` approach, called from `bootstrap.Setup`)
- [x] All 44 existing tests pass (`go test ./internal/... ./pkg/...`)

#### Deploy — ✅ DONE (2026-05-07)

**Backend Vercel project** (`personal-blog-eta-nine-42.vercel.app`):
- [x] Neon PostgreSQL `DATABASE_URL` set trên Production
- [x] Cloudflare R2: `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BASE_URL` set Production
- [x] `JWT_SECRET`, `ADMIN_USERNAME` (`kai`), `ADMIN_PASSWORD`, `COOKIE_SECURE=true`, `ALLOWED_ORIGINS` set Production

**Frontend Vercel project** (`frontend-eta-self-61.vercel.app`):
- [x] `BACKEND_URL=https://personal-blog-eta-nine-42.vercel.app` set Production
- [x] Catch-all Route Handler proxy (`app/api/[...path]/route.ts`) — runtime, không build-time
- [x] `next.config.ts` rewrites đã **xóa** (build-time issue: `BACKEND_URL` không available lúc build)

#### Production issues fixed (2026-05-07)

| # | Lỗi | Root cause | Fix |
|---|---|---|---|
| 1 | `DNS_HOSTNAME_RESOLVED_PRIVATE` | `rewrites()` trong `next.config.ts` chạy lúc build — `BACKEND_URL` chưa được set → fallback `localhost` → Vercel edge từ chối private IP | Xóa rewrites, thay bằng catch-all Route Handler proxy |
| 2 | `FUNCTION_INVOCATION_FAILED` trên backend | 9 env vars (`JWT_SECRET`, `ADMIN_*`, `ALLOWED_ORIGINS`, `COOKIE_SECURE`, `R2_*`) chỉ set cho Development, không có Production | Set tất cả cho Production scope |
| 3 | Proxy 502 `NotSupportedError: expect header not supported` | Client gửi `Expect: 100-continue` cho POST; Node.js undici không hỗ trợ header này | `reqHeaders.delete('expect')` trong proxy |
| 4 | Proxy 502 cold start timeout | Go function + Neon DB auto-suspend = 10–15s; undici timeout mặc định < thời gian wake-up | Retry 1 lần (2s delay) + `AbortSignal.timeout(28000)` |

**Smoke test passed:** `POST /api/v1/auth/login` với `{username:"kai"}` → 200, `Set-Cookie: auth_token=<JWT>; HttpOnly; Secure; SameSite=Strict` ✓

### Phase 5 — Polish & Deploy ✅ DONE

- [x] Error handling đồng nhất (tất cả pages có error boundary inline)
- [x] Loading states — `loading.tsx` cho blog, blog detail, photos, album detail + spinner trong client components
- [x] SEO: metadata + Open Graph cho tất cả public pages; `metadataBase` trong root layout
- [x] Responsive mobile — Navbar hamburger menu (≤sm breakpoint)
- [x] Deploy frontend (Vercel — `frontend-eta-self-61.vercel.app`)
- [x] Deploy backend via Phase 5a serverless path (`personal-blog-eta-nine-42.vercel.app`)

#### Bug fixes (2026-05-07)
- [x] **CRITICAL**: Tất cả server component pages dùng `NEXT_PUBLIC_API_URL` (không được set trên Vercel) thay vì `BACKEND_URL` → đã fix sang `process.env.BACKEND_URL ?? 'http://localhost:8080'`
- [x] Xóa `const BASE_URL` thừa trong `AlbumUploadPage.tsx` (unused variable)
- [x] `BlogCard` đổi sang card layout (border-b không hợp với grid)
- [x] Home page hiển thị recent posts (3 bài mới nhất)

---

## Phase 6 — UI/UX Redesign

### Tổng quan

Hiện tại toàn bộ site dùng color scheme xám (`gray-900`, `gray-500`, `gray-100`), không có brand color, layout flat và thiếu visual hierarchy. Phase 6 redesign toàn bộ public-facing UI sang pastel blue/white minimal theme, nâng cao reading experience cho blog, và đảm bảo admin panel consistent với brand mà không over-engineer.

Không thay đổi backend, không thay đổi data fetching logic — chỉ redesign presentation layer.

---

### Design Tokens / Theme

#### Color Palette (Tailwind classes)

| Token | Tailwind class | Hex | Dùng cho |
|---|---|---|---|
| Brand Primary | `blue-400` | `#60A5FA` | CTA buttons, active nav link, accent |
| Brand Dark | `blue-500` | `#3B82F6` | Button hover state |
| Brand Deeper | `blue-800` | `#1E40AF` | Hero dark text, logo |
| Brand Light | `blue-50` | `#EFF6FF` | Section backgrounds, card hover |
| Brand Muted | `blue-100` | `#DBEAFE` | Badge backgrounds, tag pills |
| Brand Text | `blue-600` | `#2563EB` | Link color in content |
| Neutral Dark | `gray-900` | `#111827` | Body text |
| Neutral Mid | `gray-500` | `#6B7280` | Secondary text, metadata |
| Neutral Light | `gray-200` | `#E5E7EB` | Borders, dividers |
| Surface | `white` | `#FFFFFF` | Card backgrounds |
| Surface Alt | `gray-50` | `#F9FAFB` | Page background sections |

#### Typography

| Role | Tailwind class | Ghi chú |
|---|---|---|
| Display / Hero H1 | `text-5xl font-bold tracking-tight` (desktop), `text-3xl` (mobile) | |
| Page title H1 | `text-4xl font-bold` (desktop), `text-2xl` (mobile) | |
| Section heading H2 | `text-2xl font-semibold` | |
| Subsection H3 | `text-base font-semibold uppercase tracking-widest text-gray-500` | category labels |
| Body | `text-base leading-relaxed text-gray-700` | |
| Small / metadata | `text-sm text-gray-500` | date, tag |
| Micro | `text-xs text-gray-400` | counter, captions |
| Code inline | `font-mono text-sm bg-blue-50 text-blue-800` | |

Font: system-ui stack mặc định của Tailwind. Optional: `Inter` cho body + `JetBrains Mono` cho code (self-host qua `next/font`).

#### Spacing

- Max content width: `max-w-3xl` cho reading content (blog detail, about bio)
- Max page width: `max-w-5xl` cho grids (blog list, photos)
- Section gap: `py-16` desktop, `py-10` mobile
- Card padding: `p-5` hoặc `p-6`

#### Border Radius

- Cards: `rounded-2xl`
- Buttons: `rounded-lg`
- Tags/Badges: `rounded-full`
- Images: `rounded-xl`

---

### Shared Components — Làm trước (block nhiều trang)

#### 1. `components/ui/Button.tsx` — Redesign

Thêm variant `brand` (`bg-blue-400 text-white hover:bg-blue-500`) và `outline-brand` (`border border-blue-400 text-blue-500 hover:bg-blue-50`). Variant `primary` (gray-900) giữ nguyên cho admin.

#### 2. `components/ui/Badge.tsx` — Redesign

Thêm variant `brand`: `bg-blue-100 text-blue-600`. Giữ variant `default` (gray) cho admin.

#### 3. `components/layout/Navbar.tsx` — Redesign

- Logo: `text-blue-800 font-bold text-xl`
- Active link: `text-blue-500 font-medium`; hover: `hover:text-blue-400`
- Border bottom: `border-blue-100`
- Mobile dropdown: `bg-white/95` backdrop

#### 4. `components/layout/Footer.tsx` — Redesign

- Background: `bg-gray-900 text-gray-400`; brand text: `text-blue-300`
- Thêm social links (GitHub, LinkedIn) + quick nav links

#### 5. `components/ui/SectionHeading.tsx` — Tạo mới

Props: `label?: string`, `title: string`, `href?: string`, `hrefLabel?: string`. Dùng lại ở Home + About.

---

### 1. Home Page

**File:** `frontend/app/(public)/page.tsx`

#### Layout

```
[Navbar]
[Hero Section — ~80vh, 2-col desktop]
[Recent Posts Section]
[Skills Preview Section — 4-6 skills hardcoded]
[Photo Teaser Section — 4 album cards]
[Footer]
```

#### Hero Section

- Background: `bg-gradient-to-br from-white via-blue-50 to-white`
- Eyebrow: `text-sm font-medium text-blue-500 uppercase tracking-widest`
- H1: `text-5xl font-bold text-gray-900 leading-tight`
- Subtitle: `text-lg text-gray-600 leading-relaxed max-w-lg`
- CTAs: Button `brand` ("Về tôi") + Button `outline-brand` ("Đọc blog")
- Avatar: `next/image` `rounded-2xl` ~280px desktop. Placeholder: div với initials "YD" trên `bg-gradient-to-br from-blue-300 to-blue-500`
- Layout: desktop `grid grid-cols-2 gap-12 items-center`, mobile `flex flex-col-reverse gap-8`

#### Skills Preview

- Không fetch API — hardcode 4-5 skills (Go, PostgreSQL, Docker, React)
- Mỗi item: `bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm font-medium text-blue-700`
- Link "Xem tất cả skills →" dẫn `/about`

#### Photo Teaser

- Grid: `grid grid-cols-2 gap-4 sm:grid-cols-4`
- Section background: `bg-gray-50 rounded-3xl p-6`
- Dùng `AlbumCard` đã redesign

#### Animations

- Hero text: `@keyframes fadeInUp` (translateY 16px → 0, 0.5s ease-out, fill-mode both) — stagger 3 elements
- Card hover: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Không dùng scroll-triggered animations

#### Mobile Responsive

- Hero ảnh: `hidden sm:block` trên mobile nhỏ nhất
- 2-col hero bắt đầu từ `md` breakpoint
- Touch target minimum 44px cho tất cả buttons

#### Components cần tạo

- `components/home/HeroSection.tsx` (extract từ page)
- `components/home/SkillsPreview.tsx`

---

### 2. About/Profile Page

**File:** `frontend/app/(public)/about/page.tsx`

#### Layout

```
[ProfileHero — tên + tagline]
[Bio Section — paragraph]
[Skills Section — grouped by category]
[Projects Section — grid]
[SocialLinks Section]
```

#### Skills — Redesign `SkillBadge`

Grouped by category. Mỗi skill chip:
- Container: `inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm hover:border-blue-200 hover:bg-blue-50`
- Level: 5 chấm tròn `w-1.5 h-1.5 rounded-full` — filled `bg-blue-400`, empty `bg-gray-200`

Grid: `grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4`

#### Projects — Redesign `ProjectCard`

- Featured: `border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50`
- Normal: `border border-gray-200 bg-white`
- Tech tags: `Badge` variant `brand`
- Links: `text-blue-500 hover:text-blue-600`
- Grid: `grid gap-5 sm:grid-cols-2`

#### Bio

- Lead: `text-lg font-medium text-gray-800`; Body: `text-base leading-[1.75] text-gray-600`
- Hardcode bio paragraph vào page (không cần API)

#### Components cần tạo

- `components/profile/ProfileHero.tsx`
- `components/profile/SocialLinks.tsx` — SVG inline icons, hardcode URLs

---

### 3. Blog List + Blog Detail

#### Blog List — `frontend/app/(public)/blog/page.tsx`

- Tag filter: URL searchParams (`?tag=go`) — server-side, SEO-friendly, không cần `'use client'`
- Tạo `components/blog/TagFilter.tsx`: active tag `bg-blue-400 text-white`, inactive `bg-gray-100 hover:bg-blue-50 hover:text-blue-600`
- Empty state: SVG icon bút + message có style

#### BlogCard Redesign

- Container: `group rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Cover image (nếu có): `aspect-video rounded-xl object-cover`
- Title: `group-hover:text-blue-600 transition-colors`
- Footer: date `text-xs text-gray-400` + arrow `text-blue-400`

#### Blog Detail — `frontend/app/(public)/blog/[slug]/page.tsx`

- Cover image: `aspect-[21/9]` desktop, `aspect-video` mobile, `rounded-2xl`
- Article container: `max-w-2xl mx-auto`
- Reading time: estimate từ content length (`Math.ceil(words / 200)` phút)
- `globals.css` blog-content updates:
  - `a`: `text-blue-600 hover:text-blue-800`
  - `blockquote`: `border-blue-200 text-gray-600`
  - `code` inline: `bg-blue-50 text-blue-800`
  - `p`: `line-height: 1.8`
- Prev/Next navigation: `components/blog/PostNavigation.tsx` — TODO: cần fetch logic (fetch all posts, find index)

---

### 4. Photo Gallery + Album Detail

#### Album List — `frontend/app/(public)/photos/page.tsx`

**Quyết định:** Uniform grid (không masonry — tránh JS layout engine).

**AlbumCard Redesign:**
- Ảnh: `aspect-[4/3] rounded-2xl overflow-hidden`
- Hover overlay: `bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`
- Count badge: `absolute top-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-0.5`
- Location: icon pin + `text-sm text-gray-500`
- Grid: `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`

#### Album Detail — `frontend/app/(public)/photos/[albumId]/page.tsx`

- Cover banner: `aspect-[3/1] object-cover rounded-2xl`; placeholder: `bg-gradient-to-r from-blue-100 to-blue-50`
- Meta row: location, date, photo count — `flex gap-4 text-sm text-gray-500`

**PhotoGrid:** Gap `gap-1` thay vì `gap-2`, grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`

**Lightbox Improvements:**
- Background: `bg-black/95`
- Caption box: fixed bottom, `bg-gradient-to-t from-black/80 to-transparent`
- Counter: top-center
- Nav buttons: `bg-black/30 hover:bg-black/60 rounded-full backdrop-blur-sm`
- Touch swipe: `onTouchStart`/`onTouchEnd`, deltaX > 50px trigger prev/next

---

### 5. Admin Panel

Triết lý: consistent với brand, không fancy. Gray là primary, cyan chỉ làm accent.

#### Login Page

- Page background: `bg-gray-950` (dark login tạo contrast)
- Card: `bg-white rounded-2xl shadow-2xl p-8 max-w-sm`
- Input focus: `focus:ring-blue-400`
- Submit: Button variant `brand`

#### AdminNav

- Logo: "yendp / admin" — slash separator, logo part `text-blue-500`
- Active link: `text-blue-500 font-medium`
- Logout: `text-gray-400 hover:text-red-500`

#### Dashboard

- Stats icons: SVG cho Document, Image, Grid, Code, Briefcase
- Active stat: `text-blue-500`
- Card hover: `hover:border-blue-200 hover:shadow-sm`

#### Admin CRUD Pages

- Row hover: `hover:bg-blue-50`
- Thay ad-hoc button classes bằng `Button` component

---

### Thứ tự Implement

#### Sprint 1 — Design System Foundation

- [x] Extend `tailwind.config.ts`: `brand: colors.cyan` alias
- [x] Redesign `components/ui/Button.tsx`: thêm `brand` + `outline-brand`
- [x] Redesign `components/ui/Badge.tsx`: thêm `brand`
- [x] Tạo `components/ui/SectionHeading.tsx`
- [x] Redesign `components/layout/Navbar.tsx`
- [x] Redesign `components/layout/Footer.tsx`
- [x] Thêm `@keyframes fadeInUp` + utility class vào `globals.css`

#### Sprint 2 — Home Page

- [x] Tạo `components/home/HeroSection.tsx`
- [x] Tạo `components/home/SkillsPreview.tsx`
- [x] Redesign `components/blog/BlogCard.tsx`
- [x] Redesign `app/(public)/page.tsx`

#### Sprint 3 — Blog List + Detail

- [x] Tạo `components/blog/TagFilter.tsx`
- [x] Redesign `components/blog/BlogList.tsx` (empty state)
- [x] Redesign `app/(public)/blog/page.tsx`
- [x] Redesign `app/(public)/blog/[slug]/page.tsx`
- [x] Update `globals.css` blog-content styles
- [x] Tạo `components/blog/PostNavigation.tsx` (skipped — backend không có prev/next endpoint) (TODO: fetch logic)

#### Sprint 4 — About/Profile Page

- [x] Tạo `components/profile/ProfileHero.tsx`
- [x] Redesign `components/profile/SkillBadge.tsx`
- [x] Redesign `components/profile/ProjectCard.tsx`
- [x] Tạo `components/profile/SocialLinks.tsx`
- [x] Redesign `app/(public)/about/page.tsx`

#### Sprint 5 — Photo Gallery

- [x] Redesign `components/photo/AlbumCard.tsx`
- [x] Redesign `components/photo/PhotoGrid.tsx`
- [x] Redesign `components/photo/Lightbox.tsx`
- [x] Redesign `app/(public)/photos/page.tsx`
- [x] Redesign `app/(public)/photos/[albumId]/page.tsx`

#### Sprint 6 — Admin Polish

- [x] Redesign `components/admin/LoginForm.tsx`
- [x] Redesign `components/admin/AdminNav.tsx`
- [x] Polish `app/admin/(panel)/dashboard/page.tsx`
- [x] Audit admin pages: thay ad-hoc button classes bằng `Button` component

#### Verification Checklist

- [x] `next build` không TypeScript errors — Vercel build passed (deployed 2026-05-07)
- [ ] Kiểm tra tất cả pages trên mobile 375px và desktop 1280px
- [x] WCAG AA contrast ratio — đã fix `text-blue-400` → `text-blue-600` cho readable text (commit `cd7a8e0`)
- [x] Lighthouse Performance — đã fix `transition-all` → `transition-[transform,box-shadow]` (commit `cd7a8e0`)

#### Deployed

- Commit: `91f56fa` — `feat: Phase 6 UI/UX redesign — pastel blue theme`
- Frontend: https://frontend-eta-self-61.vercel.app
- Backend: https://personal-blog-eta-nine-42.vercel.app

---

## Trạng thái hiện tại (2026-05-08)

### Vercel Frontend Build — CẦN FIX (chưa làm)

**Lỗi:**
```
Error: > Couldn't find any 'pages' or 'app' directory. Please create one under the project root
Error: Command "npm run vercel-build" exited with 1
```

**Root cause:** Vercel frontend project (`frontend-eta-self-61.vercel.app`) kết nối đến repo `jeKai276/personal-blog` nhưng **Root Directory chưa được set thành `frontend`** — Vercel đang build từ repo root, không tìm thấy `app/`.

**Fix cần làm (Vercel Dashboard UI):**
1. Vào Vercel Dashboard → project `frontend-eta-self-61`
2. Settings → General → Root Directory
3. Set thành `frontend`
4. Save → Redeploy

**Không cần thay đổi code nào.**

### package-lock.json — Đã xóa nhầm

- Commit `4171847` đã xóa `frontend/package-lock.json` (diagnosis sai về SWC binary)
- Sau khi fix Root Directory xong, chạy `npm install` trong `frontend/` để regenerate và commit lại
- Priority thấp — Vercel vẫn chạy được không có lockfile

---

### Files cần tạo mới

| File | Lý do |
|---|---|
| `frontend/components/ui/SectionHeading.tsx` | Shared section header |
| `frontend/components/home/HeroSection.tsx` | Extract hero, isolate animation logic |
| `frontend/components/home/SkillsPreview.tsx` | Hardcoded skills teaser |
| `frontend/components/blog/TagFilter.tsx` | URL-based tag filter |
| `frontend/components/blog/PostNavigation.tsx` | Prev/next navigation |
| `frontend/components/profile/ProfileHero.tsx` | Header section About page |
| `frontend/components/profile/SocialLinks.tsx` | GitHub/LinkedIn/Email links |

### Files cần redesign (không tạo mới)

| File | Thay đổi chính |
|---|---|
| `frontend/tailwind.config.ts` | Extend theme với brand alias |
| `frontend/app/globals.css` | fadeInUp keyframe, blog-content cyan styles |
| `frontend/components/ui/Button.tsx` | Thêm `brand` + `outline-brand` variants |
| `frontend/components/ui/Badge.tsx` | Thêm `brand` variant |
| `frontend/components/layout/Navbar.tsx` | Cyan active states |
| `frontend/components/layout/Footer.tsx` | Dark bg, social links |
| `frontend/components/blog/BlogCard.tsx` | Cover image, cyan hover |
| `frontend/components/blog/BlogList.tsx` | Empty state redesign |
| `frontend/components/photo/AlbumCard.tsx` | `aspect-[4/3]`, overlay, count badge |
| `frontend/components/photo/PhotoGrid.tsx` | Tighter gaps |
| `frontend/components/photo/Lightbox.tsx` | Swipe, counter reposition, nav buttons |
| `frontend/components/profile/SkillBadge.tsx` | Dot level indicator |
| `frontend/components/profile/ProjectCard.tsx` | Featured distinction, cover image |
| `frontend/components/admin/LoginForm.tsx` | Dark bg page, cyan focus |
| `frontend/components/admin/AdminNav.tsx` | Cyan active, logout color |
| `frontend/app/(public)/page.tsx` | Full hero redesign |
| `frontend/app/(public)/about/page.tsx` | Bio section, layout polish |
| `frontend/app/(public)/blog/page.tsx` | Tag filter integration |
| `frontend/app/(public)/blog/[slug]/page.tsx` | Cover image, reading time |
| `frontend/app/(public)/photos/page.tsx` | Grid layout update |
| `frontend/app/(public)/photos/[albumId]/page.tsx` | Cover banner, meta row |
| `frontend/app/admin/(panel)/dashboard/page.tsx` | Stats icons |

---

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=blog
DB_PASSWORD=blog
DB_NAME=blog_db
DB_SSLMODE=disable          # "require" hoặc "verify-full" trong production

# Auth
JWT_SECRET=                 # REQUIRED, random string dài
ADMIN_USERNAME=admin
ADMIN_PASSWORD=             # REQUIRED, min 8 ký tự

# Server
SERVER_PORT=8080
COOKIE_SECURE=false         # "true" trong production (HTTPS)
ALLOWED_ORIGINS=http://localhost:3000  # comma-separated trong production
```
