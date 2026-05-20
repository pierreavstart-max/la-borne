'use client';
import { useState } from 'react';

const CLIENTS = [
  {initials:'IB',bg:'#E6F1FB',color:'#0C447C',name:'Institut du Beau-Joly',ville:'Mirecourt',contact:'Camille Miclo',email:'camille@beau-joly.fr',role:'Établissement',bornes:'1 borne',commu:3,statut:'Actif',statutColor:'#18865A',statutBg:'#E6F5ED'},
  {initials:'OL',bg:'#E1F5EE',color:'#085041',name:'Odcvl La Mauselaine',ville:'Gérardmer',contact:'Juliette Perrin',email:'mauselaine@odcvl.org',role:'ODCVL',bornes:'2 bornes',commu:5,statut:'Actif',statutColor:'#18865A',statutBg:'#E6F5ED'},
  {initials:'OP',bg:'#FAEEDA',color:'#412402',name:'Odcvl Pont Du Metty',ville:'La Bresse',contact:'Martine Vaxelaire',email:'martine@odcvl.org',role:'ODCVL',bornes:'1 borne',commu:0,statut:'Essai',statutColor:'#9A5E0A',statutBg:'#FDF3E3'},
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{padding:'24px'}}>
      {/* Barre de recherche */}
      <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher client, contact…"
          style={{flex:1,padding:'8px 12px',fontSize:'12px',border:'1px solid #E4E2DC',borderRadius:'6px',fontFamily:'inherit'}}
        />
        <button style={{padding:'8px 14px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit'}}>
          + Nouveau client
        </button>
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#F7F6F3'}}>
              {['Client','Contact','Rôle','Borne(s)','Commu.','Statut',''].map(h => (
                <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'600',borderBottom:'1px solid #E4E2DC'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.name} style={{borderBottom:'1px solid #E4E2DC',cursor:'pointer'}}
                onMouseEnter={e => e.currentTarget.style.background='#F7F6F3'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}
              >
                <td style={{padding:'11px 12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'50%',background:c.bg,color:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'700',flexShrink:0}}>{c.initials}</div>
                    <div>
                      <div style={{fontWeight:'500',fontSize:'13px',color:'#1A1916'}}>{c.name}</div>
                      <div style={{fontSize:'10px',color:'#A8A69F'}}>{c.ville}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'11px 12px'}}>
                  <div style={{fontSize:'12px',color:'#1A1916'}}>{c.contact}</div>
                  <div style={{fontSize:'10px',color:'#A8A69F'}}>{c.email}</div>
                </td>
                <td style={{padding:'11px 12px'}}><span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#EBF0FD',color:'#1A3DB8'}}>{c.role}</span></td>
                <td style={{padding:'11px 12px'}}><span style={{fontFamily:'monospace',fontSize:'10px',background:'#F7F6F3',border:'1px solid #E4E2DC',padding:'2px 7px',borderRadius:'4px'}}>{c.bornes}</span></td>
                <td style={{padding:'11px 12px'}}><span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#EBF0FD',color:'#1A3DB8'}}>{c.commu}</span></td>
                <td style={{padding:'11px 12px'}}><span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:c.statutBg,color:c.statutColor}}>{c.statut}</span></td>
                <td style={{padding:'11px 12px'}}>
                  <button style={{background:'none',border:'1px solid #E4E2DC',borderRadius:'6px',padding:'3px 8px',cursor:'pointer',fontSize:'11px',color:'#6B6860'}}>Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}