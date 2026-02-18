type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-baseline justify-between px-4">
      <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
        {title}
      </h2>
      {subtitle ? (
        <span className="text-xs text-[#888]">{subtitle}</span>
      ) : null}
    </div>
  );
}
