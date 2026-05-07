import type { Metadata } from 'next'
import SkillBadge from '@/components/profile/SkillBadge'
import ProjectCard from '@/components/profile/ProjectCard'
import ProfileHero from '@/components/profile/ProfileHero'
import SocialLinks from '@/components/profile/SocialLinks'
import SectionHeading from '@/components/ui/SectionHeading'
import type { Skill, Project, ApiResponse } from '@/types'

export const metadata: Metadata = {
  title: 'Về tôi',
  description: 'Backend developer — skills, projects và hành trình học frontend.',
  openGraph: {
    title: 'Về tôi',
    description: 'Backend developer — skills, projects và hành trình học frontend.',
  },
}
export const dynamic = 'force-dynamic'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

async function fetchSkills(): Promise<Skill[]> {
  try {
    const res = await fetch(`${BASE_URL}/skills`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<Skill[]> = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${BASE_URL}/projects`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<Project[]> = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function AboutPage() {
  const [skills, projects] = await Promise.all([fetchSkills(), fetchProjects()])

  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <div className="space-y-12">
      <ProfileHero />

      {/* Bio */}
      <section className="max-w-2xl space-y-4">
        <p className="text-lg font-medium leading-relaxed text-gray-800">
          Tôi là Yen — backend developer với niềm đam mê xây dựng hệ thống scalable và reliable.
        </p>
        <p className="leading-[1.8] text-gray-600">
          Tôi làm việc chủ yếu với Go và PostgreSQL, thích thiết kế API rõ ràng và viết code dễ bảo trì.
          Hiện tại đang học frontend với React và Next.js để có thể build full-stack từ đầu đến cuối.
          Website này là nơi tôi chia sẻ những gì học được, những chuyến đi, và cuộc sống hàng ngày.
        </p>
        <SocialLinks />
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <SectionHeading label="Kỹ năng" title="Skills" />
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500 capitalize">
                  {category}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {catSkills.map((skill) => (
                    <SkillBadge key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <SectionHeading label="Dự án" title="Projects" />
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
