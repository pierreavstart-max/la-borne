'use client';
import { useState } from 'react';

const BORNES = [
  {
    id: 1,
    nom: 'La Mauselaine',
    adresse: '25 Chemin du Rond Faing — 88400 Gérardmer',
    orient: 'Portrait',
    format: '1080×1920 px',
    statut: 'En ligne',
    communications: [
      {nom:'Bienvenue', type:'Image', statut:'Diffusée', bg:'linear-gradient(160deg,#1a3a5c,#2d7a4f)'},
      {nom:'Présentation', type:'Vidéo', statut:'Diffusée', bg:'linear-gradient(160deg,#1f1f2e,#3a1f5c)'},
      {nom:'Menu semaine', type:'Image', statut:'En attente', bg:'linear-gradient(160deg,#8B1A1A,#C0392B)'},
    ]
  },
  {
    id: 2,
    nom: 'Artimont',
    adresse: '8 Vouille des Brimbelles — 88250 La Bresse',
    orient: 'Paysage',
    format: '1920×1080 px',
    statut: 'En ligne',
    communications: [
      {nom:'Activités', type:'Image', statut:'Diffusée', bg:'linear-gradient(135deg,#0F4C2A,#185FA5)'},
      {nom:'Menu du jour', type:'Image', statut:'Diffusée', bg:'linear-gradient(135deg,#5B3DB8,#C02B2B)'},
    ]
  },
];

const statutStyle = (s) => ({
  'Diffusée':   {bg:'#E6F5ED', color:'#18865A'},
  'En attente': {bg:'#FDF3E3', color:'#9A5E0A'},
  'Refusée':    {bg:'#FCEAEA', color:'#C02B2B'},
}[s] || {bg:'#F7F6F3', color:'#6B6860'});

export default function BornesClientPage() {
  const [activeTab, setActiveTab] = useState(0);
  const borne = BORNES[activeTab];

  return (
    <div style={{padding:'24px'}}>

      {/* Onglets */}
      <div style={{display:'flex',gap:'8px',marginBottom:'16px',alignItems:'center'}}>
        {BORNES.map((b, i) => (
          <button key={b.id} onClick={() => setActiveTab(i)} style={{
            display:'flex',alignItems:'center',gap:'6px',
            padding:'6px 14px',borderRadius:'6px',fontSize:'12px',fontWeight:'500',
            cursor:'pointer',border:'1px solid',fontFamily:'inherit',
            background: activeTab===i ? '#2B5CE6' : '#fff',
            color: activeTab===i ? '#fff' : '#1A1916',
            borderColor: activeTab===i ? '#2B5CE6' : '#E4E2DC',
          }}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1D9E75',flexShrink:0}}></div>
            Borne {i+1} — {b.nom}
          </button>
        ))}
      </div>

      {/* Header borne */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',marginBottom:'14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1D9E75',boxShadow:'0 0 0 3px rgba(29,158,117,.15)'}}></div>
          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>{borne.nom}</div>
            <div style={{fontSize:'10px',color:'#A8A69F'}}>{borne.adresse}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#F0ECFB',color:'#5B3DB8'}}>
            {borne.orient} · {borne.format}
          </span>
          <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#E6F5ED',color:'#18865A'}}>
            {borne.statut}
          </span>
        </div>
      </div>

      {/* Header communications */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
        <div style={{fontSize:'10px',fontWeight:'600',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.06em'}}>
          Communications
        </div>
        <div style={{fontSize:'10px',padding:'5px 10px',background:'#EBF0FD',border:'1px solid #C5D8F8',borderRadius:'6px',color:'#1A3DB8'}}>
          Format : <strong>{borne.format}</strong>
        </div>
      </div>

      {/* Grille communications */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
        {borne.communications.map(c => {
          const st = statutStyle(c.statut);
          return (
            <div key={c.nom} style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
              {/* Vignette */}
              <div style={{
                height: borne.orient==='Portrait' ? '150px' : '90px',
                background: c.bg,
                position:'relative',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#fff',textAlign:'center',padding:'10px'}}>{c.nom}</div>
                {/* Overlay au hover */}
                <div className="commu-overlay" style={{
                  position:'absolute',inset:0,
                  background:'rgba(0,0,0,.55)',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
                  opacity:0,transition:'opacity .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity=1}
                  onMouseLeave={e => e.currentTarget.style.opacity=0}
                >
                  <button style={{padding:'5px 10px',background:'rgba(255,255,255,.92)',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}>
                    ✏️ Modifier
                  </button>
                  <button style={{padding:'5px 10px',background:'rgba(255,255,255,.92)',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}>
                    🔖
                  </button>
                  <button style={{padding:'5px 10px',background:'#FCEAEA',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500',color:'#C02B2B'}}>
                    🗑️
                  </button>
                </div>
              </div>
              {/* Footer */}
              <div style={{padding:'9px 12px',borderTop:'1px solid #E4E2DC'}}>
                <div style={{fontSize:'12px',fontWeight:'500',color:'#1A1916',marginBottom:'3px'}}>{c.nom}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'10px',color:'#A8A69F'}}>{c.type}</span>
                  <span style={{fontSize:'9px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:st.bg,color:st.color}}>{c.statut}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Ajouter */}
        <div style={{
          border:'1.5px dashed #CCC9C0',borderRadius:'10px',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          gap:'6px',cursor:'pointer',minHeight:'200px',
          transition:'all .15s',background:'#fff',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#2B5CE6'; e.currentTarget.style.background='#EBF0FD'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#CCC9C0'; e.currentTarget.style.background='#fff'; }}
        >
          <span style={{fontSize:'24px',color:'#A8A69F'}}>+</span>
          <span style={{fontSize:'12px',color:'#6B6860',fontWeight:'500'}}>Demander une communication</span>
          <span style={{fontSize:'10px',color:'#A8A69F'}}>Soumis à approbation admin</span>
        </div>
      </div>
    </div>
  );
}