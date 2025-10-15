"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type SearchableOption = {
  value: string;
  label: string;
  description?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Tanlang",
  emptyMessage = "Natija topilmadi",
  allowClear = true,
}: {
  value?: string;
  onChange: (value?: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  emptyMessage?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Qidirish..." />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", option.value === value ? "opacity-100" : "opacity-0")} />
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  {option.description ? (
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        {allowClear && value ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 border-t py-2 text-xs text-muted-foreground hover:bg-muted"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            <X className="h-3.5 w-3.5" /> Tozalash
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
