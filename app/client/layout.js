'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const ADMIN_EMAILS = ['pierre@la-borne.fr', 'info@la-borne.fr'];

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const simulating = localStorage.getItem('adminSimulating') === 'true';
    setIsSimulating(simulating);

    if (simulating) {
      // Mode simulation — pas besoin de vérifier Firebase Auth
      const email = localStorage.getItem('clientEmail');
      if (email) setUser({ email });
      return;
    }

    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = '/';
      else if (ADMIN_EMAILS.includes(u.email)) window.location.href = '/admin';
      else {
        localStorage.setItem('clientEmail', u.email);
        setUser(u);
      }
    });
    return () => unsub();
  }, []);

  function returnToAdmin() {
    localStorage.removeItem('adminSimulating');
    localStorage.removeItem('clientEmail');
    window.location.href = '/admin';
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Bannière simulation */}
      {isSimulating && (
        <div style={{ background: '#2B5CE6', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', flexShrink: 0 }}>
          <span>👁️ Mode simulation — vous voyez l'espace de <strong>{user.email}</strong></span>
          <button
            onClick={returnToAdmin}
            style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}
          >
            ← Retour admin
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: '220px', background: '#1A1916', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: '#2B5CE6', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>LB</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>La Borne</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Espace client</div>
            </div>
          </div>
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {[
              { label: 'Tableau de bord', href: '/client' },
              { label: 'Mes bornes', href: '/client/bornes' },
              { label: 'Ma bibliothèque', href: '/client/bibliotheque' },
              { label: 'Mes demandes', href: '/client/demandes' },
              { label: 'Mon profil', href: '/client/profil' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '8px 18px', fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
                {item.label}
              </a>
            ))}
          </nav>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '8px 0' }}>
            {isSimulating ? (
              <button
                onClick={returnToAdmin}
                style={{ display: 'flex', alignItems: 'center', padding: '8px 18px', fontSize: '12px', color: '#60B8FF', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
              >
                ← Retour admin
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('clientEmail');
                  signOut(auth).then(() => window.location.href = '/');
                }}
                style={{ display: 'flex', alignItems: 'center', padding: '8px 18px', fontSize: '12px', color: 'rgba(255,255,255,.3)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#F2F1EE' }}>
          {children}
        </div>
      </div>
    </div>
  );
}