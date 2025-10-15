"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { navSections } from "@/config/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

function useCurrentPageTitle() {
  const pathname = usePathname();
  return useMemo(() => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          return item.title;
        }
      }
    }
    return "Dashboard";
  }, [pathname]);
}

export function Topbar() {
  const title = useCurrentPageTitle();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div>
          <p className="text-sm font-semibold text-primary">Fonon Admin</p>
          <h1 className="text-lg font-semibold leading-tight text-foreground md:text-xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
