import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "../../lib/utils";

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
  HandHeart
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
      to: "/admin/lelang",
      active: location.pathname === "/admin/lelang"
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
      to: "/zakat",
      active: location.pathname === "/zakat"
    },
    {
      title: "Crowdfunding",
      icon: <Heart className="h-5 w-5" />,
      to: "/crowdfunding",
      active: location.pathname === "/crowdfunding"
    },
    {
      title: "Kegiatan",
      icon: <Calendar className="h-5 w-5" />,
      to: "/kegiatan",
      active: location.pathname === "/kegiatan"
    },
    {
      title: "History Donasi",
      icon: <History className="h-5 w-5" />,
      to: "/history",
      active: location.pathname === "/history"
    }
  ];

  const SidebarContent = () => (
    <div className={cn(
      "flex h-full flex-col border-r bg-white py-4 transition-all duration-300", 
      isCollapsed ? "items-center" : "",
      className
    )}>
      <div className={cn(
        "mb-6",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <Home className="h-6 w-6" />
          </div>
        ) : (
          <h2 className="text-lg font-bold">
            {role === 'admin' ? 'Admin Panel' : 'Masjid Hub'}
          </h2>
        )}
      </div>

      <div className="flex-1 w-full">
        <nav className={cn(
          "grid items-start gap-1",
          isCollapsed ? "px-1 justify-items-center" : "px-2"
        )}>
          {menuItems.map((item, index) => (
            isCollapsed ? (
              <TooltipProvider key={index} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-gray-100",
                        item.active ? "bg-gray-100 text-black" : "text-gray-500"
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
                key={index}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                  item.active ? "bg-gray-100 text-black font-medium" : "text-gray-500"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            )
          ))}
        </nav>
      </div>

      <div className={cn(
        "mt-auto", 
        isCollapsed ? "px-1" : "px-4"
      )}>
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="/"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                Log Out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link 
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Log Out</span>
          </Link>
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