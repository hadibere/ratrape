"use client";

import { FILTERS, type Filter } from "@/lib/types";

type FilterChipsProps = {
  value: Filter;
  onChange: (filter: Filter) => void;
  className?: string;
};

export function FilterChips({ value, onChange, className = "" }: FilterChipsProps) {
  return (
    <div className={`scrl flex gap-2 overflow-x-auto ${className}`}>
      {FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter)}
            className={`flex-none cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
              active ? "border-brand bg-brand text-white" : "border-line bg-card text-ink"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
