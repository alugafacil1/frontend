"use client";

import { useEffect, useState } from "react";
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { UserResponse } from "@/types/user";
import { userService } from "@/services/userService/userService";

const CONTACTS = [
  { id: 1, name: "Aleena Zaheer", avatar: "https://i.pravatar.cc/40?img=1", preview: "Lorem ipsum dolor sit amet," },
  { id: 2, name: "Peter Doe",     avatar: "https://i.pravatar.cc/40?img=3", preview: "Lorem ipsum dolor sit amet," },
  { id: 3, name: "Peter Doe",     avatar: "https://i.pravatar.cc/40?img=5", preview: "Lorem ipsum dolor sit amet," },
  { id: 4, name: "Saman Ali",     avatar: "https://i.pravatar.cc/40?img=7", preview: "Lorem ipsum dolor sit amet," },
];

const INITIAL_MESSAGES = [
  { id: 1, from: "other", text: "Hi, I am looking for private property.", time: "10:12 AM" },
  { id: 2, from: "me",    text: "Yes, I have this property available", time: "10:30 AM" },
];

const PROPERTY = {
  name: "John Doe",
  avatar: "https://i.pravatar.cc/80?img=3",
  room: "Ensuit Room",
  location: "Melton Road, LE4 5S5",
  price: "£440 pcm",
  weekly: "£110 pw",
  deposit: "£250 Deposit Required",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  images: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=80&h=60&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=60&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=80&h=60&fit=crop",
  ],
  beds: 3,
  baths: 2,
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#14b8a6", "#f97316",
];

export default function ChatLayout() {
  const [contacts, setContacts]         = useState<UserResponse[]>([]);
  const [loadingContacts, setLoading]   = useState(true);
  const [activeContact, setActiveContact] = useState<UserResponse | null>(null);
  const [messages, setMessages]         = useState(INITIAL_MESSAGES);
  const [input, setInput]               = useState("");
  const [search, setSearch]             = useState("");

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const page = await userService.getAll(0, 50);
        console.log(page.content)
        const admins:any = page.content.filter((u:any) => u.userType === "ADMIN");
        setContacts(admins);
        if (admins.length > 0) setActiveContact(admins[0]);
      } catch (err) {
        console.error("Erro ao buscar admins:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdmins();
  }, []);


  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now(), from: "me", text, time }]);
    setInput("");
  };

  const handleKey = (e:any) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        /* ─────────────────────────────────────────────────
           ESTRUTURA DA PÁGINA — idêntica ao dashboard
        ───────────────────────────────────────────────── */
        .dashboard-container {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding: 2rem;
        }

        .dashboard-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        /* Mesmo .layout do dashboard */
        .layout {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }

        /* Mesmo .sidebar-container do dashboard */
        .sidebar-container {
          width: 260px;
          flex-shrink: 0;
          border-radius: 20px;
          padding: 1.5rem;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          height: fit-content;
        }

        /* .content-container SEM padding — o chat gerencia internamente */
        .content-container {
          flex: 1;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          /* Altura: viewport menos header (~64px) + padding (4rem) + título (~80px) + margin-top (2rem) */
          height: calc(100vh - 240px);
          min-height: 480px;
        }

        /* ─────────────────────────────────────────────────
           CHAT ROOT — 3 colunas dentro do content-container
        ───────────────────────────────────────────────── */
        .chat-root {
          display: grid;
          grid-template-columns: 230px 1fr 210px;
          height: 100%;
          overflow: hidden;
        }

        /* ── Coluna de contatos ── */
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
          border-color: rgb(36, 131, 255);
          box-shadow: 0 0 0 3px rgba(80, 176, 255, 0.1);
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
          background: rgba(36, 131, 255, 0.07);
          border-color: rgba(36, 131, 255, 0.15);
        }
        .contact-item img {
          width: 38px; height: 38px;
          border-radius: 50%; object-fit: cover; flex-shrink: 0;
        }
        .contact-info .name  { font-size: 0.84rem; font-weight: 600; color: #1a1a2e; }
        .contact-info .preview {
          font-size: 0.75rem; color: #999;
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; max-width: 130px;
        }

        /* ── Área de mensagens ── */
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
        .chat-header img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
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

        .msg-row { display: flex; align-items: flex-end; gap: 8px; }
        .msg-row.me { flex-direction: row-reverse; }
        .msg-row img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }

        .bubble {
          max-width: 65%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.83rem;
          line-height: 1.5;
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
          border-color: rgb(36, 131, 255);
          box-shadow: 0 0 0 3px rgba(80, 176, 255, 0.1);
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
        .send-btn svg { fill: #fff; }

        /* ── Painel da propriedade ── */
        .property-panel {
          background: #f8f9fa;
          display: flex; flex-direction: column;
          padding: 1.25rem 1rem;
          gap: 1rem;
          overflow-y: auto;
        }

        .prop-profile { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .prop-profile img {
          width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
          border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,.1);
        }
        .pname { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #1a1a2e; }

        .prop-card {
          background: #fff; border-radius: 14px;
          padding: 0.875rem 1rem;
          display: flex; flex-direction: column; gap: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,.06);
          border: 1px solid rgba(0,0,0,.05);
          transition: all 0.3s;
        }
        .prop-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,.1); }
        .prop-prices { display: flex; justify-content: space-between; align-items: flex-start; }
        .prop-card .room { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; color: #1a1a2e; }
        .prop-card .loc  { font-size: 0.73rem; color: #888; }
        .price-main { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #1a1a2e; }
        .price-sub  { font-size: 0.72rem; color: #888; text-align: right; }
        .deposit-tag { font-size: 0.73rem; color: rgb(36,131,255); font-weight: 600; cursor: pointer; text-decoration: underline; }

        .prop-images { display: flex; gap: 5px; }
        .prop-images img { width: 54px; height: 42px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }

        .prop-desc { font-size: 0.74rem; color: #666; line-height: 1.55; }

        .prop-tags { display: flex; gap: 8px; }
        .prop-tag {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.73rem; color: #555; font-weight: 500;
          background: rgba(36,131,255,0.08);
          padding: 4px 10px; border-radius: 20px;
        }

        /* ── Responsivo ── */
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
                    // Skeleton enquanto carrega
                    [1,2,3,4].map((i) => (
                      <div key={i} className="skeleton skeleton-contact" />
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
                        {/* Foto real ou iniciais */}
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
                    <img src={activeContact?.photoUrl} alt={activeContact?.name} />
                    <div>
                      <div className="cname">{activeContact?.name}</div>
                      <div className="status">● Active</div>
                    </div>
                  </div>
                  <button className="icon-btn">🔍</button>
                </div>

                <div className="messages">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`msg-row${msg.from === "me" ? " me" : ""}`}>
                      {msg.from === "other" && <img src={activeContact?.photoUrl} alt="" />}
                      <div>
                        <div className={`bubble ${msg.from}`}>{msg.text}</div>
                        <div className="msg-time">{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-row">
                  <input
                    placeholder="Type Message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                  />
                  <button className="send-btn" onClick={send}>
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