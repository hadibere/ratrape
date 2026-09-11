"use client";

type ChoiceButtonsProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** « pills » pour les pilules à la ligne, « blocks » pour les boutons de même largeur. */
  layout: "pills" | "blocks";
};

export function ChoiceButtons<T extends string>({
  options,
  value,
  onChange,
  layout,
}: ChoiceButtonsProps<T>) {
  const pills = layout === "pills";
  return (
    <div className={pills ? "flex flex-wrap gap-2" : "flex gap-2"}>
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={`cursor-pointer border text-[13px] font-semibold ${
              pills ? "rounded-full px-3.5 py-[9px]" : "flex-1 rounded-[14px] px-1.5 py-[11px]"
            } ${active ? "border-brand bg-brand text-white" : "border-line bg-card text-ink"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
