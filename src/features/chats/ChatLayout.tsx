"use client";

import { useEffect, useState, useRef } from "react";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { UserResponse } from "@/types/user";
import { userService } from "@/services/userService/userService";
import { db } from '../../../src/firebaseConfig.js';
import { ref, push, onValue, serverTimestamp, query, orderByChild } from "firebase/database";
import { useAuth } from "@/lib/auth/useAuth";
import { translateRole } from "@/utils/translateRoles";
import { getImageUrl } from "@/utils/formatUrl";

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

  const [contacts, setContacts] = useState<UserResponse[]>([]);
  const [loadingContacts, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState<UserResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [lastMessages, setLastMessages] = useState<Record<string, { text: string; timestamp: number; unread: boolean }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null); 
  
  useEffect(() => {
    if (!user?.role) return;
    async function fetchContatos() {
      try {
        const page = await userService.getAll(0, 50);

        let listUsersChats: any = [];

        if (user?.role === 'OWNER') {
          listUsersChats = page.content.filter((u: any) => u.userId !== user.id && (u.userType === "TENANT" || u.userType === "ADMIN"));
        } else if (user?.role === 'REALTOR') {
          listUsersChats = page.content.filter((u: any) => u.userId !== user.id && (u.userType === "TENANT" || u.userType === "AGENCY_ADMIN"));
        } else if (user?.role === 'AGENCY_ADMIN') {
          listUsersChats = page.content.filter((u: any) => u.userId !== user.id && u.userType === "REALTOR");
        } else if (user?.role === 'ADMIN') {
          listUsersChats = page.content.filter((u: any) => u.userId !== user.id);
        } else if (user?.role === 'TENANT') {
          listUsersChats = page.content.filter((u: any) => u.userId !== user.id && (u.userType === "OWNER" || u.userType === "REALTOR"));
        }

        setContacts(listUsersChats);
        if (listUsersChats.length > 0) setActiveContact(listUsersChats[0]);
      } catch (err) {
        console.error("Erro ao buscar admins:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContatos();
  }, [user?.role]);


  useEffect(() => {
    if (!user?.id || !activeContact?.userId) return;

    setLoadingMsgs(true);
    setMessages([]);

    const roomId = [user.id, activeContact.userId].sort().join("_");
    const msgsRef = query(ref(db, `chats/${roomId}/messages`), orderByChild("timestamp"));

    const unsubscribe = onValue(msgsRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Message[] = Object.entries(data).map(([id, msg]: any) => ({ id, ...msg }));
        setMessages(parsed);
      } else {
        setMessages([]);
      }
      setLoadingMsgs(false);
    });

    return () => unsubscribe();
  }, [user?.id, activeContact?.userId]);


  useEffect(() => {
    if (!user?.id || contacts.length === 0) return;

    const unsubs: (() => void)[] = [];

    contacts.forEach((contact) => {
      const roomId = [user.id, contact.userId].sort().join("_");
      const msgsRef = query(ref(db, `chats/${roomId}/messages`), orderByChild("timestamp"));

      const unsub = onValue(msgsRef, (snapshot: any) => {
        const data = snapshot.val();
        if (!data) return;

        const msgs: Message[] = Object.entries(data).map(([id, msg]: any) => ({ id, ...msg }));
        const last = msgs[msgs.length - 1];

        setLastMessages((prev) => ({
          ...prev,
          [contact.userId]: {
            text: last.text,
            timestamp: last.timestamp ?? 0,
            unread: last.senderId !== user.id && activeContact?.userId !== contact.userId,
          },
        }));
      });

      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [user?.id, contacts]);


  useEffect(() => {
    const area = messagesAreaRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [messages]);


  const send = async () => {
    const text = input.trim();
    if (!text || !user?.id || !activeContact?.userId) return;

    const roomId = [user.id, activeContact.userId].sort().join("_");
    const msgsRef = ref(db, `chats/${roomId}/messages`);

    await push(msgsRef, {
      text,
      senderId: user.id,
      senderName: user.name,
      timestamp: serverTimestamp(),
    });

    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleSelectContact = (c: UserResponse) => {
    setActiveContact(c);
    setLastMessages((prev) => ({
      ...prev,
      [c.userId]: prev[c.userId] ? { ...prev[c.userId], unread: false } : prev[c.userId],
    }));
  };

  const filtered = contacts
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const tA = lastMessages[a.userId]?.timestamp ?? 0;
      const tB = lastMessages[b.userId]?.timestamp ?? 0;
      return tB - tA;
    });

  return (
    <>
      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pg {
          background:rgb(255, 255, 255);
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        
        .wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 2rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1a1a2e;
          margin-bottom: 1.5rem;
        }

       
        .chat-shell {
          display: grid;
          grid-template-columns: 280px 1fr;
          background: #fff;
          border-radius: 5px;
          overflow: hidden;
          height: calc(100vh - 200px);
          min-height: 500px;
        }

        .contacts-col {
            background:rgb(240, 246, 250);
            display: flex;
            flex-direction: column;
            overflow: hidden;  
            border-radius: 5px;
            height: 100%;      
        }

        .contacts-search {
          padding: 1rem;
          border-bottom: 1px solidrgb(255, 255, 255);
          flex-shrink: 0;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background:rgb(255, 255, 255);
          border-radius: 10px;
          padding: 8px 12px;
          border: 1.5px solidrgb(255, 253, 253);
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: #2483ff;
        }

        .search-box input {
          border: none;
          background:rgb(255, 255, 255);
          outline: none;
          font-size: 0.83rem;
          color: #555;
          width: 100%;
        }

        .contacts-label {
          padding: 0.75rem 1rem 0.4rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          color: #aaa;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .contacts-list {
          flex: 1;
          overflow-y: auto;  
          padding: 0 0.5rem 1rem;
          min-height: 0;     
        }

        /* Skeleton */
        .skel {
          height: 60px;
          border-radius: 10px;
          margin-bottom: 4px;
          background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .contact-item:hover  { background: #f4f6fb; }

        .contact-item.active { background: #f0f6ff; }

        .avatar-img {
          width: 40px; height: 40px;
          border-radius: 50%; object-fit: cover; flex-shrink: 0;
        }

        .avatar-ini {
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700;
          color: #fff; flex-shrink: 0;
        }

        .contact-info { min-width: 0; }

        .contact-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .contact-preview {
          font-size: 0.75rem;
          color: #aaa;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .role-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 600;
          color: #2483ff;
          background: rgba(36,131,255,0.1);
          padding: 1px 6px;
          border-radius: 20px;
          margin-top: 2px;
        }

        .chat-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100%;     
          overflow: hidden;  
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
        }

        .chat-header-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        
        .messages-area {
            flex: 1;
            overflow-y: auto; 
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            min-height: 0;     
        }

        .loading-msgs, .empty-msgs {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ccc;
          font-size: 0.85rem;
          gap: 8px;
        }

        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          width: 100%;
        }

        .msg-row.me {
          flex-direction: row-reverse;
        }

        .bubble {
          max-width: 100%;
          min-width: 100px;
          width: fit-content;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 0.875rem;
          line-height: 1.5;
          word-break: break-word;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .bubble.other {
          background:rgb(218, 225, 245);
          color: #333;
          border-bottom-left-radius: 4px;
          border: 1px solid #ececec;
        }

        .bubble.me {
          background: #2483ff;
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(36,131,255,0.25);
        }

        .msg-time {
          font-size: 0.65rem;
          color: #ccc;
          margin-top: 3px;
        }

        .msg-row.me .msg-time { text-align: right; }
        .msg-row:not(.me) .msg-time { text-align: left; }

       
        .input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.875rem 1.25rem;
          flex-shrink: 0;
        }

        .input-row input {
          flex: 1;
          border: 1.5px solidrgb(243, 243, 243);
          border-radius: 5px;
          padding: 0.65rem 1rem;
          outline: none;
          font-size: 0.875rem;
          background:rgb(240, 246, 250);
          color: #333;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .input-row input:focus {
          border-color: #2483ff;
          box-shadow: 0 0 0 3px rgba(36,131,255,0.08);
        }

        .input-row input::placeholder { color: #ccc; }

        .send-btn {
          width: 40px; height: 40px;
          background: #2483ff;
          border: none;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(36,131,255,0.3);
        }

        .send-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(36,131,255,0.4); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .send-btn svg { fill: #fff; }

       
        @media (max-width: 768px) {
          .chat-shell { grid-template-columns: 1fr; }
          .contacts-col { display: none; }
          .wrap { padding: 5rem 1rem 2rem; }
        }
      `}</style>

      <Header />

      <div className="pg">
        <div className="wrap">
          <h1 className="page-title">Mensagens</h1>

          <div className="chat-shell">

            <div className="contacts-col">

              <div className="contacts-search">
                <div className="search-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    placeholder="Pesquisar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="contacts-label">Suas Mensagens</div>

              <div className="contacts-list">
                {loadingContacts ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="skel" />)
                ) : filtered.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "#bbb", textAlign: "center", padding: "1.5rem 0" }}>
                    Nenhum contato encontrado.
                  </p>
                ) : (
                  filtered.map((c, idx) => {
                    const last = lastMessages[c.userId];
                    return (
                      <div
                        key={c.userId}
                        className={`contact-item${activeContact?.userId === c.userId ? " active" : ""}`}
                        onClick={() => handleSelectContact(c)}
                      >
                        {c.photoUrl ? (
                          <img className="avatar-img" src={getImageUrl(c.photoUrl)} />
                        ) : (
                          <div className="avatar-ini" style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                            {getInitials(c.name)}
                          </div>
                        )}
                        <div className="contact-info" style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="contact-name">{c.name}</div>
                            {last?.unread && (
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2483ff", flexShrink: 0, marginLeft: 4 }} />
                            )}
                          </div>
                          <div className="contact-preview">
                            {last ? (
                              <span style={{ fontWeight: last.unread ? 700 : 400, color: last.unread ? "#333" : "#aaa" }}>
                                {last.text.length > 28 ? last.text.slice(0, 28) + "…" : last.text}
                              </span>
                            ) : (
                              <span className="role-badge">{translateRole(c.userType)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>


            <div className="chat-col">

              <div className="chat-header">
                {activeContact ? (
                  <>
                    {activeContact.photoUrl ? (
                      <img className="avatar-img" src={getImageUrl(activeContact.photoUrl)} />
                    ) : (
                      <div className="avatar-ini" style={{ background: AVATAR_COLORS[0] }}>
                        {getInitials(activeContact.name)}
                      </div>
                    )}
                    <div className="chat-header-name">{activeContact.name}</div>
                  </>
                ) : (
                  <div className="chat-header-name" style={{ color: "#ccc" }}>Selecione um contato</div>
                )}
              </div>


              {loadingMsgs ? (
                <div className="loading-msgs">Carregando mensagens…</div>
              ) : messages.length === 0 ? (
                <div className="empty-msgs">
                  <span style={{ fontSize: "2rem" }}>💬</span>
                  Nenhuma mensagem ainda. Diga olá!
                </div>
              ) : (
                <div className="messages-area" ref={messagesAreaRef}>
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const time = msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";
                    return (
                      <div key={msg.id} className={`msg-row${isMe ? " me" : ""}`}>
                        {!isMe && (
                          activeContact?.photoUrl
                            ? <img className="avatar-img" src={getImageUrl(activeContact.photoUrl)} style={{ width: 32, height: 32 }} />
                            : <div className="avatar-ini" style={{ background: AVATAR_COLORS[0], width: 32, height: 32, fontSize: "0.65rem" }}>
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


              <div className="input-row">
                <input
                  placeholder="Digite aqui..."
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
    </>
  );
}