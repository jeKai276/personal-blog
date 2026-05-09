import Image from 'next/image'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div
      className="flex flex-col space-y-4 rounded-2xl p-6 transition-all"
      style={{
        border: project.is_featured
          ? '1px solid color-mix(in oklch, var(--accent-strong) 40%, var(--line))'
          : '1px solid var(--line)',
        background: project.is_featured
          ? 'linear-gradient(135deg, var(--accent-soft) 0%, var(--paper-2) 100%)'
          : 'var(--paper-2)',
      }}
    >
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
        <h3 className="font-serif text-[20px] tracking-tight" style={{ color: 'var(--ink)' }}>
          {project.title}
        </h3>
        {project.is_featured && (
          <span
            className="shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
            style={{ color: 'var(--accent-strong)', background: 'var(--accent-soft)' }}
          >
            Featured
          </span>
        )}
      </div>
      {project.description && (
        <p className="text-[14px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
          {project.description}
        </p>
      )}
      {project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] tracking-[0.12em] uppercase px-2 py-1 rounded-full"
              style={{ color: 'var(--accent-strong)', background: 'var(--accent-soft)' }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      {(project.github_url || project.demo_url) && (
        <div className="flex gap-5 pt-1 text-[13px] font-mono">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--accent-strong)' }}
            >
              GitHub →
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--accent-strong)' }}
            >
              Demo →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
