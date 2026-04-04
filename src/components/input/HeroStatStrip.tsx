export function HeroStatStrip() {
  const stats = [
    { value: '95.9%', label: 'of websites fail WCAG basics' },
    { value: '57%', label: 'of violations caught automatically' },
    { value: '5,100+', label: 'ADA lawsuits filed in 2025' },
  ];

  return (
    <dl className="grid grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--color-border))]">
      {stats.map(({ value, label }) => (
        <div key={label} className="text-center">
          <dt className="text-2xl font-semibold text-[hsl(var(--indigo-600))]">{value}</dt>
          <dd className="text-xs text-[hsl(var(--color-text-secondary))] mt-1">{label}</dd>
        </div>
      ))}
    </dl>
  );
}
