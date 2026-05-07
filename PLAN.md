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

### Phase 3 — Frontend Public Pages ✅ SCAFFOLDED (đang wire API)

#### Hạ tầng — DONE
- [x] Next.js setup, Tailwind, `package.json`, `next.config.ts`, `tailwind.config.ts`
- [x] TypeScript interfaces (`types/index.ts`)
- [x] API client + helpers (`lib/api.ts`, `lib/auth.ts`, `lib/utils.ts`)
- [x] Layout: Navbar, Footer (`components/layout/`)
- [x] UI primitives: Button, Card, Badge (`components/ui/`)
- [x] Components: BlogCard, BlogList, AlbumCard, PhotoGrid, SkillBadge, ProjectCard
- [x] Hooks: `useAuth`, `usePosts`, `usePhotos`
- [x] Route scaffolding: tất cả pages (public + admin) đã tạo file

#### Trang Public — CẦN WIRE API (placeholder content)
- [x] Home (`app/(public)/page.tsx`) — static content done
- [ ] About/Profile (`app/(public)/about/page.tsx`) — cần gọi `/skills`, `/projects`
- [ ] Blog list (`app/(public)/blog/page.tsx`) — cần gọi `/posts`
- [ ] Blog detail (`app/(public)/blog/[slug]/page.tsx`) — cần gọi `/posts/:slug` + render TipTap HTML
- [ ] Photo album list (`app/(public)/photos/page.tsx`) — cần gọi `/albums`
- [ ] Photo album detail (`app/(public)/photos/[albumId]/page.tsx`) — cần gọi `/albums/:id` + Lightbox
- [ ] **Lightbox component** (`components/photo/Lightbox.tsx`) — chưa tạo

### Phase 4 — Frontend Admin Panel (scaffolded, chờ implement)

#### Backend support — DONE
- [x] Auth login validation (binding: required, min=8, max=72 — đã có từ Phase 1)
- [x] Dashboard stats endpoint (`GET /admin/stats`) — trả về tổng posts/albums/photos/skills/projects
- [x] `internal/admin/` package: model, repository, service, handler
- [x] Unit tests: admin service (3), auth handler (7), blog service (13), skill service (7), project service (9) — tổng 44 tests PASS

#### Đã xong (frontend)
- [x] Auth guard (`app/admin/layout.tsx`) — redirect nếu chưa login
- [x] `isAuthenticated()` trong `lib/auth.ts`

#### Cần implement (hiện là placeholder)
- [ ] Login form (`app/admin/login/page.tsx`) — cần form + gọi `POST /auth/login`
- [ ] Dashboard (`app/admin/dashboard/page.tsx`) — stats đơn giản
- [ ] Blog list admin (`app/admin/blog/page.tsx`) — cần gọi `GET /admin/posts`
- [ ] **PostEditor với TipTap** (`components/blog/PostEditor.tsx`) — chưa tạo
- [ ] Tạo bài mới (`app/admin/blog/new/page.tsx`) — cần PostEditor + `POST /admin/posts`
- [ ] Sửa bài (`app/admin/blog/[id]/edit/page.tsx`) — cần PostEditor + `PUT /admin/posts/:id`
- [ ] Album list admin (`app/admin/photos/page.tsx`) — cần gọi `GET /admin/albums`
- [ ] Album detail + upload (`app/admin/photos/[albumId]/page.tsx`) — cần presigned URL flow

#### Bước tiếp theo (thứ tự ưu tiên)
1. **Login form** (`app/admin/login/page.tsx`) — form + `POST /api/v1/auth/login` qua proxy → unblock toàn bộ admin panel
2. PostEditor (TipTap, cài `@tiptap/react @tiptap/starter-kit`)
3. Admin blog list + new/edit
4. Lightbox component
5. Wire tất cả public pages với API

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

### Phase 5 — Polish & Deploy
- [ ] Error handling đồng nhất
- [ ] Loading states, skeleton UI
- [ ] SEO: metadata, Open Graph
- [ ] Responsive mobile
- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend via Phase 5a serverless path

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
