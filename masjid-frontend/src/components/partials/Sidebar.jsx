import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth"; // ✅ TAMBAH INI

// Icons import dari Lucide React
import { 
  ChevronLeft, 
  LayoutDashboard, 
  Calendar, 
  DollarSign,
  FileDown,
  Menu,
  Home,
  Heart,
  History,
  HandHeart,
  LogOut // ✅ TAMBAH ICON LOGOUT
} from "lucide-react";

// Komponen shadcn
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

const Sidebar = ({ className, isMobile = false, isCollapsed = false, role = 'admin' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ AMBIL LOGOUT FUNCTION

  // ✅ FUNCTION HANDLE LOGOUT
  const handleLogout = () => {
    logout(); // Clear localStorage & state
    navigate('/'); // Redirect ke homepage
  };

  // Menu berdasarkan role
  const menuItems = role === 'admin' ? [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      to: "/admin",
      active: location.pathname === "/admin"
    },
    {
      title: "Kegiatan",
      icon: <Calendar className="h-5 w-5" />,
      to: "/admin/kegiatan",
      active: location.pathname === "/admin/kegiatan"
    },
    {
      title: "Kas",
      icon: <DollarSign className="h-5 w-5" />,
      to: "/admin/kas",
      active: location.pathname === "/admin/kas"
    },
    {
      title: "Export",
      icon: <FileDown className="h-5 w-5" />,
      to: "/admin/donasi",
      active: location.pathname === "/admin/donasi"
    }
  ] : [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      to: "/dashboard",
      active: location.pathname === "/dashboard"
    },
    {
      title: "Form Zakat",
      icon: <HandHeart className="h-5 w-5" />,
      to: "/dashboard/zakat",
      active: location.pathname === "/dashboard/zakat"
    },
    {
      title: "Crowdfunding",
      icon: <Heart className="h-5 w-5" />,
      to: "/dashboard/crowdfunding",
      active: location.pathname === "/dashboard/crowdfunding"
    },
    {
      title: "Kegiatan",
      icon: <Calendar className="h-5 w-5" />,
      to: "/dashboard/kegiatan",
      active: location.pathname === "/dashboard/kegiatan"
    },
    {
      title: "History Donasi",
      icon: <History className="h-5 w-5" />,
      to: "/dashboard/kontribusi-history",
      active: location.pathname === "/dashboard/kontribusi-history"
    }
  ];

  const SidebarContent = () => (
    <div className={cn(
      "flex h-full flex-col border-r bg-white py-4 transition-all duration-300", 
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="px-4 pb-2">
        {isCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
            <span className="text-lg font-bold">M</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
              <span className="text-lg font-bold">🕌</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Masjid Nurul Ilmi</h2>
              <p className="text-sm text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              {isCollapsed ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                          item.active
                            ? "bg-green-100 text-green-600"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        )}
                      >
                        {item.icon}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    item.active
                      ? "bg-green-100 text-green-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* ✅ LOGOUT BUTTON - FIX */}
      <div className="px-2 pt-2 border-t">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Keluar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        )}
      </div>
    </div>
  );

  // Untuk tampilan mobile menggunakan Sheet dari shadcn
  if (isMobile) {
    return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SidebarContent />
      </SheetContent>
    </Sheet>
    );
  }

  // Untuk tampilan desktop
  return <SidebarContent />;
};

export default Sidebar;