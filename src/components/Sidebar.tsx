"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Warehouse, MessagesSquare } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { name: "Imóveis",   url: "/imoveis",   icon: Warehouse },
  { name: "Chats",     url: "/chat",      icon: MessagesSquare },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col p-2">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item, index) => {
          const Icon     = item.icon;
          const isActive = pathname.startsWith(item.url);

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(item.url)}
              style={{
                backgroundColor: isActive ? "#e5eeff" : "white",
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              className="flex items-center px-3 py-4 rounded-2xl cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  color={isActive ? "#2483ff" : "#555"}
                />
                <span
                  className="font-medium text-sm"
                  style={{ color: isActive ? "#2483ff" : "#333" }}
                >
                  {item.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}