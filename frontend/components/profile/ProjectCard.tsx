import type { Project } from '@/types'
import Badge from '@/components/ui/Badge'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="space-y-3 rounded-xl border p-5">
      <h3 className="text-lg font-semibold">{project.title}</h3>
      {project.description && <p className="text-sm text-gray-500">{project.description}</p>}
      <div className="flex flex-wrap gap-1">
        {project.tech_stack.map((tech) => <Badge key={tech}>{tech}</Badge>)}
      </div>
      <div className="flex gap-4 text-sm">
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            GitHub
          </a>
        )}
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Demo
          </a>
        )}
      </div>
    </div>
  )
}
