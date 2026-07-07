import { AuthGuard } from "@/components/layout/auth-guard";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider, Toaster } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <BottomTabBar />
        </div>
        <Toaster />
      </ToastProvider>
    </AuthGuard>
  );
}
