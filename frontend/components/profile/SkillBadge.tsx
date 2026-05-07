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
          className={`h-1.5 w-1.5 rounded-full ${i <= level ? 'bg-blue-400' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <div className="inline-flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50">
      <span className="text-sm font-medium text-gray-800">{skill.name}</span>
      <LevelDots level={skill.level} />
    </div>
  )
}
