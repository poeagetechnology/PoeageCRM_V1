import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  UserCog,
  CreditCard,
  LogOut,
  Settings,
  Bell,
  Zap,
  BarChart2,
  User,
  Clock,
  History,
} from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { authService } from "@/services/authService";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  { to: "/dashboard", icon: <LayoutDashboard size={17} />, label: "Dashboard" },
  { to: "/clients", icon: <Users size={17} />, label: "Clients" },
  { to: "/projects", icon: <Briefcase size={17} />, label: "Projects" },
  { to: "/tasks", icon: <CheckSquare size={17} />, label: "Tasks" },
  { to: "/employees", icon: <UserCog size={17} />, label: "Employees" },
  { to: "/payroll", icon: <CreditCard size={17} />, label: "Payroll" },
  { to: "/reports", icon: <BarChart2 size={17} />, label: "Reports" },
  { to: "/punch-in-out", icon: <Clock size={17} />, label: "Punch In/Out" },
  {
    to: "/attendance-history",
    icon: <History size={17} />,
    label: "Attendance",
  },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authService.signOut();
    logout();
    navigate("/signin");
  };

  return (
    <aside className="w-60 shrink-0 h-screen bg-sidebar border-r border-white/5 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-blue">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <div className="font-display font-bold text-theme text-sm leading-none">
              PoeageCRM
            </div>
            <div className="text-theme-faint text-xs mt-0.5">Workspace</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <div className="text-theme-faint text-xs font-medium uppercase tracking-widest px-3 mb-2">
          Menu
        </div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn("sidebar-link", isActive && "active")
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="text-theme-faint text-xs font-medium uppercase tracking-widest px-3 mb-2 mt-6">
          System
        </div>
        <button className="sidebar-link">
          <Bell size={17} />
          Notifications
          <span className="ml-auto bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>
        <NavLink
          to="/profile"
          className={({ isActive }) => cn("sidebar-link", isActive && "active")}
        >
          <User size={17} />
          Profile & Settings
        </NavLink>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
          <Avatar
            name={user?.displayName || "User"}
            url={user?.photoURL}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-theme-muted truncate">
              {user?.displayName || "User"}
            </div>
            <div className="text-xs text-theme-faint truncate">
              {user?.role || "member"}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger text-theme-faint transition-all"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
