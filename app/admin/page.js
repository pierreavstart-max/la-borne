'use client';
import { useState, useEffect } from 'react';
import { getClients, getBornes, getDemandes } from '../lib/db';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../components/BornesMap'), { ssr: false });

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0, bornes: 0, bornesEnLigne: 0, demandesEnAttente: 0,
  });
  const [clients, setClients] = useState([]);
  const [bornes, setBornes] = useState([]);
  const [ibDevices, setIbDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [clientsData, bornesData, demandesData, devicesRes] = await Promise.all([
        getClients(),
        getBornes(),
        getDemandes(),
        fetch('/api/infobeamer/devices').then(r => r.json()),
      ]);
      const devices = devicesRes.devices || [];
      setClients(clientsData);
      setBornes(bornesData);
      setIbDevices(devices);
      setStats({
        clients: clientsData.length,
        bornes: bornesData.length,
        bornesEnLigne: bornesData.filter(b => {
          const device = devices.find(d => d.id === b.ibDeviceId);
          return device ? device.is_online : b.statut === 'En ligne';
        }).length,
        demandesEnAttente: demandesData.filter(d => d.statut === 'En attente' && !d.archived).length,
      });
      setLoading(false);
    }
    loadData();
  }, []);

  function getBornesWithGeo() {
    return bornes
      .map(b => {
        const device = ibDevices.find(d => d.id === b.ibDeviceId);
        if (!device?.geo) return null;
        return {
          ...b,
          lat: device.geo.lat,
          lon: device.geo.lon,
          isOnline: device.is_online,
          deviceName: device.description,
        };
      })
      .filter(Boolean);
  }

  const statCards = [
    { label: 'Clients', value: stats.clients, sub: 'enregistrés' },
    { label: 'Bornes actives', value: stats.bornes, sub: `${stats.bornesEnLigne} en ligne` },
    { label: 'Communications', value: '—', sub: 'à connecter' },
    { label: 'Demandes', value: stats.demandesEnAttente, sub: 'En attente', subColor: stats.demandesEnAttente > 0 ? '#9A5E0A' : '#A8A69F' },
  ];

  return (
    <div style={{ padding: '24px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '500', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1A1916', letterSpacing: '-.02em', lineHeight: 1 }}>
              {loading ? '…' : s.value}
            </div>
            <div style={{ fontSize: '10px', color: s.subColor || '#A8A69F', marginTop: '4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Carte + Clients récents */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', marginBottom: '14px' }}>

        {/* Carte */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
            📍 Position des bornes
          </div>
          <div style={{ height: '340px' }}>
            {!loading && <MapComponent bornes={getBornesWithGeo()} />}
          </div>
        </div>

        {/* Clients récents */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Clients récents</span>
            <a href="/admin/clients" style={{ fontSize: '11px', color: '#2B5CE6', textDecoration: 'none' }}>Voir tous →</a>
          </div>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>
          ) : clients.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Aucun client</div>
          ) : clients.slice(0, 5).map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid #E4E2DC' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E1F5EE', color: '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                {(c.prenom?.[0] || '') + (c.nom?.[0] || '')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.prenom} {c.nom}</div>
                <div style={{ fontSize: '10px', color: '#A8A69F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.societe}</div>
              </div>
              <span style={{ fontSize: '9px', fontWeight: '600', padding: '2px 6px', borderRadius: '20px', background: c.statut === 'Actif' ? '#E6F5ED' : '#FDF3E3', color: c.statut === 'Actif' ? '#18865A' : '#9A5E0A', flexShrink: 0 }}>
                {c.statut}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* État des bornes */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>État des bornes</span>
          <a href="/admin/bornes" style={{ fontSize: '11px', color: '#2B5CE6', textDecoration: 'none' }}>Voir toutes →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#A8A69F', fontSize: '12px', gridColumn: '1/-1' }}>Chargement…</div>
          ) : bornes.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#A8A69F', fontSize: '12px', gridColumn: '1/-1' }}>Aucune borne</div>
          ) : bornes.map(b => {
            const device = ibDevices.find(d => d.id === b.ibDeviceId);
            const isOnline = device ? device.is_online : b.statut === 'En ligne';
            return (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderBottom: '1px solid #E4E2DC', borderRight: '1px solid #E4E2DC' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#1D9E75' : '#E24B4A', boxShadow: isOnline ? '0 0 0 3px rgba(29,158,117,.15)' : 'none', flexShrink: 0 }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.nom}</div>
                  <div style={{ fontSize: '10px', color: '#A8A69F' }}>{b.client}</div>
                </div>
                <span style={{ fontSize: '9px', fontWeight: '600', padding: '2px 6px', borderRadius: '20px', background: isOnline ? '#E6F5ED' : '#FCEAEA', color: isOnline ? '#18865A' : '#C02B2B', flexShrink: 0 }}>
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}