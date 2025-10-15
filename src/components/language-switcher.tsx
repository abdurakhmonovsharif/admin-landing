"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const languages = [
  { value: "uz", label: "UZ" },
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-1">
      {languages.map((lang) => (
        <button
          key={lang.value}
          type="button"
          onClick={() => setLanguage(lang.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition",
            language === lang.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
