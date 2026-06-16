'use client';
import { useState, useEffect } from 'react';
import { getNotifications, deleteNotification, getMessages, getBornes, getDemandesClient, getFaq, getClients } from '../lib/db';

export default function ClientDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ bornes: 0, comms: 0, enAttente: 0 });
  const [faqItems, setFaqItems] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('clientEmail');
    if (!email) return;

    getFaq().then(items => setFaqItems(items));

    getNotifications(email).then(notifs => setNotifications(notifs));

    Promise.all([getMessages(), getClients()]).then(([msgs, allClients]) => {
      const currentClient = allClients.find(c => c.email === email);
      const clientRoles = currentClient?.roles && currentClient.roles.length > 0
        ? currentClient.roles
        : (currentClient?.role ? [currentClient.role] : []);

      const filtered = msgs
        .filter(m =>
          m.destType === 'tous' ||
          (m.destType === 'client' && m.dest === email) ||
          (m.destType === 'role' && clientRoles.includes(m.dest))
        )
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
      setMessages(filtered);
    });

    Promise.all([getBornes(), getDemandesClient(email)]).then(([allBornes, demandes]) => {
      const clientBornes = allBornes.filter(b => b.clientEmail === email);
      const approuvees = demandes.filter(d => d.statut === 'Approuvée' && !d.archived);
      const enAttente = demandes.filter(d => d.statut === 'En attente' && !d.archived);
      setStats({
        bornes: clientBornes.length,
        comms: approuvees.length,
        enAttente: enAttente.length,
      });
    });
  }, []);

  async function dismissNotif(id) {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const statCards = [
    { label: 'Bornes', value: stats.bornes, sub: 'assignées' },
    { label: 'Communications', value: stats.comms, sub: 'approuvées', subColor: '#18865A' },
    { label: 'En attente', value: stats.enAttente, sub: 'à traiter', subColor: stats.enAttente > 0 ? '#9A5E0A' : '#A8A69F' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Bienvenue */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
            🏠 Bienvenue
          </div>
          <div style={{ padding: '16px' }}>

            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '10px 12px',
                background: n.type === 'Approuvée' ? '#E6F5ED' : '#FCEAEA',
                border: `1px solid ${n.type === 'Approuvée' ? '#AADBC5' : '#EABABA'}`,
                borderRadius: '6px', marginBottom: '8px',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                  {n.type === 'Approuvée' ? '✅' : '❌'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: n.type === 'Approuvée' ? '#18865A' : '#C02B2B', marginBottom: '2px' }}>
                    {n.titre}
                  </div>
                  <div style={{ fontSize: '11px', color: n.type === 'Approuvée' ? '#18865A' : '#C02B2B', opacity: .85 }}>
                    {n.message}
                  </div>
                </div>
                <button
                  onClick={() => dismissNotif(n.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: n.type === 'Approuvée' ? '#18865A' : '#C02B2B', padding: '0', lineHeight: 1, flexShrink: 0 }}
                >×</button>
              </div>
            ))}

            {messages.map(m => (
              <div key={m.id} style={{
                padding: '10px 12px', background: '#EBF0FD',
                border: '1px solid #C5D8F8', borderRadius: '6px',
                marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>📢</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1A3DB8', marginBottom: '2px' }}>{m.titre}</div>
                  <div style={{ fontSize: '11px', color: '#1A3DB8', opacity: .85 }}>{m.contenu}</div>
                </div>
              </div>
            ))}

            <p style={{ fontSize: '12px', color: '#6B6860', lineHeight: 1.6, marginBottom: '14px' }}>
              Depuis cet espace, gérez les visuels affichés sur vos bornes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginTop: '10px' }}>
              {statCards.map(s => (
                <div key={s.label} style={{ background: '#F7F6F3', border: '1px solid #E4E2DC', borderRadius: '8px', padding: '9px 11px' }}>
                  <div style={{ fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '500', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1A1916', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: s.subColor || '#A8A69F', marginTop: '3px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <a href="/client/bornes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px', padding: '9px', background: '#2B5CE6', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>
              📺 Gérer mes bornes
            </a>
          </div>
        </div>

        {/* Mode d'emploi */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
            ❓ Mode d'emploi
          </div>
          <div style={{ padding: '4px 16px' }}>
            {faqItems.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#A8A69F', fontSize: '11px' }}>
                Aucune entrée disponible
              </div>
            ) : faqItems.map(item => (
              <div key={item.id}>
                <div
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E4E2DC', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '11px', color: '#2B5CE6', fontWeight: '500' }}>{item.question}</span>
                  <span style={{ color: '#A8A69F', fontSize: '12px', transition: 'transform .2s', transform: openFaq === item.id ? 'rotate(90deg)' : 'none' }}>›</span>
                </div>
                {openFaq === item.id && (
                  <div style={{ padding: '10px 0 12px', fontSize: '11px', color: '#6B6860', lineHeight: 1.6, borderBottom: '1px solid #E4E2DC' }}>
                    {item.reponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}