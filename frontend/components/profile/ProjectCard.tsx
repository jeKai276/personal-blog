import Image from 'next/image'
import type { Project } from '@/types'
import Badge from '@/components/ui/Badge'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className={`flex flex-col space-y-3 rounded-2xl p-5 transition-shadow hover:shadow-md ${
      project.is_featured
        ? 'border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50'
        : 'border border-gray-200 bg-white'
    }`}>
      {project.cover_image_url && (
        <div className="aspect-video overflow-hidden rounded-xl">
          <Image
            src={project.cover_image_url}
            alt={project.title}
            width={600}
            height={338}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
        {project.is_featured && (
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
            Featured
          </span>
        )}
      </div>
      {project.description && (
        <p className="text-sm leading-relaxed text-gray-500">{project.description}</p>
      )}
      {project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tech_stack.map((tech) => (
            <Badge key={tech} variant="brand">{tech}</Badge>
          ))}
        </div>
      )}
      {(project.github_url || project.demo_url) && (
        <div className="flex gap-4 pt-1 text-sm">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              GitHub →
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Demo →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
