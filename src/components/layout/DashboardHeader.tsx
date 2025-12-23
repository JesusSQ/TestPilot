"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.username || "Usuario";
  const displayRole = user?.role || "Invitado";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Bienvenido de nuevo, <span className="text-yellow-700">{displayName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-yellow-500 w-64"
          />
        </div>

        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-8 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-none">{displayName}</p>
            <p className="text-xs text-gray-500 mt-1">{displayRole}</p>
          </div>
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold border border-yellow-200">
            {displayName.charAt(0).toUpperCase()}
          </div>
          
          <button 
            onClick={handleLogout}
            className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;