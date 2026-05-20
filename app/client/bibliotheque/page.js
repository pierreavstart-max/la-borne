'use client';
import { useState } from 'react';

const ITEMS_INITIAUX = [
  {id:1, nom:'Bienvenue Noël 2025', type:'draft', media:'Image', bg:'linear-gradient(160deg,#185FA5,#0F4C2A)', modifie:'14.05'},
  {id:2, nom:'Présentation générale', type:'template', media:'Vidéo', bg:'linear-gradient(160deg,#1f1f2e,#5B3DB8)', modifie:'10.05'},
  {id:3, nom:'Menu semaine — été', type:'draft', media:'Image', bg:'linear-gradient(160deg,#8B1A1A,#B45309)', modifie:'02.05'},
  {id:4, nom:'Activités de la semaine', type:'template', media:'Image', bg:'linear-gradient(160deg,#0F4C2A,#18865A)', modifie:'28.04'},
];

const badgeStyle = (type) => type === 'draft'
  ? {bg:'#FDF3E3', color:'#9A5E0A', label:'✏️ Brouillon'}
  : {bg:'#E6F5ED', color:'#18865A', label:'🔖 Modèle'};

export default function BibliothequePage() {
  const [items, setItems] = useState(ITEMS_INITIAUX);
  const [filtre, setFiltre] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = items.filter(i => {
    const matchFiltre = filtre === 'all' || i.type === filtre;
    const matchSearch = i.nom.toLowerCase().includes(search.toLowerCase());
    return matchFiltre && matchSearch;
  });

  function dupliquer(item) {
    const copie = {...item, id: Date.now(), nom: item.nom + ' (copie)', type: 'draft'};
    setItems(prev => [...prev, copie]);
  }

  function supprimer(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const filtres = [
    {key:'all',      label:'Toutes'},
    {key:'draft',    label:'Brouillons'},
    {key:'template', label:'Modèles'},
  ];

  return (
    <div style={{padding:'24px'}}>
      <p style={{fontSize:'12px',color:'#6B6860',marginBottom:'16px',lineHeight:1.6}}>
        Sauvegardez vos communications pour les réutiliser, les modifier ou les dupliquer.
      </p>

      {/* Filtres */}
      <div style={{display:'flex',gap:'8px',marginBottom:'14px',alignItems:'center'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          style={{flex:1,padding:'8px 12px',fontSize:'12px',border:'1px solid #E4E2DC',borderRadius:'6px',fontFamily:'inherit'}}
        />
        <div style={{display:'flex',background:'#F7F6F3',border:'1px solid #E4E2DC',borderRadius:'6px',overflow:'hidden'}}>
          {filtres.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)} style={{
              padding:'6px 14px',fontSize:'11px',fontWeight:'500',cursor:'pointer',
              border:'none',fontFamily:'inherit',
              background: filtre===f.key ? '#2B5CE6' : 'transparent',
              color: filtre===f.key ? '#fff' : '#6B6860',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
        {filtered.map(item => {
          const badge = badgeStyle(item.type);
          return (
            <div key={item.id} style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
              {/* Vignette */}
              <div style={{height:'150px',background:item.bg,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#fff',textAlign:'center',padding:'10px'}}>{item.nom}</div>
                {/* Overlay */}
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.55)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'6px',opacity:0,transition:'opacity .15s'}}
                  onMouseEnter={e => e.currentTarget.style.opacity=1}
                  onMouseLeave={e => e.currentTarget.style.opacity=0}
                >
                  <div style={{display:'flex',gap:'6px'}}>
                    <button style={{padding:'5px 10px',background:'rgba(255,255,255,.92)',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}>
                      ✏️ Modifier
                    </button>
                    <button style={{padding:'5px 10px',background:'#EBF0FD',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500',color:'#2B5CE6'}}>
                      📤 Publier
                    </button>
                  </div>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button onClick={() => dupliquer(item)} style={{padding:'5px 10px',background:'rgba(255,255,255,.92)',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}>
                      📋 Dupliquer
                    </button>
                    <button onClick={() => supprimer(item.id)} style={{padding:'5px 10px',background:'#FCEAEA',border:'none',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500',color:'#C02B2B'}}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div style={{padding:'9px 12px',borderTop:'1px solid #E4E2DC'}}>
                <div style={{fontSize:'12px',fontWeight:'500',color:'#1A1916',marginBottom:'3px'}}>{item.nom}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'10px',color:'#A8A69F'}}>{item.media} · Modifié {item.modifie}</span>
                  <span style={{fontSize:'9px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:badge.bg,color:badge.color}}>{badge.label}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Créer */}
        <div style={{
          border:'1.5px dashed #CCC9C0',borderRadius:'10px',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          gap:'6px',cursor:'pointer',minHeight:'200px',background:'#fff',transition:'all .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#2B5CE6'; e.currentTarget.style.background='#EBF0FD'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#CCC9C0'; e.currentTarget.style.background='#fff'; }}
        >
          <span style={{fontSize:'24px',color:'#A8A69F'}}>🔖</span>
          <span style={{fontSize:'12px',color:'#6B6860',fontWeight:'500'}}>Créer et sauvegarder</span>
          <span style={{fontSize:'10px',color:'#A8A69F'}}>Image · Vidéo · Brouillon ou Modèle</span>
        </div>
      </div>
    </div>
  );
}