import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Props = {
  value: number | undefined;
  onChange: (v: number) => void;
  labels: string[];
  label: string;
  id: string;
};

export function Scale({ value, onChange, labels, label, id }: Props) {
  const legendId = useId();
  return (
    <fieldset>
      <legend id={legendId} className="text-sm font-medium text-foreground">
        {label}
      </legend>
      <RadioGroup
        value={value != null ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        aria-labelledby={legendId}
        className="mt-3 flex gap-2"
      >
        {labels.map((l, i) => {
          const v = i + 1;
          const active = value === v;
          return (
            <RadioGroupItem
              key={v}
              id={`${id}-${v}`}
              value={String(v)}
              aria-label={`${v} — ${l}`}
              className={cn(
                "flex-1 rounded-xl border px-2 py-3 text-sm transition-all duration-200",
                "aspect-auto h-auto hover:-translate-y-0.5 hover:border-primary/50",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "border-primary bg-primary-soft font-semibold text-accent-foreground shadow-soft"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {v}
            </RadioGroupItem>
          );
        })}
      </RadioGroup>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {value != null ? labels[value - 1] : "Chưa chọn — chọn cái gần nhất là được."}
      </p>
    </fieldset>
  );
}
