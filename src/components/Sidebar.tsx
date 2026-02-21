import { motion } from "framer-motion";
import { LayoutDashboard, Warehouse, Heart, MessagesSquare, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {

  const router = useRouter();

  const [menuItems, setMenuItems] = useState([
    { name: "Dashboard", url: '/dashboard', icon: LayoutDashboard, active: true },
    { name: "Imóveis", url: '/imoveis', icon: Warehouse, active: false },
    { name: "Chats", url: '/chats', icon: MessagesSquare, active: false }
  ]);

  const toggleActive = (index:any, url:string) => {
    const updatedItems = menuItems.map((item, i) => ({
      ...item,
      active: i === index 
    }));
    setMenuItems(updatedItems);

    router.push(url);
  };


  return (
    <div className="w-full flex flex-col p-2"> 
      <nav className="flex flex-col gap-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleActive(index, item.url)}
              style={{
                backgroundColor: item.active ?  '#e5eeff' : 'white',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className={`flex items-center px-3 py-4 rounded-2xl cursor-pointer transition-all duration-200 `}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-medium text-sm" > {item.name}</span>
              </div>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}