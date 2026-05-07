import type { Skill } from '@/types'

interface SkillBadgeProps {
  skill: Skill
}

const levelLabel: Record<Skill['level'], string> = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="font-medium">{skill.name}</span>
      <span className="text-sm text-gray-400">{levelLabel[skill.level]}</span>
    </div>
  )
}
