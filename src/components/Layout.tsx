import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-secondary">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
