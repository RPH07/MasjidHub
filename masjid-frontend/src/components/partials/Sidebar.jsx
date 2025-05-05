// src/components/partials/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/kegiatan", label: "Kegiatan Masjid" },
  { to: "/admin/kas", label: "Alur Kas" },
  { to: "/admin/export", label: "Rekap Excel" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow h-full">
      <div className="p-6 text-lg font-bold">MasjidHub Admin</div>
      <nav className="flex flex-col gap-1 px-4">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "px-3 py-2 rounded hover:bg-blue-100",
              location.pathname === to && "bg-blue-200 font-semibold"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
