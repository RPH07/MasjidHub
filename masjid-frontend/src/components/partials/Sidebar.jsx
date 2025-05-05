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
  Menu
} from "lucide-react";

// Komponen shadcn
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../components/ui/sheet";

const Sidebar = ({ className, isMobile = false }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
      active: location.pathname === "/admin"
    },
    {
      title: "Kegiatan",
      icon: <Calendar className="h-5 w-5" />,
      href: "/admin/kegiatan",
      active: location.pathname === "/admin/kegiatan"
    },
    {
      title: "Kas",
      icon: <DollarSign className="h-5 w-5" />,
      href: "/admin/kas",
      active: location.pathname === "/admin/kas"
    },
    {
      title: "Export",
      icon: <FileDown className="h-5 w-5" />,
      href: "/admin/export",
      active: location.pathname === "/admin/export"
    }
  ];

  const SidebarContent = () => (
    <div className={cn("flex h-full flex-col border-r bg-white py-4", className)}>
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>

      <div className="flex-1">
        <nav className="grid items-start px-2 gap-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                item.active ? "bg-gray-100 text-black font-medium" : "text-gray-500"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4">
        <Link 
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:text-red-600"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Log Out</span>
        </Link>
      </div>
    </div>
  );

  // Untuk tampilan mobile gunakan Sheet dari shadcn
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Untuk tampilan desktop
  return <SidebarContent />;
};

export default Sidebar;