'use client';
import { useState, useEffect } from 'react';
import { getNotifications, deleteNotification, getMessages } from '../lib/db';

export default function ClientDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem('clientEmail');
    console.log('Email depuis localStorage:', email);
    if (!email) return;
    getNotifications(email).then(notifs => {
      console.log('Notifs:', notifs);
      setNotifications(notifs);
    });
    getMessages().then(msgs => {
  const email = localStorage.getItem('clientEmail');
  // Filtre les messages destinés à ce client
  const filtered = msgs.filter(m =>
    m.destType === 'tous' ||
    (m.destType === 'client' && m.dest === email)
  );
  setMessages(filtered);
});
  }, []);

  async function dismissNotif(id) {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const stats = [
    { label: 'Total commu.', value: '5', sub: 'dont 1 en attente' },
    { label: 'Images', value: '3', sub: 'Diffusées', subColor: '#18865A' },
    { label: 'Vidéos', value: '1', sub: 'Diffusée', subColor: '#18865A' },
    { label: 'Bornes', value: '2', sub: 'En ligne', subColor: '#18865A' },
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

            {/* Notifications */}
            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '10px 12px',
                background: n.type === 'Approuvée' ? '#E6F5ED' : '#FCEAEA',
                border: `1px solid ${n.type === 'Approuvée' ? '#AADBC5' : '#EABABA'}`,
                borderRadius: '6px',
                marginBottom: '8px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
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

            {/* Messages admin */}
            {messages.map(m => (
              <div key={m.id} style={{
                padding: '10px 12px',
                background: '#EBF0FD',
                border: '1px solid #C5D8F8',
                borderRadius: '6px',
                marginBottom: '8px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
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

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' }}>
              {stats.map(s => (
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
            {[
              "Qu'est-ce qu'une communication ?",
              "Comment mettre à jour une communication ?",
              "Formats acceptés — image et vidéo",
              "Un problème ? Nous contacter",
            ].map(q => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E4E2DC', cursor: 'pointer' }}>
                <span style={{ fontSize: '11px', color: '#2B5CE6' }}>{q}</span>
                <span style={{ color: '#A8A69F', fontSize: '12px' }}>›</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}