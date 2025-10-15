import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ResourceHeader({
  title,
  description,
  onCreate,
  createLabel = "Yangi qo‘shish",
  actions,
  className,
}: {
  title: string;
  description?: string;
  onCreate?: () => void;
  createLabel?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onCreate ? (
            <Button onClick={onCreate}>{createLabel}</Button>
          ) : null}
        </div>
      </div>
      <Separator />
    </div>
  );
}
