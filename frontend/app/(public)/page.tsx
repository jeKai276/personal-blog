import type { Metadata } from 'next'
import type { ApiResponse, Post, PostsListData, Album } from '@/types'
import PaintedSky from '@/components/home/PaintedSky'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import ThemeScrollCanvas from '@/components/home/ThemeScrollCanvas'
import NewsletterSection from '@/components/home/NewsletterSection'
import SectionHeading from '@/components/ui/SectionHeading'
import BlogCard from '@/components/blog/BlogCard'
import AlbumCard from '@/components/photo/AlbumCard'

export const metadata: Metadata = {
  title: 'JK | Work fast. Live slow.',
  description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  openGraph: {
    title: 'JK | Work fast. Live slow.',
    description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  },
}

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

async function fetchRecentPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BASE_URL}/posts?limit=6&page=1`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<PostsListData> = await res.json()
    return json.data?.posts ?? []
  } catch {
    return []
  }
}

async function fetchRecentAlbums(): Promise<Album[]> {
  try {
    const res = await fetch(`${BASE_URL}/albums`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<Album[]> = await res.json()
    return (json.data ?? []).slice(0, 6)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [recentPosts, recentAlbums] = await Promise.all([
    fetchRecentPosts(),
    fetchRecentAlbums(),
  ])

  return (
    <div className="relative min-h-screen">
      {/* Animated sky background */}
      <PaintedSky />

      {/* Hero — full viewport */}
      <HeroSection />

      {/* ── Scroll Canvas Animation ─────────────────────────────────── */}
      <ThemeScrollCanvas />

      {/* ── Blog posts ─────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section id="posts" className="relative max-w-[1180px] mx-auto px-6 md:px-10 pt-32 pb-16">
          <SectionHeading
            label="✦ — latest posts"
            title={
              <>
                Letters from the desk &mdash;<br />
                and the <span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>garden</span>.
              </>
            }
            href="/blog"
            hrefLabel="All posts"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} idx={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Photo albums ───────────────────────────────────────────── */}
      {recentAlbums.length > 0 && (
        <section className="relative max-w-[1180px] mx-auto px-6 md:px-10 pt-24 pb-8">
          <SectionHeading
            label="02 — Photo"
            title={
              <>
                Albums &mdash; quiet places,{' '}
                <span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>mostly blue</span>.
              </>
            }
            href="/photos"
            hrefLabel="All albums"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter callout ─────────────────────────────────────── */}
      <NewsletterSection />

      {/* ── About ─────────────────────────────────────────────────── */}
      <AboutSection />
    </div>
  )
}
