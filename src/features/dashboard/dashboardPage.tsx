'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { userService } from '@/services/userService/userService';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { propertyService } from '@/services/property/propertyService';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { PropertyCard } from '@/components/PropertyCard';
import { UserResponse } from '@/types/user';


const COLORS     = ['#2483ff', '#bfdbfe'];
const BAR_COLORS = ['#60a5fa', '#34d399', '#1a1a2e', '#93c5fd', '#c4b5fd', '#86efac'];


function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const AVATAR_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6'];




interface DashboardProps { transparent?: boolean; }

export default function Dashboard({ transparent = false }: DashboardProps) {

  const { user } = useAuth();

  const [totalUsers,         setTotalUsers]         = useState<number>(0);
  const [customerChartData,  setCustomerChartData]  = useState([
    { name: 'Usuários',  value: 0 },
    { name: 'Restante',  value: 1 },
  ]);
  const [loadingUsers,       setLoadingUsers]        = useState(true);
  const [properties,         setProperties]          = useState<any[]>([]);
  const [loadingProperties,  setLoadingProperties]   = useState(true);
  const [imoveisDisponiveis, setImoveisDisponiveis] = useState<number>(0);
  const [imoveisIndisponiveis, setImoveisIndisponiveis] = useState<number>(0);
  const [barData, setBarData] = useState<{ name: string; value: number }[]>([]);
  const [contacts, setContacts] = useState<UserResponse[]>([]);

  useEffect(() => {
    async function fetchProperties() {
      if (!user?.id) return;
      try {

        const data = await propertyService.getPropertiesByUserId(user.id);
        console.log(data)
        setProperties(Array.isArray(data.content) ? data.content.slice(0, 3) : []);
        
        const disponiveis: any = data.content.filter((im : any) => im.status == "ACTIVE");
        const indisponiveis: any = data.content.filter((im : any) => im.status == "PLACED" || im.status == "PAUSED" || im.status == "PENDING");
        setImoveisDisponiveis( disponiveis.length);
        setImoveisIndisponiveis(indisponiveis.length);

        setCustomerChartData([
          {
            name: 'Disponíveis',
            value: data.content.length > 0 ? Math.round((disponiveis.length / data.content.length) * 100) : 0,
          },
          {
            name: 'Indisponíveis',
            value: data.content.length > 0 ? Math.round((indisponiveis.length / data.content.length) * 100) : 0,
          },
        ]);

        const top6 = [...data.content]
          .sort((a: any, b: any) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
          .slice(0, 6)
          .map((p: any) => ({
            name: p.title?.slice(0, 12) ?? 'Imóvel', 
            value: p.viewCount ?? 0,
          }));

        setBarData(top6);

      } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
      } finally {
        setLoadingProperties(false);
        setLoadingUsers(false); 
      }
    }
    fetchProperties();
  }, [user]);

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
        }
        setContacts(listUsersChats);
        
      } catch (err) {
        console.error("Erro ao buscar admins:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchContatos();
  }, [user?.role]);

  
  return (
    <div className="pg">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pg {
          background: #f4f6fb;
          min-height: 100vh;
        }

        .wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 3rem;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a1a2e;
          margin-bottom: 1.25rem;
        }

        
        .card {
          background: #fff;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.04);
        }

        .card-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #1a1a2e;
        }

        
        .views-card { margin-bottom: 1.25rem; }

        .views-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .views-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #2483ff;
          font-weight: 600;
        }

        .views-legend-dot {
          width: 10px; height: 10px;
          background:#2483ff;
          border-radius: 50%;
        }

        .views-count {
          font-size: 1.3rem;
          font-weight: 800;
          color: #1a1a2e;
          margin-bottom: 0.75rem;
        }

        .views-count small {
          font-size: 0.78rem;
          color: #888;
          font-weight: 400;
          margin-left: 6px;
        }

        .toggle-group { display: flex; gap: 6px; }

        .toggle-btn {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fff;
          padding: 4px 12px;
          font-size: 0.75rem;
          cursor: pointer;
          color: #888;
        }

        .toggle-btn.active {
          background: #2483ff;
          color: #fff;
          border-color:rgb(27, 124, 252);
        }

       
        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

       
        .pie-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 160px;
        }

        .pie-stats {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          margin-top: 0.75rem;
        }

        .pie-stat { text-align: center; }

        .pie-stat-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1a1a2e;
          display: block;
        }

        .pie-stat-label {
          font-size: 0.72rem;
          color: #888;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: center;
          margin-top: 2px;
        }

        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        
        .row-2-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .link-all {
          font-size: 0.78rem;
          color: #2483ff;
          text-decoration: none;
          font-weight: 500;
        }

        
        .prop-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #f4f4f4;
        }

        .prop-item:last-child { border-bottom: none; }

        .prop-thumb {
          width: 64px; height: 52px;
          border-radius: 8px;
          flex-shrink: 0;
          background: #e9ecef;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          overflow: hidden;
        }

        .prop-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .prop-info { flex: 1; min-width: 0; }

        .prop-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #1a1a2e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prop-location {
          font-size: 0.75rem;
          color: #888;
          margin: 2px 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prop-meta {
          display: flex;
          gap: 8px;
          font-size: 0.72rem;
          color: #aaa;
          flex-wrap: wrap;
          align-items: center;
        }

        .status-badge {
          font-size: 0.68rem;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
          background: #e0e7ff;
          color: #2483ff;
        }

        .prop-price {
          font-size: 0.78rem;
          font-weight: 600;
          color: #2483ff;
          white-space: nowrap;
          text-align: right;
          flex-shrink: 0;
          align-self: center;
        }

       
        .msg-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f4f4f4;
        }

        .msg-item:last-child { border-bottom: none; }

        .msg-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700;
          color: #fff; flex-shrink: 0;
        }

        .msg-info { flex: 1; }

        .msg-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .msg-time { font-size: 0.72rem; color: #aaa; }

        .msg-btn {
          border: none;
          border-radius: 8px;
          padding: 5px 14px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
        }

        .btn-blue  { 
          background:rgba(190, 207, 243, 0.91); 
          color: rgb(85, 142, 248); 
        }

        
        .skeleton {
          background: linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }

        .props-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .props-list :global(.property-card) {
          display: flex;
          flex-direction: row !important;
          height: 90px !important;
          min-height: unset !important;
        }

        .props-list :global(.card-image-container) {
          width: 100px !important;
          height: 90px !important;
          flex-shrink: 0 !important;
          border-radius: 10px 0 0 10px !important;
        }

        .props-list :global(.card-img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        .props-list :global(.card-content) {
          flex: 1 !important;
          padding: 8px 12px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          gap: 4px !important;
        }

        .props-list :global(.card-actions-grid) {
          display: none !important;
        }

        .props-list :global(.card-features) {
          display: none !important;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .row-2, .row-2-bottom { grid-template-columns: 1fr; }
          .wrap { padding: 5rem 1rem 2rem; }
        }
      `}</style>

      <Header />

      <div className="wrap">
        <h1 className="page-title">Dashboard</h1>

        {/* <div className="card views-card">
          <div className="views-header">
            <div className="views-legend">
            <div className="views-legend-dot" />
              Visualizações
            </div>
            {/* <div className="toggle-group">
              <button className="toggle-btn active">Mês</button>
            </div> 
          </div>

          <div className="views-count">
            730 Visualizações <small>Total</small>
          </div>

          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#ccc" tick={{ fontSize: 11 }} />
                <YAxis stroke="#ccc" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2483ff"
                  strokeWidth={2.5}
                  fill="#2483ff"
                  fillOpacity={0.12}
                  dot={false}
                  activeDot={{ r: 5, fill: '#2483ff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        
        <div className="row-2">

          <div className="card">
            <p className="card-title" style={{ marginBottom: '0.5rem' }}>Imóveis</p>
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerChartData}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {customerChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pie-stats">
              <div className="pie-stat">
                {loadingUsers
                  ? <div className="skeleton" style={{ width: 60, height: 28, margin: '0 auto' }} />
                  : <span className="pie-stat-value">{imoveisDisponiveis}</span>
                }
                <span className="pie-stat-label">
                  <i className="dot" style={{ background: '#2483ff' }} /> Disponíveis
                </span>
              </div>
              <div className="pie-stat">
                {loadingUsers
                  ? <div className="skeleton" style={{ width: 60, height: 28, margin: '0 auto' }} />
                  : <span className="pie-stat-value">{imoveisIndisponiveis}</span>
                }
                <span className="pie-stat-label">
                  <i className="dot" style={{ background: '#e0e7ff' }} /> Indisponíveis
                </span>
              </div>
            </div>
          </div>

          {/* <div className="card">
            <p className="card-title" style={{ marginBottom: '0.75rem' }}>Os mais visualizados</p>
            <div style={{ height: 225 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={28} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                   dataKey="name"
                   axisLine={false}       
                   tickLine={false}       
                   tick={{ fontSize: 9, fill: '#888' }}
                   interval={0}
                   angle={-15}
                   textAnchor="end"
                   height={40}
                />
                <YAxis
                  axisLine={false}       
                  tickLine={false}        
                  tick={{ fontSize: 9, fill: '#888' }}  
                  domain={[0, 100000]}
                  ticks={[1000, 10000, 50000, 100000]}
                />
                 <Tooltip formatter={(v: any) => [`${v.toLocaleString('pt-BR')} views`]} />
                 <Bar dataKey="value" fill="#2483ff" radius={[6,6,0,0]} > 
                 {barData.map((_: any, i: number) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                 </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div> */}

        </div>

        
        <div className="row-2-bottom">

          <div className="card">
            <div className="section-header">
              <p className="card-title">Listagem dos Imóveis</p>
              <a href="/ads/my-properties" className="link-all">Ver Todos</a>
            </div>

            {loadingProperties ? (
              [1,2,3].map(i => (
                <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12, marginBottom: 12 }} />
              ))
            ) : properties.length === 0 ? (
              <p style={{ color:'#bbb', fontSize:'0.82rem', textAlign:'center', padding:'1.5rem 0' }}>
                Nenhum imóvel cadastrado.
              </p>
            ) : (
              <div className="props-list">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id ?? p.propertyId}
                    property={p}
                    onUpdateSuccess={() => propertyService.getPropertiesByUserId(String(user?.id)).then(data => setProperties(data.content? data.content.slice(0, 3) : []))}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-header">
              <p className="card-title">Mensagens Recentes</p>
              <a href="/chat" className="link-all">Ver Todos</a>
            </div>

            {contacts.slice(0, 4).map((m, i) => (
              <div key={m.userId} className="msg-item">
                <div
                  className="msg-avatar"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {getInitials(m.name)}
                </div>
                <div className="msg-info">
                  <div className="msg-name">{m.name}</div>
                </div>
               
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}