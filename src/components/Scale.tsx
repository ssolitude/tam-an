import { cn } from "@/lib/utils";

type Props = {
  value: number | undefined;
  onChange: (v: number) => void;
  labels: string[];
  label: string;
  id: string;
};

export function Scale({ value, onChange, labels, label, id }: Props) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="mt-3 flex gap-2" role="radiogroup" aria-label={label}>
        {labels.map((l, i) => {
          const v = i + 1;
          const active = value === v;
          return (
            <button
              key={v}
              id={`${id}-${v}`}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${v} — ${l}`}
              onClick={() => onChange(v)}
              className={cn(
                "flex-1 rounded-xl border px-2 py-3 text-sm transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/50",
                active
                  ? "border-primary bg-primary-soft font-semibold text-accent-foreground shadow-soft"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {v}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {value ? labels[value - 1] : "Chưa chọn — chọn cái gần nhất là được."}
      </p>
    </fieldset>
  );
}
