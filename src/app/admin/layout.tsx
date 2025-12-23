import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}