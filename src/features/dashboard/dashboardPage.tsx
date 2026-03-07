'use client';

import Header from '@/components/Header';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { userService } from '@/services/userService/userService';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { propertyService } from '@/services/property/propertyService';

const salesData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 4500 },
  { month: 'May', value: 6000 },
  { month: 'Jun', value: 5500 },
  { month: 'Jul', value: 7000 },
];


const analyticsData = [
  { month: 'Jan', line1: 4000, line2: 1500 },
  { month: 'Feb', line1: 3500, line2: 2500 },
  { month: 'Mar', line1: 3000, line2: 3000 },
  { month: 'Apr', line1: 3500, line2: 1500 },
  { month: 'May', line1: 4000, line2: 3800 },
  { month: 'Jun', line1: 4500, line2: 4200 },
];


const customerData = [
  { name: 'Segment A', value: 34249 },
  { name: 'Segment B', value: 14201 },
];

const COLORS = ['#6366f1', '#e0e7ff'];


const listedProperties = [
  {
    id: 1,
    name: 'James Reed',
    location: 'California, USA',
    date: '20 Dec',
    rating: 4.5,
    reviews: 40,
    image: '🏠',
  },
  {
    id: 2,
    name: 'Sarah Martin',
    location: 'New York, USA',
    date: '18 Dec',
    rating: 4.8,
    reviews: 52,
    image: '🏢',
  },
];


const bookingResources = [
  { id: 1, name: 'Carla Daniela', role: 'Owner', image: '👩‍🦰' },
  { id: 2, name: 'Inês', role: 'Owner', image: '👩‍🦰' },
  { id: 3, name: 'Everton', role: 'Admin', image: '👨‍💼' },
  { id: 4, name: 'Lucas', role: 'Realtor', image: '👨‍💼' },
  { id: 5, name: 'Genilson', role: 'Tenant', image: '👨‍💼' },
  { id: 6, name: 'Luan', role: 'Admin', image: '👨‍💼' },
];


const propertyIcon = (type: string) => {
  const icons: Record<string, string> = {
    HOUSE: '🏠',
    APARTMENT: '🏢',
    COMMERCIAL: '🏪',
    LAND: '🌿',
  };
  return icons[type] ?? '🏠';
};

const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};


interface HeaderProps {
  transparent?: boolean;
}

export default function Dashboard({ transparent = false }: HeaderProps) {
  
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [customerChartData, setCustomerChartData] = useState([
    { name: 'Usuários', value: 0 },
    { name: 'Restante', value: 1 },
  ]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);


  useEffect(() => {
    async function fetchUsers() {
      try {
        const total = await userService.getTotalCount();

        setTotalUsers(total);

        const potencial = Math.round(total * 0.3);
        setCustomerChartData([
          { name: 'Usuários Cadastrados', value: total },
          { name: 'Potenciais',           value: potencial || 1 },
        ]);
      } catch (error) {
        console.error('Erro ao buscar total de usuários:', error);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchProperties() {
      if (!user?.id) return;
      try {
        const data = await propertyService.getByUser(user.id);
        setProperties(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
      } finally {
        setLoadingProperties(false);
      }
    }
    fetchProperties();
  }, [user]);
  
  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-container {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .dashboard-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: -0.02em;
        }

        .dashboard-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.95rem;
          width: 250px;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .search-input:focus {
          outline: none;
          border-color:rgb(36, 131, 255);
          box-shadow: 0 0 0 3px rgba(80, 176, 255, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg,rgb(36, 131, 255) 0%,rgb(70, 152, 229) 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(99, 161, 241, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 138, 241, 0.4);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .card-link {
          color:rgb(0, 153, 255);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .card-link:hover {
          color:rgb(0, 153, 255);
        }

        .stats-section {
          display: flex;
          justify-content: space-around;
          margin-top: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #1a1a2e;
          display: block;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .chart-container {
          height: 200px;
          margin-top: 1rem;
        }

        .pie-chart-container {
          height: 180px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .property-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .property-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .property-item:hover {
          background: #e9ecef;
        }

        .property-image {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          background: linear-gradient(135deg,rgb(99, 165, 241) 0%,rgb(49, 171, 241) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .property-details {
          flex: 1;
        }

        .property-name {
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 0.25rem;
        }

        .property-location {
          font-size: 0.875rem;
          color: #666;
        }

        .property-date {
          font-size: 0.875rem;
          color: #999;
          margin-right: 1rem;
        }

        .property-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .rating-star {
          color: #fbbf24;
        }

        .booking-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .booking-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .booking-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .booking-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg,rgb(72, 143, 236) 0%,rgb(50, 166, 243) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
        }

        .booking-name {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 0.9rem;
        }

        .booking-role {
          font-size: 0.8rem;
          color: #666;
        }

        .btn-booking {
          background:rgb(99, 156, 241);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-booking:hover {
          background:rgb(70, 179, 229);
          transform: scale(1.05);
        }

        .workbook-section {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          margin-bottom: 1.5rem;
          margin-top: 3.5rem;
        }

        .workbook-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
       
        }
        
        .title-dash {
         display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          margin-top: 4rem;
        }

        .workbook-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .workbook-stats {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .workbook-stat {
          text-align: center;
        }

        .workbook-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color:rgb(99, 172, 241);
        }

        .workbook-stat-label {
          font-size: 0.875rem;
          color: #666;
        }

        .card-full-width {
          grid-column: 1 / -1;
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .dashboard-actions {
            width: 100%;
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          animation: fadeInUp 0.6s ease-out;
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
        .card:nth-child(4) { animation-delay: 0.4s; }
        .card:nth-child(5) { animation-delay: 0.5s; }
        
        .minha-imagem {
          width: 100px;   /* largura fixa */
          height: 100px;  /* altura fixa */
          }


        .layout {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }
        .sidebar-container {
          width: 260px;
          border-radius: 20px;
          padding: 1.5rem;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          height: fit-content;
        }

         .content-container {
          flex: 1;
          background: #fff;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
     

      `}</style>

      <Header></Header>
      <div className='layout'>
      <div className='sidebar-container'><Sidebar /></div>
      <div className='content-container'>
        <div className="title-dash"><h1>Dashboard</h1></div>
        <div className="workbook-section">

          <div className="workbook-header">

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6'
                }}></div>
              </div>
              Visualizações
            </h2>
            <div className="workbook-stats">
              <div className="workbook-stat">
                <div className="workbook-stat-value">120</div>
                <div className="workbook-stat-label">Total Views</div>
              </div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Area
                  type="natural"
                  dataKey="value"
                  stroke="#1E90FF"
                  strokeWidth={3}
                  fill="#1E90FF"
                  fillOpacity={0.2}
                  dot={{ fill: '#1E90FF', r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="dashboard-grid">

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Clientes</h3>
              </div>
              <div className="pie-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {customerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value?.toLocaleString('pt-BR'), name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="stats-section">
                <div className="stat-item">
                  {loadingUsers
                    ? <div className="stat-loading" />
                    : <span className="stat-value">{totalUsers.toLocaleString('pt-BR')}</span>
                  }
                  <span className="stat-label">Usuários Cadastrados</span>
                </div>
                <div className="stat-item">
                  {loadingUsers
                    ? <div className="stat-loading" />
                    : <span className="stat-value">{Math.round(totalUsers * 0.3).toLocaleString('pt-BR')}</span>
                  }
                  <span className="stat-label">Clientes em Potencial</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Propriedades</h3>
                <a href="/dashboardProperties" className="card-link">Todas →</a>
              </div>

              {loadingProperties ? (
                <div className="property-list">
                  {[1,2,3].map(i => <div key={i} className="skeleton skeleton-row" />)}
                </div>
              ) : properties.length === 0 ? (
                <p style={{ color: '#999', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                  Nenhum imóvel cadastrado.
                </p>
              ) : (
                <div className="property-list">
                  {properties.map((property) => {
                    const id = property.id ?? property.propertyId;
                    const photo = property.photoUrls?.[0];
                    const location = property.address
                      ? `${property.address.neighborhood}, ${property.address.city}`
                      : property.city ?? '—';

                    return (
                      <div key={id} className="property-item">

                        <div className="property-image">
                          {photo
                            ? <img src={photo} />
                            : propertyIcon(property.type)
                          }
                        </div>

                        <div className="property-details">
                          <div className="property-name">{property.title}</div>
                          <div className="property-location">{location}</div>
                        </div>

                        <div className="property-date">
                          {formatDate(property.createdAt)}
                        </div>

                        <div className="property-price">
                          {formatPrice(property.priceInCents)}
                        </div>

                        <span className={`property-status status-${property.status}`}>
                          {property.status}
                        </span>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          <div className="card card-full-width">
            <div className="card-header">
              <h3 className="card-title">Análise das Vendas</h3>
            </div>
            <div className="chart-container" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line
                    type="natural"
                    dataKey="line1"
                    stroke="#1E90FF"
                    strokeWidth={3}
                    dot={{ fill: '#1E90FF', r: 5 }}
                  />
                  <Line
                    type="natural"
                    dataKey="line2"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
     </div>
     <Footer></Footer>
    </div>
  );
}
