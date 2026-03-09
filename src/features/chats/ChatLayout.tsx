"use client";

import { useEffect, useState, useRef } from "react";
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { UserResponse } from "@/types/user";
import { userService } from "@/services/userService/userService";
import {db} from '../../../src/firebaseConfig.js'
import { ref, push, onValue, serverTimestamp, query, orderByChild } from "firebase/database";
import { useAuth } from "@/lib/auth/useAuth";



function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#14b8a6", "#f97316",
];


interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}


export default function ChatLayout() {
  const { user } = useAuth(); 

  const [contacts, setContacts]             = useState<UserResponse[]>([]);
  const [loadingContacts, setLoading]       = useState(true);
  const [activeContact, setActiveContact]   = useState<UserResponse | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [input, setInput]                   = useState("");
  const [search, setSearch]                 = useState("");
  const bottomRef                           = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    async function fetchAdmins() {
      try {
        const page = await userService.getAll(0, 50);
        let listUsersChats:any = []

        if (user?.role == 'OWNER') {
          listUsersChats = page.content.filter((u: any) => u.id !== user.id && u.userType === "TENANT");
        } else if (user?.role == 'REALTOR') {
          listUsersChats = page.content.filter((u: any) =>  u.id !== user.id && (u.userType === "TENANT" || u.userType === "AGENCY_ADMIN"));
        } else if (user?.role == 'AGENCY_ADMIN') {
          listUsersChats = page.content.filter((u: any) =>  u.id !== user.id && u.userType === "REALTOR" );
        } else if (user?.role == 'ADMIN') {
          listUsersChats = page.content.filter((u: any) =>  u.id !== user.id)
        }
      
        setContacts(listUsersChats);
        if (listUsersChats.length > 0) setActiveContact(listUsersChats[0]);
      } catch (err) {
        console.error("Erro ao buscar admins:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdmins();
  }, []);


  useEffect(() => {
    if (!user?.id || !activeContact?.userId) return;

    setLoadingMsgs(true);
    setMessages([]);

    const roomId = [user.id, activeContact.userId].sort().join("_");
    const msgsRef = query(ref(db, `chats/${roomId}/messages`), orderByChild("timestamp"));

    const unsubscribe = onValue(msgsRef, (snapshot:any) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Message[] = Object.entries(data).map(([id, msg]: any) => ({
          id,
          ...msg,
        }));
        setMessages(parsed);
      } else {
        setMessages([]);
      }
      setLoadingMsgs(false);
    });

    return () => unsubscribe();
  }, [user?.id, activeContact?.userId]);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !user?.id || !activeContact?.userId) return;

    const roomId = [user.id, activeContact.userId].sort().join("_");
    const msgsRef = ref(db, `chats/${roomId}/messages`);

    await push(msgsRef, {
      text,
      senderId:   user.id,
      senderName: user.name,
      timestamp:  serverTimestamp(),
    });

    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .dashboard-container {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding: 2rem;
        }
        .layout {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }
        .sidebar-container {
          width: 260px;
          flex-shrink: 0;
          border-radius: 20px;
          padding: 1.5rem;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          height: fit-content;
        }
        .content-container {
          flex: 1;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          overflow: hidden;
          height: calc(100vh - 240px);
          min-height: 480px;
        }

        .chat-root {
          display: grid;
          grid-template-columns: 230px 1fr 210px;
          height: 100%;
          overflow: hidden;
        }

        .chat-contacts {
          border-right: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          padding: 1.25rem 1rem;
          gap: 1rem;
          overflow-y: auto;
        }
        .chat-contacts h2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #1a1a2e;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          transition: all 0.3s;
        }
        .search-box:focus-within {
          border-color: rgb(36,131,255);
          box-shadow: 0 0 0 3px rgba(80,176,255,0.1);
        }
        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.82rem;
          color: #555;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .section-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #aaa;
          text-transform: uppercase;
        }
        .contact-list { display: flex; flex-direction: column; gap: 2px; }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .contact-item:hover { background: #f8f9fa; }
        .contact-item.active {
          background: rgba(36,131,255,0.07);
          border-color: rgba(36,131,255,0.15);
        }
        .avatar-img {
          width: 38px; height: 38px;
          border-radius: 50%; object-fit: cover; flex-shrink: 0;
        }
        .avatar-initials {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700;
          color: #fff; flex-shrink: 0;
        }
        .contact-info .name  { font-size: 0.84rem; font-weight: 600; color: #1a1a2e; }
        .role-badge {
          font-size: 0.68rem;
          font-weight: 600;
          color: rgb(36,131,255);
          background: rgba(36,131,255,0.1);
          padding: 2px 6px;
          border-radius: 20px;
        }

        .chat-area {
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f0f0f0;
          min-width: 0;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .chat-header-info { display: flex; align-items: center; gap: 10px; }
        .chat-header .avatar-img { width: 38px; height: 38px; }
        .cname { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #1a1a2e; }
        .status { font-size: 0.72rem; color: #22c55e; font-weight: 500; }
        .icon-btn { background: none; border: none; cursor: pointer; color: #ccc; font-size: 1rem; }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .loading-msgs {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bbb;
          font-size: 0.85rem;
        }
        .empty-msgs {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #ccc;
          font-size: 0.82rem;
        }

        .msg-row { 
            display: flex;
            align-items: flex-end;
            gap: 8px;
            width: 100%;    
            }
        .msg-row.me { 
          flex-direction: row-reverse; 
          justify-content: flex-start;
          }

        .bubble {
          max-width: 65%;
          min-width: 60px;          
          width: fit-content;       
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.83rem;
          line-height: 1.5;
          word-break: break-word;    
          overflow-wrap: anywhere;   
          white-space: pre-wrap;    
        }
        .bubble.other {
          background: #f8f9fa; color: #333;
          border-bottom-left-radius: 4px;
          border: 1px solid #e9ecef;
        }
        .bubble.me {
          background: linear-gradient(135deg, rgb(36,131,255) 0%, rgb(70,152,229) 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(36,131,255,0.25);
        }
        .msg-time { font-size: 0.68rem; color: #bbb; margin-top: 3px; text-align: right; }
        .msg-row:not(.me) .msg-time { text-align: left; }

        .chat-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.875rem 1.25rem;
          border-top: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .chat-input-row input {
          flex: 1;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 0.6rem 1rem;
          outline: none;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          color: #333;
          transition: all 0.3s;
        }
        .chat-input-row input:focus {
          border-color: rgb(36,131,255);
          box-shadow: 0 0 0 3px rgba(80,176,255,0.1);
        }
        .chat-input-row input::placeholder { color: #bbb; }
        .send-btn {
          background: linear-gradient(135deg, rgb(36,131,255) 0%, rgb(70,152,229) 100%);
          border: none; border-radius: 12px;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(36,131,255,0.3);
        }
        .send-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(36,131,255,0.4); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .send-btn svg { fill: #fff; }

        
        .property-panel {
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.25rem 1rem;
          gap: 8px;
          color: #ccc;
          font-size: 0.8rem;
          text-align: center;
        }
        .property-panel svg { opacity: 0.3; }

        
        @media (max-width: 1200px) {
          .chat-root { grid-template-columns: 220px 1fr; }
          .property-panel { display: none; }
        }
        @media (max-width: 900px) {
          .chat-root { grid-template-columns: 1fr; }
          .chat-contacts { display: none; }
        }
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          .sidebar-container { width: 100%; }
          .content-container { height: 480px; }
          .dashboard-container { padding: 1rem; }
        }
      `}</style>

      <Header />

      <div className="dashboard-container">
        <div className="layout">

          <div className="sidebar-container">
            <Sidebar />
          </div>

          <div className="content-container">
            <div className="chat-root">

             
              <div className="chat-contacts">
                <h2>Chats</h2>

                <div className="search-box">
                  <span style={{ color: "#aaa" }}>🔍</span>
                  <input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <span className="section-label">Administradores</span>

                <div className="contact-list">
                  {loadingContacts ? (
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} style={{
                        height: 52, borderRadius: 12,
                        background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.4s infinite",
                        marginBottom: 4,
                      }} />
                    ))
                  ) : filtered.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "#999", textAlign: "center", padding: "1rem 0" }}>
                      Nenhum admin encontrado.
                    </p>
                  ) : (
                    filtered.map((c, index) => (
                      <div
                        key={c.userId}
                        className={`contact-item${activeContact?.userId === c.userId ? " active" : ""}`}
                        onClick={() => setActiveContact(c)}
                      >
                        {c.photoUrl ? (
                          <img className="avatar-img" src={c.photoUrl} alt={c.name} />
                        ) : (
                          <div
                            className="avatar-initials"
                            style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                          >
                            {getInitials(c.name)}
                          </div>
                        )}
                        <div className="contact-info">
                          <div className="name">{c.name}</div>
                          <span className="role-badge">{c.userType}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              
              <div className="chat-area">
                <div className="chat-header">
                  <div className="chat-header-info">
                    {activeContact?.photoUrl ? (
                      <img className="avatar-img" src={activeContact.photoUrl} alt={activeContact.name} />
                    ) : (
                      <div className="avatar-initials" style={{ backgroundColor: AVATAR_COLORS[0], width: 38, height: 38 }}>
                        {activeContact ? getInitials(activeContact.name) : "?"}
                      </div>
                    )}
                    <div>
                      <div className="cname">{activeContact?.name ?? "Selecione um contato"}</div>
                      <div className="status">● Online</div>
                    </div>
                  </div>
                  <button className="icon-btn">🔍</button>
                </div>

                {loadingMsgs ? (
                  <div className="loading-msgs">Carregando mensagens…</div>
                ) : messages.length === 0 ? (
                  <div className="empty-msgs">
                    <span style={{ fontSize: "2rem" }}>💬</span>
                    Nenhuma mensagem ainda.<br />Diga olá!
                  </div>
                ) : (
                  <div className="messages">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      const time = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "";
                      return (
                        <div key={msg.id} className={`msg-row${isMe ? " me" : ""}`}>
                          {!isMe && (
                            activeContact?.photoUrl
                              ? <img className="avatar-img" src={activeContact.photoUrl} alt="" style={{ width: 28, height: 28 }} />
                              : <div className="avatar-initials" style={{ backgroundColor: AVATAR_COLORS[0], width: 28, height: 28, fontSize: "0.65rem" }}>
                                  {activeContact ? getInitials(activeContact.name) : "?"}
                                </div>
                          )}
                          <div>
                            <div className={`bubble ${isMe ? "me" : "other"}`}>{msg.text}</div>
                            <div className="msg-time">{time}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}

                <div className="chat-input-row">
                  <input
                    placeholder="Digite uma mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={!activeContact}
                  />
                  <button className="send-btn" onClick={send} disabled={!activeContact || !input.trim()}>
                    <svg viewBox="0 0 24 24" width="15" height="15">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}