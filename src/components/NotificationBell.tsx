"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notificationService } from "@/services/notification/notificationService";
import { useAuth } from "@/lib/auth/useAuth";

// Formatação de data
function getRelativeTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

if (diffInSeconds < 60) return 'Agora mesmo';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  }
  
  if (diffInDays < 30) {
    const semanas = Math.floor(diffInDays / 7);
    return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} atrás`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'} atrás`;
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Pega as iniciais do nome (ex: Meg Griffin -> MG)
function getInitials(name: string) {
  if (!name) return 'AF';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      if (!isAuthenticated || !user?.id) return; 
      
      try {
        const data = await notificationService.getByUser(user.id, 0, 20);
        const notifs = data.content || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.read && !n.isRead).length);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    }
    fetchNotifications();
  }, [isAuthenticated, user?.id, isModalOpen]);

  const handleMarkAsRead = async (id: string, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    const isRead = notif.read || notif.isRead;
    if (!isRead) await handleMarkAsRead(notif.id, isRead);
    
    setIsModalOpen(false);

    if (notif.propertyId) router.push(`/ads/${notif.propertyId}`);
    else if (notif.conversationId) router.push(`/chat/${notif.conversationId}`);
    else router.push(`/dashboard`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      setNotifications(prev => {
        const item = prev.find(n => n.id === id);
        if (item && !(item.read || item.isRead)) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

 const handleClearAll = async () => {
    if (!user?.id) return;
    try {
      await notificationService.deleteAllByUser(user.id); // Chama o backend
      setNotifications([]); 
      setUnreadCount(0); 
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  };

  const unreadNotifs = notifications.filter(n => !n.read && !n.isRead);
  const readNotifs = notifications.filter(n => n.read || n.isRead);

  const renderItem = (notif: any) => {
    const isRead = notif.read || notif.isRead;
    const isListing = notif.notificationType === 'LISTING' || notif.type === 'LISTING';
    const sender = notif.senderName || (isListing ? 'Sistema AlugaFácil' : 'Usuário');

    return (
      <div 
        key={notif.id} 
        className={`modern-notif-item ${!isRead ? 'unread-bg' : 'read-bg'}`}
        onClick={() => handleNotificationClick(notif)}
      >
        {!isRead && <span className="modern-unread-dot"></span>}
        
        <div className="modern-avatar">
          {notif.imageUrl || notif.senderPhotoUrl ? (
            <img src={notif.imageUrl || notif.senderPhotoUrl} alt={sender} />
          ) : (
            <div className="modern-initials">{getInitials(sender)}</div>
          )}
        </div>

        <div className="modern-notif-content">
          <p className="modern-notif-title">{notif.title}</p>
          {notif.message && <p className="modern-notif-subtitle">{notif.message}</p>}
          <span className="modern-notif-time">{getRelativeTime(notif.createdAt)}</span>
        </div>

        <button className="modern-delete-btn" onClick={(e) => handleDelete(e, notif.id)}>
          ✕
        </button>
      </div>
    );
  };

  return (
    <>
      <button className="icon-btn" onClick={() => setIsModalOpen(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isModalOpen && (
        <div className="notif-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modern-notif-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modern-notif-header">
              <h2>Notificações</h2>
              <button className="modern-clear-btn" onClick={handleClearAll}>Limpar</button>
            </div>
            
            <div className="modern-notif-body">
              {notifications.length === 0 ? (
                <p className="notif-empty-state">Nenhuma notificação por enquanto.</p>
              ) : (
                <>
                  {unreadNotifs.length > 0 && (
                    <div className="modern-notif-section">
                      <h3>Não lidas</h3>
                      {unreadNotifs.map(renderItem)}
                    </div>
                  )}

                  {readNotifs.length > 0 && (
                    <div className="modern-notif-section">
                      <h3>Recente</h3>
                      {readNotifs.map(renderItem)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}