interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export function StatCard({ label, value, sub, color = "#22c55e", icon }: Props) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="text-3xl font-black mt-1" style={{ color }}>{value}</div>
      {sub && <div className="text-gray-600 text-xs mt-1">{sub}</div>}
    </div>
  );
}
