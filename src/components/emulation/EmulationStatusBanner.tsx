interface EmulationStatusBannerProps {
  description: string;
  prevalence: string;
}

export function EmulationStatusBanner({ description, prevalence }: EmulationStatusBannerProps) {
  return (
    <div className="bg-[hsl(var(--slate-100))] rounded-md p-3 text-sm">
      <p className="text-[hsl(var(--slate-700))]">{description}</p>
      {prevalence && (
        <p className="text-[hsl(var(--slate-500))] text-xs mt-1">{prevalence}</p>
      )}
    </div>
  );
}
