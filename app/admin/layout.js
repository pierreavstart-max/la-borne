'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { getDemandes, getClients, getDemandesArchivees } from '../lib/db';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [demandesCount, setDemandesCount] = useState(0);
  const [assetsCount, setAssetsCount] = useState(0);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = '/';
      else setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadCounts() {
      const [demandes, archives] = await Promise.all([
        getDemandes(),
        getDemandesArchivees(),
      ]);
      setDemandesCount(demandes.filter(d => d.statut === 'En attente' && !d.archived).length);
      setAssetsCount(archives.filter(d => d.ibAssetId && d.supprimerIb !== true).length);
    }
    loadCounts();
    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function openClientPicker() {
    const data = await getClients();
    setClients(data);
    setShowClientPicker(true);
  }

  function simulateClient(client) {
    localStorage.setItem('clientEmail', client.email);
    localStorage.setItem('adminSimulating', 'true');
    window.location.href = '/client';
  }

  const filtered = clients.filter(c =>
    (c.prenom + ' ' + c.nom + ' ' + c.societe + ' ' + c.email)
      .toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { label: 'Dashboard',       href: '/admin' },
    { label: 'Clients',         href: '/admin/clients' },
    { label: 'Bornes',          href: '/admin/bornes' },
    { label: 'Communications',  href: '/admin/communications', badge: assetsCount },
    { label: 'Demandes',        href: '/admin/demandes', badge: demandesCount },
    { label: 'Paramètres',      href: '/admin/parametres' },
  ];

  if (!user) return null;

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
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <a key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 18px', fontSize: '12px', textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
                background: isActive ? 'rgba(255,255,255,.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #2B5CE6' : '2px solid transparent',
              }}>
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{ background: '#C02B2B', color: '#fff', borderRadius: '20px', fontSize: '10px', fontWeight: '700', padding: '1px 7px', minWidth: '18px', textAlign: 'center' }}>
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Bouton Vue client */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <button
            onClick={openClientPicker}
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(43,92,230,.3)', color: '#fff', border: '1px solid rgba(43,92,230,.5)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}
          >
            👁️ Vue client
          </button>
        </div>

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

      {/* Modal sélecteur client */}
      {showClientPicker && (
        <div
          onClick={() => setShowClientPicker(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '12px', width: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }}
          >
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #E4E2DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1916' }}>Simuler un espace client</div>
              <button onClick={() => setShowClientPicker(false)} style={{ background: 'none', border: '1px solid #E4E2DC', borderRadius: '6px', cursor: 'pointer', width: '28px', height: '28px', fontSize: '16px', color: '#6B6860' }}>×</button>
            </div>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #E4E2DC' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un client…"
                style={{ width: '100%', padding: '8px 11px', fontSize: '12px', border: '1px solid #CCC9C0', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916' }}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Aucun client trouvé</div>
              ) : filtered.map(c => (
                <div
                  key={c.id}
                  onClick={() => simulateClient(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderBottom: '1px solid #E4E2DC', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#E1F5EE', color: '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                    {(c.prenom?.[0] || '') + (c.nom?.[0] || '')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1916' }}>{c.prenom} {c.nom}</div>
                    <div style={{ fontSize: '10px', color: '#A8A69F' }}>{c.societe} · {c.email}</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#EBF0FD', color: '#1A3DB8' }}>{c.role}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid #E4E2DC', background: '#F7F6F3', fontSize: '10px', color: '#A8A69F' }}>
              Vous restez connecté en tant qu'admin — cette vue simule ce que le client voit.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}