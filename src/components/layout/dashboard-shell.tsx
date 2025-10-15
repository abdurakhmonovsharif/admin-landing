import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar />
        <main className="flex-1 px-4 pb-20 pt-6 md:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
