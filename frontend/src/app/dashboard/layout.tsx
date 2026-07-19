import { TopNav } from "@/components/dashboard/TopNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloatingButton } from "@/components/dashboard/FloatingButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto transition-all duration-300 w-full">
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
            {children}
          </div>
        </main>
      </div>
      <FloatingButton />
    </div>
  );
}
