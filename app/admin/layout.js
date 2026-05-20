'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = '/';
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
            <div style={{fontSize:'9px',color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.04em'}}>Interface admin</div>
          </div>
        </div>
        <nav style={{flex:1,padding:'8px 0'}}>
          {[
            {label:'Dashboard',href:'/admin'},
            {label:'Clients',href:'/admin/clients'},
            {label:'Bornes',href:'/admin/bornes'},
            {label:'Communications',href:'/admin/communications'},
            {label:'Demandes',href:'/admin/demandes'},
            {label:'Paramètres',href:'/admin/parametres'},
          ].map(item => (
            <a key={item.href} href={item.href} style={{display:'flex',alignItems:'center',padding:'8px 18px',fontSize:'12px',color:'rgba(255,255,255,.5)',textDecoration:'none',borderLeft:'2px solid transparent'}}>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{borderTop:'1px solid rgba(255,255,255,.07)',padding:'8px 0'}}>
          <button
            onClick={() => signOut(auth).then(() => window.location.href = '/')}
            style={{display:'flex',alignItems:'center',padding:'8px 18px',fontSize:'12px',color:'rgba(255,255,255,.3)',background:'none',border:'none',cursor:'pointer',width:'100%'}}
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