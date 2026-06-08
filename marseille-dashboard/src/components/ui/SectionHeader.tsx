interface Props { title: string; subtitle?: string; action?: React.ReactNode }

export function SectionHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-white font-bold text-lg">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
