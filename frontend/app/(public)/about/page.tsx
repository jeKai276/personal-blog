import type { Metadata } from 'next'
import SkillBadge from '@/components/profile/SkillBadge'
import ProjectCard from '@/components/profile/ProjectCard'
import type { Skill, Project, ApiResponse } from '@/types'

export const metadata: Metadata = { title: 'Về tôi' }
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

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
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Về tôi</h1>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Skills</h2>
        {skills.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có skills.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category}>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500 capitalize">
                  {category}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {catSkills.map(skill => <SkillBadge key={skill.id} skill={skill} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Projects</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có projects.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map(project => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}
      </section>
    </div>
  )
}
