import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

/** Styled select used across the app instead of native `<select>`. */
export function CourseSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  triggerClassName,
}: Props) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-10 rounded-xl border-border/60 bg-secondary/40 shadow-sm backdrop-blur-sm", triggerClassName, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
