import { Header } from "@/components/layout/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col items-center min-h-screen">
      <div className="flex flex-col flex-1 w-full">
        <nav>
          <Header />
        </nav>
        <div className="">
          {children}
        </div>
      </div>
    </main>
  );
}
