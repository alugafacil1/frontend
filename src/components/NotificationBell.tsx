"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notificationService } from "@/services/notification/notificationService";
import { useAuth } from "@/lib/auth/useAuth";

// Utilitário isolado para não poluir o componente
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
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
}

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      // Só busca se estiver autenticado e tiver o ID do usuário
      if (!isAuthenticated || !user?.id) return; 
      
      try {
        // 4. Usa o novo método passando o user.id
        const data = await notificationService.getByUser(user.id, 0, 10);
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
    else router.push(`/home`);
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
          <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notif-modal-header">
              <h2>Notificações</h2>
              <button className="close-notif-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <div className="notif-modal-body">
              {notifications.length === 0 ? (
                <p className="notif-empty-state">Nenhuma notificação por enquanto.</p>
              ) : (
                notifications.map((notif: any) => {
                  const isListing = notif.notificationType === 'LISTING' || notif.type === 'LISTING'; 
                  const isRead = notif.read || notif.isRead;

                  if (isListing) {
                    return (
                      <div 
                        key={notif.id} 
                        className={`notif-highlight ${isRead ? 'is-read' : ''}`} 
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="notif-highlight-icon">🏠</div>
                        <div className="notif-highlight-content">
                          <p className="notif-highlight-title">{notif.title}</p>
                          <p className="notif-highlight-msg">
                            {notif.message || notif.body || notif.text || "Verifique os detalhes deste anúncio."}
                          </p>
                          <button className="notif-action-text highlight-link">Ver anúncio</button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${isRead ? 'is-read' : ''}`} 
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {notif.imageUrl || notif.senderPhotoUrl ? (
                        <img src={notif.imageUrl || notif.senderPhotoUrl} alt="Avatar" className="notif-avatar" />
                      ) : (
                        <div className="notif-icon-box">💬</div>
                      )}
                      <div className="notif-content">
                        
                        {/* Linha 1: Nome e Título (ex: Maria Oliveira • Nova Mensagem) */}
                        <p className="notif-text-header">
                          {notif.senderName && <strong className="notif-sender-name">{notif.senderName}</strong>}
                          {notif.senderName && notif.title && <span className="notif-separator">•</span>}
                          <span className="notif-item-title">{notif.title}</span>
                        </p>
                        
                        {/* Linha 2: Corpo da mensagem */}
                        <p className="notif-msg-body">
                          {notif.message || notif.body || notif.text || "Nova atividade registrada. Clique para ver."}
                        </p>
                        
                        {/* Linha 3: Data e Link de ação */}
                        <div className="notif-meta">
                          <span className="notif-time">{getRelativeTime(notif.createdAt)}</span>
                          <button className="notif-action-text list-link">Ver mensagem</button>
                        </div>
                        
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}