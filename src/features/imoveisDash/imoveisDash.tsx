"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from "@/lib/auth/useAuth";
import { propertyService } from "@/services/property/propertyService";
import { PropertyCard } from "@/components/PropertyCard";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';

export default function DashboardProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

useEffect(() => {
    async function fetchProperties() {
      if (!user?.id) return;
      try {
        const role = user.role as string;
        
        if (role === 'TENANT') {
          setProperties([]);
          setLoading(false);
          return;
        }

        const data = await propertyService.getPropertiesByUserId(user.id);
        
        setProperties(data?.content || []);

      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [user, refreshCounter]);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="loading-spinner" />
        </div>
      );
    }

    if (properties.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum imóvel cadastrado</p>
          <p style={{ fontSize: '0.875rem' }}>Seus imóveis aparecerão aqui.</p>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {properties.map((property, index) => {
          if (!property) return null;
          const key = property.id || property.propertyId || `prop-${index}`;
          return (
            <PropertyCard
              key={key}
              property={property}
              onUpdateSuccess={() => setRefreshCounter(prev => prev + 1)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        .dashboard-container {
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

      <Header />

      <div className="dashboard-container">
        <div className="layout">

          <div className="sidebar-container">
            <Sidebar />
          </div>

          <div className="content-container">
            {renderContent()}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}