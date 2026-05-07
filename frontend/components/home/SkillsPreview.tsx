const skills = ['Go', 'PostgreSQL', 'Docker', 'Linux', 'React', 'TypeScript']

export default function SkillsPreview() {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
        >
          {skill}
        </span>
      ))}
    </div>
  )
}
