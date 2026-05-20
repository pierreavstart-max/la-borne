'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const ADMIN_EMAILS = ['pierre@la-borne.fr', 'info@la-borne.fr'];

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = '/';
      else if (ADMIN_EMAILS.includes(u.email)) window.location.href = '/admin';
      else setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) return null;

  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'DM Sans, sans-serif'}}>
      {/* Sidebar */}
      <div style={{width:'220px',background:'#1A1916',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'16px 18px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'28px',background:'#2B5CE6',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:'#fff'}}>LB</div>
          <div>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#fff'}}>La Borne</div>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.04em'}}>Espace client</div>
          </div>
        </div>
        <nav style={{flex:1,padding:'8px 0'}}>
          {[
            {label:'Tableau de bord', href:'/client'},
            {label:'Mes bornes',      href:'/client/bornes'},
            {label:'Ma bibliothèque', href:'/client/bibliotheque'},
            {label:'Mes demandes',    href:'/client/demandes'},
            {label:'Mon profil',      href:'/client/profil'},
          ].map(item => (
            <a key={item.href} href={item.href} style={{display:'flex',alignItems:'center',padding:'8px 18px',fontSize:'12px',color:'rgba(255,255,255,.5)',textDecoration:'none'}}>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{borderTop:'1px solid rgba(255,255,255,.07)',padding:'8px 0'}}>
          <button
            onClick={() => signOut(auth).then(() => window.location.href = '/')}
            style={{display:'flex',alignItems:'center',padding:'8px 18px',fontSize:'12px',color:'rgba(255,255,255,.3)',background:'none',border:'none',cursor:'pointer',width:'100%',fontFamily:'inherit'}}
          >
            Déconnexion
          </button>
        </div>
      </div>
      {/* Main */}
      <div style={{flex:1,overflow:'auto',background:'#F2F1EE'}}>
        {children}
      </div>
    </div>
  );
}