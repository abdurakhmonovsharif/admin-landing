"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-sidebar text-sidebar-foreground lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-primary-foreground font-semibold">
         <img src="/logo-sidebar.jpg" alt="#" />
        </div>
        <div>
          <p className="font-semibold leading-tight">Fonon Admin</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="flex flex-col gap-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
