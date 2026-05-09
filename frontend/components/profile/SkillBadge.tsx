import type { Skill } from '@/types'

interface SkillBadgeProps {
  skill: Skill
}

function LevelDots({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: i <= level ? 'var(--accent-strong)' : 'var(--line)',
          }}
        />
      ))}
    </div>
  )
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <div
      className="inline-flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors"
      style={{
        border: '1px solid var(--line)',
        background: 'var(--paper-2)',
        color: 'var(--ink)',
      }}
    >
      <span className="text-[14px] font-medium">{skill.name}</span>
      <LevelDots level={skill.level} />
    </div>
  )
}
