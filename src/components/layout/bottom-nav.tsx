"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/config/navigation";
import { cn } from "@/lib/utils";

const flatNav = navSections.flatMap((section) => section.items);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t bg-background/95 px-2 py-2 backdrop-blur md:hidden">
      {flatNav.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
