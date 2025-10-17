import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Store, User, Video, Clock, DollarSign, LogOut, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/ai-tools', icon: Sparkles, label: 'AI Tools' },
  { path: '/video-editor', icon: Video, label: 'Video Editor' },
  { path: '/publish-insights', icon: Clock, label: 'Publish Insights' },
  { path: '/monetization', icon: DollarSign, label: 'Monetization' },
  { path: '/storefront', icon: Store, label: 'Storefront' },
  { path: '/help-desk', icon: HelpCircle, label: 'Help Desk' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          SochBox
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Creator Portal</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </motion.aside>
  );
};
