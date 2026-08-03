import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

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
  LogOut,
  Users,
  ClipboardCheck,
  ShieldCheck,
  Settings,
  UserRound
} from "lucide-react";

// Komponen shadcn
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = ({ className, isMobile = false, isCollapsed = false, role = 'admin', jabatan = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // Clear localStorage & state
    navigate('/'); // Redirect ke homepage
  };

  const isPengurus = role === 'admin' || role === 'dkm';
  const canSeeZakatSettings = isPengurus;
  const profilePath = isPengurus ? '/admin/profile' : '/dashboard/profile';
  const isProfileActive = location.pathname === profilePath;

  // Menu berdasarkan role
  const menuItems = isPengurus ? [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      to: "/admin",
      active: location.pathname === "/admin"
    },
    {
      title: "Kegiatan",
      icon: <Calendar className="h-5 w-5" />,
      to: "/admin/activities",
      active: location.pathname === "/admin/activities"
    },
    {
      title: "Kas",
      icon: <DollarSign className="h-5 w-5" />,
      to: "/admin/cash",
      active: location.pathname === "/admin/cash"
    },
    {
      title: "Verifikasi Transaksi",
      icon: <ClipboardCheck className="h-5 w-5" />,
      to: "/admin/transaction-verification",
      active: location.pathname === "/admin/transaction-verification"
    },
    {
      title: "Transparansi Dana",
      icon: <ShieldCheck className="h-5 w-5" />,
      to: "/admin/transparency",
      active: location.pathname === "/admin/transparency"
    },
    {
      title: "Donasi",
      icon: <FileDown className="h-5 w-5" />,
      to: "/admin/donations",
      active: location.pathname === "/admin/donations"
    },
    {
      title: "Manajemen User",
      icon: <Users className="h-5 w-5" />,
      to: "/admin/users",
      active: location.pathname === "/admin/users"
    }
  ].concat(canSeeZakatSettings ? [
    {
      title: "Setting Zakat",
      icon: <Settings className="h-5 w-5" />,
      to: "/admin/zakat-settings",
      active: location.pathname === "/admin/zakat-settings"
    }
  ] : []) : [
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
      title: "Donasi",
      icon: <Heart className="h-5 w-5" />,
      to: "/dashboard/donation-programs",
      active: location.pathname === "/dashboard/donation-programs"
    },
    {
      title: "Kegiatan",
      icon: <Calendar className="h-5 w-5" />,
      to: "/dashboard/activities",
      active: location.pathname === "/dashboard/activities"
    },
    {
      title: "History Donasi",
      icon: <History className="h-5 w-5" />,
      to: "/dashboard/contribution-history",
      active: location.pathname === "/dashboard/contribution-history"
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
              <p className="text-sm text-gray-500 capitalize">{jabatan || role}</p>
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

      <div className="px-2 pt-2 border-t">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={profilePath}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                      isProfileActive
                        ? "bg-green-100 text-green-600"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    <UserRound className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Profil
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleLogout}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Keluar
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <div className="space-y-2">
            <Link
              to={profilePath}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isProfileActive
                  ? "bg-green-100 text-green-600 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <UserRound className="h-5 w-5" />
              <span>Profil</span>
            </Link>
            <Button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Untuk tampilan mobile menggunakan Sheet dari shadcn
  if (isMobile) {
    return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="p-2 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </Button>
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
