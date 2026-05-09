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
    <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 space-y-16">
      <ProfileHero />

      {/* Bio */}
      <section className="max-w-2xl space-y-5">
        <p className="text-[17px] font-medium leading-[1.7]" style={{ color: 'var(--ink)' }}>
          I&rsquo;m Yen — a backend developer passionate about building scalable, reliable systems.
        </p>
        <p className="text-[15px] leading-[1.8]" style={{ color: 'var(--ink-2)' }}>
          I primarily work with Go and PostgreSQL, enjoy designing clear APIs, and write code that&rsquo;s easy to maintain.
          Currently learning frontend with React and Next.js to build full-stack from end to end.
          This site is where I share what I learn, trips I take, and everyday life.
        </p>
        <SocialLinks />
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <SectionHeading label="☼ — Skills" title="Tech stack." />
          <div className="space-y-8">
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category}>
                <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4 capitalize" style={{ color: 'var(--muted)' }}>
                  {category}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <SectionHeading label="✦ — Projects" title="Things I&rsquo;ve shipped." />
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
