import { forwardRef, type ReactNode } from "react";
import type { ProficiencyLevel } from "@/lib/skills/proficiency";
import type { SkillItem } from "@/lib/schemas/skills";
import { cn } from "@/lib/cn";

export const inputBaseClass =
  "rounded-md border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-[#f0f0f5] placeholder:text-[#5a5a70] focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30";

export const inputClass = cn(inputBaseClass, "w-full");

export const selectClass =
  "w-full rounded-md border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-[#f0f0f5] focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30";

export function AdminPanel({
  title,
  children,
  preview,
  previewLayout = "side",
}: {
  title: string;
  children: ReactNode;
  preview?: ReactNode;
  /** `bottom` shows a full-width scrollable preview — better for long / expanded content */
  previewLayout?: "side" | "bottom";
}) {
  const previewPanel = preview ? (
    <section
      className={cn(
        "rounded-lg border border-dashed border-white/15 bg-[#0c0c12] p-4",
        previewLayout === "side" &&
          "xl:sticky xl:top-6 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:self-start",
        previewLayout === "bottom" && "max-h-[min(70vh,720px)] overflow-y-auto"
      )}
    >
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8888a0]">
        Live preview
      </h3>
      <div className="min-w-0">{preview}</div>
    </section>
  ) : null;

  if (previewLayout === "bottom") {
    return (
      <div className="space-y-4">
        <section className="rounded-lg border border-white/10 bg-[#111118] p-4">
          <h2 className="mb-4 text-lg font-semibold text-[#f0f0f5]">{title}</h2>
          <div className="space-y-4">{children}</div>
        </section>
        {previewPanel}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
      <section className="rounded-lg border border-white/10 bg-[#111118] p-4">
        <h2 className="mb-4 text-lg font-semibold text-[#f0f0f5]">{title}</h2>
        <div className="space-y-4">{children}</div>
      </section>
      {previewPanel}
    </div>
  );
}

/** Bordered block for a single list entry (links, media, skills, etc.). */
export function EntryCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 rounded-md border border-white/10 p-3", className)}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="block text-sm">
      <span className="mb-1 block font-medium text-[#c8c8d8]">{label}</span>
      {hint && <p className="mb-1.5 text-xs text-[#8888a0]">{hint}</p>}
      {children}
    </div>
  );
}

export function TextInput({
  className,
  fullWidth = true,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { fullWidth?: boolean }) {
  return (
    <input
      {...props}
      className={cn(inputBaseClass, fullWidth && "w-full", "min-w-0", className)}
    />
  );
}

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...props }, ref) {
  return <textarea ref={ref} {...props} className={cn(inputClass, "font-mono", className)} />;
});

export function SelectInput({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(selectClass, className)} />;
}

export function MonthInput({
  value,
  onChange,
  allowEmpty,
}: {
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      {...(allowEmpty ? {} : { required: true })}
    />
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#c8c8d8]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-[#0c0c12] accent-[#00d4ff]"
      />
      <span>
        {label}
        {hint && <span className="mt-0.5 block text-xs text-[#8888a0]">{hint}</span>}
      </span>
    </label>
  );
}

export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-[#c8c8d8]">{label}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors",
              value === option.value
                ? "border-[#00d4ff]/50 bg-[#00d4ff]/10 text-[#00d4ff]"
                : "border-white/10 text-[#8888a0] hover:border-white/20 hover:text-[#c8c8d8]"
            )}
          >
            <input
              type="radio"
              className="sr-only"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function LevelPicker({
  value,
  onChange,
}: {
  value: ProficiencyLevel;
  onChange: (level: ProficiencyLevel) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1" role="radiogroup" aria-label="Proficiency level">
      {([1, 2, 3, 4] as const).map((level) => (
        <label
          key={level}
          title={`Level ${level}`}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border text-xs font-medium transition-colors",
            value === level
              ? "border-[#00d4ff]/50 bg-[#00d4ff]/15 text-[#00d4ff]"
              : "border-white/10 text-[#8888a0] hover:border-white/20"
          )}
        >
          <input
            type="radio"
            className="sr-only"
            checked={value === level}
            onChange={() => onChange(level)}
          />
          {level}
        </label>
      ))}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: "bg-[#00d4ff] text-[#0a0a0f] hover:bg-[#33ddff] disabled:opacity-50",
    secondary:
      "border border-white/15 bg-[#1a1a24] text-[#f0f0f5] hover:bg-[#222230] disabled:opacity-50",
    danger:
      "border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-950/70 disabled:opacity-50",
    ghost: "text-[#8888a0] hover:bg-white/5 hover:text-[#f0f0f5] disabled:opacity-50",
  };

  return (
    <button
      type="button"
      {...props}
      className={cn(
        "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        variants[variant],
        props.className
      )}
    >
      {children}
    </button>
  );
}

export function SaveBar({
  onSave,
  saving,
  status,
}: {
  onSave: () => void;
  saving: boolean;
  status: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : "Save & deploy"}
      </Button>
      {status && (
        <p
          className={`text-sm ${status.includes("fail") || status.includes("error") ? "text-red-400" : "text-[#8888a0]"}`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export function StringListEditor({
  values,
  onChange,
  placeholder = "New item",
  addLabel = "Add",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const add = () => onChange([...values, ""]);

  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <EntryCard key={index}>
          <div className="flex items-center gap-2">
            <TextInput
              value={value}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1"
              fullWidth={false}
            />
            <Button variant="ghost" onClick={() => remove(index)} aria-label="Remove">
              Remove
            </Button>
          </div>
        </EntryCard>
      ))}
      <Button variant="secondary" onClick={add}>
        {addLabel}
      </Button>
    </div>
  );
}

export function SkillListEditor({
  skills,
  onChange,
}: {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}) {
  const update = (index: number, patch: Partial<SkillItem>) => {
    const next = [...skills];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const add = () => onChange([...skills, { name: "", level: 2 }]);

  return (
    <div className="space-y-2">
      {skills.map((skill, index) => (
        <EntryCard key={index}>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <TextInput
              value={skill.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Skill name"
              className="min-w-0 flex-1"
              fullWidth={false}
            />
            <LevelPicker
              value={skill.level}
              onChange={(level) => update(index, { level })}
            />
            <Button variant="ghost" onClick={() => remove(index)} aria-label="Remove skill">
              Remove
            </Button>
          </div>
        </EntryCard>
      ))}
      <Button variant="secondary" onClick={add}>
        Add skill
      </Button>
    </div>
  );
}

export function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToLines(values: string[]): string {
  return values.join("\n");
}
