export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image_url: string
  status: 'draft' | 'published'
  tags: string[]
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Album {
  id: number
  title: string
  description: string
  cover_photo_id: number | null
  location: string
  taken_at: string | null
  photos?: Photo[]
  created_at: string
  updated_at: string
}

export interface Photo {
  id: number
  album_id: number
  url: string
  thumbnail_url: string
  caption: string
  width: number
  height: number
  size_bytes: number
  sort_order: number
  created_at: string
}

export interface Skill {
  id: number
  name: string
  category: string
  level: 1 | 2 | 3 | 4 | 5
  icon_url: string
  sort_order: number
}

export interface Project {
  id: number
  title: string
  description: string
  tech_stack: string[]
  github_url: string
  demo_url: string
  cover_image_url: string
  is_featured: boolean
  sort_order: number
}

// Matches { success, data, error?, message? } from pkg/response
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

// Shape of GET /posts response data
export interface PostsListData {
  posts: Post[]
  total: number
  page: number
  limit: number
}
