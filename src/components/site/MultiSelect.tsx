import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string; meta?: string | number };

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search",
  className,
  maxBadges = 2,
}: {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  maxBadges?: number;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const toggle = (v: string) => {
    if (selectedSet.has(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  const clear = () => onChange([]);

  const labelMap = useMemo(() => new Map(options.map((o) => [o.value, o.label])), [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-10 w-full justify-between gap-2 bg-card px-3 py-2 text-left font-normal",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {value.slice(0, maxBadges).map((v) => (
                  <Badge key={v} variant="secondary" className="font-medium">
                    <span className="max-w-[10rem] truncate">{labelMap.get(v) ?? v}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(v);
                      }}
                      className="ml-1 cursor-pointer rounded-full hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
                {value.length > maxBadges ? (
                  <Badge variant="secondary">+{value.length - maxBadges}</Badge>
                ) : null}
              </>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const checked = selectedSet.has(o.value);
                return (
                  <CommandItem key={o.value} value={`${o.label} ${o.value}`} onSelect={() => toggle(o.value)}>
                    <div
                      className={cn(
                        "mr-2 grid h-4 w-4 place-items-center rounded border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </div>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.meta != null ? (
                      <span className="ml-2 text-xs text-muted-foreground">{o.meta}</span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {value.length ? (
            <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
              <span className="text-xs text-muted-foreground">{value.length} selected</span>
              <Button variant="ghost" size="sm" onClick={clear}>
                Clear
              </Button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
