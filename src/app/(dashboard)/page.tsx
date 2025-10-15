import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { navSections } from "@/config/navigation";
import Link from "next/link";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {navSections.flatMap((section) => section.items).map((item) => (
          <Card key={item.href} className="border-primary/20 transition hover:border-primary/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                <Link href={item.href} className="hover:text-primary">
                  {item.title}
                </Link>
              </CardTitle>
              <item.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {item.description ?? "Resurslarni boshqarish uchun kirish."}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
