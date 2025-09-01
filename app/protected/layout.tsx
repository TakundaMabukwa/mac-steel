import { Header } from "@/components/layout/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col flex-1 w-full">
        <nav>
          <Header isSidebarCollapsed={false} />
        </nav>
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
