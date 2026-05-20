'use client';
import { useState } from 'react';

const BORNES = [
  {name:'Institut du Beau-Joly',ref:'beau-joly-brn-0',adresse:'557 Av. Louis Buffet, Mirecourt',client:'Institut du Beau-Joly',orient:'Portrait',statut:'En ligne'},
  {name:'Odcvl La Mauselaine',ref:'mauselaine-brn-0',adresse:'25 Ch. du Rond Faing, Gérardmer',client:'Odcvl La Mauselaine',orient:'Portrait',statut:'En ligne'},
  {name:'Odcvl Artimont',ref:'artimont-brn-0',adresse:'8 Vouille des Brimbelles, La Bresse',client:'Odcvl La Mauselaine',orient:'Paysage',statut:'En ligne'},
  {name:'Odcvl Épinal Siège',ref:'epinal-siege-brn-0',adresse:'Parc Roche BP 247, Épinal',client:'Odcvl Épinal',orient:'Portrait',statut:'En ligne'},
];

export default function BornesPage() {
  const [search, setSearch] = useState('');
  const filtered = BORNES.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.ref.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{padding:'24px'}}>
      <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une borne…"
          style={{flex:1,padding:'8px 12px',fontSize:'12px',border:'1px solid #E4E2DC',borderRadius:'6px',fontFamily:'inherit'}}
        />
        <button style={{padding:'8px 14px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit'}}>
          + Nouvelle borne
        </button>
      </div>

      <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#F7F6F3'}}>
              {['Borne','Référence','Adresse','Client','Orientation','Statut',''].map(h => (
                <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'600',borderBottom:'1px solid #E4E2DC'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.ref}
                style={{borderBottom:'1px solid #E4E2DC',cursor:'pointer'}}
                onMouseEnter={e => e.currentTarget.style.background='#F7F6F3'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}
              >
                <td style={{padding:'11px 12px'}}>
                  <div style={{fontWeight:'500',fontSize:'13px',color:'#1A1916'}}>{b.name}</div>
                </td>
                <td style={{padding:'11px 12px'}}>
                  <span style={{fontFamily:'monospace',fontSize:'10px',background:'#F7F6F3',border:'1px solid #E4E2DC',padding:'2px 7px',borderRadius:'4px'}}>{b.ref}</span>
                </td>
                <td style={{padding:'11px 12px',fontSize:'11px',color:'#6B6860'}}>{b.adresse}</td>
                <td style={{padding:'11px 12px',fontSize:'12px',color:'#1A1916'}}>{b.client}</td>
                <td style={{padding:'11px 12px'}}>
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:b.orient==='Portrait'?'#F0ECFB':'#F7F6F3',color:b.orient==='Portrait'?'#5B3DB8':'#6B6860'}}>
                    {b.orient}
                  </span>
                </td>
                <td style={{padding:'11px 12px'}}>
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#E6F5ED',color:'#18865A'}}>{b.statut}</span>
                </td>
                <td style={{padding:'11px 12px'}}>
                  <button style={{background:'none',border:'1px solid #E4E2DC',borderRadius:'6px',padding:'3px 8px',cursor:'pointer',fontSize:'11px',color:'#6B6860'}}>Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}