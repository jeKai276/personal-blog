import type { Metadata } from 'next'
import type { ApiResponse, Post, PostsListData } from '@/types'
import HeroSection from '@/components/home/HeroSection'
import SkillsPreview from '@/components/home/SkillsPreview'
import SectionHeading from '@/components/ui/SectionHeading'
import BlogCard from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'Yen | Backend Developer',
  description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  openGraph: {
    title: 'Yen | Backend Developer',
    description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  },
}

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

async function fetchRecentPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BASE_URL}/posts?limit=3&page=1`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<PostsListData> = await res.json()
    return json.data?.posts ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const recentPosts = await fetchRecentPosts()

  return (
    <div className="space-y-16">
      <HeroSection />

      {recentPosts.length > 0 && (
        <section>
          <SectionHeading label="Bài viết" title="Bài viết gần đây" href="/blog" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading label="Kỹ năng" title="Tech stack" href="/about" />
        <SkillsPreview />
      </section>
    </div>
  )
}
