import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

export const Layout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-end px-8">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
