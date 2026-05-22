'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { getDemandes } from '../lib/db';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [demandesCount, setDemandesCount] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = '/';
      else setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadDemandes() {
      const data = await getDemandes();
      const enAttente = data.filter(d => d.statut === 'En attente').length;
      setDemandesCount(enAttente);
    }
    loadDemandes();
    // Rafraîchit toutes les 30 secondes
    const interval = setInterval(loadDemandes, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Clients', href: '/admin/clients' },
    { label: 'Bornes', href: '/admin/bornes' },
    { label: 'Communications', href: '/admin/communications' },
    { label: 'Demandes', href: '/admin/demandes', badge: demandesCount },
    { label: 'Paramètres', href: '/admin/parametres' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '220px', background: '#1A1916', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#2B5CE6', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>LB</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>La Borne</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Interface admin</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(item => (
            <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background: '#C02B2B', color: '#fff', borderRadius: '20px', fontSize: '10px', fontWeight: '700', padding: '1px 7px', minWidth: '18px', textAlign: 'center' }}>
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '8px 0' }}>
          <button
            onClick={() => signOut(auth).then(() => window.location.href = '/')}
            style={{ display: 'flex', alignItems: 'center', padding: '8px 18px', fontSize: '12px', color: 'rgba(255,255,255,.3)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
          >
            Déconnexion
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: '#F2F1EE' }}>
        {children}
      </div>
    </div>
  );
}