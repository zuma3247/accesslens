interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  label: string;
}

export function DragHandle({ onMouseDown, label }: DragHandleProps) {
  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      onMouseDown={onMouseDown}
      className="hidden lg:flex flex-col items-center justify-center w-4 flex-shrink-0 cursor-col-resize group self-stretch"
    >
      <div className="w-0.5 h-full bg-[hsl(var(--color-border))] group-hover:bg-[hsl(var(--indigo-400))] transition-colors rounded-full" />
    </div>
  );
}
