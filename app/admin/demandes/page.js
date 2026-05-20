'use client';
import { useState } from 'react';

const DEMANDES_INITIALES = [
  {id:1, client:'Odcvl La Mauselaine', type:'Nouvelle commu.', description:'Menu semaine — Image', date:'15.05.2026', statut:'En attente'},
  {id:2, client:'Odcvl Artimont', type:'Nouvelle commu.', description:'Activités été — Vidéo', date:'12.05.2026', statut:'En attente'},
];

export default function DemandesPage() {
  const [demandes, setDemandes] = useState(DEMANDES_INITIALES);

  function handleAction(id, action) {
    setDemandes(prev => prev.map(d =>
      d.id === id ? {...d, statut: action === 'approve' ? 'Approuvée' : 'Refusée'} : d
    ));
  }

  const statutStyle = (s) => ({
    'En attente': {bg:'#FDF3E3',color:'#9A5E0A'},
    'Approuvée':  {bg:'#E6F5ED',color:'#18865A'},
    'Refusée':    {bg:'#FCEAEA',color:'#C02B2B'},
  }[s] || {bg:'#F7F6F3',color:'#6B6860'});

  return (
    <div style={{padding:'24px'}}>
      <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
          Demandes en attente
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#F7F6F3'}}>
              {['Client','Type','Description','Date','Statut','Actions'].map(h => (
                <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'600',borderBottom:'1px solid #E4E2DC'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demandes.map(d => {
              const st = statutStyle(d.statut);
              return (
                <tr key={d.id} style={{borderBottom:'1px solid #E4E2DC'}}>
                  <td style={{padding:'11px 12px',fontWeight:'500',fontSize:'13px',color:'#1A1916'}}>{d.client}</td>
                  <td style={{padding:'11px 12px'}}>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#F0ECFB',color:'#5B3DB8'}}>{d.type}</span>
                  </td>
                  <td style={{padding:'11px 12px',fontSize:'11px',color:'#6B6860'}}>{d.description}</td>
                  <td style={{padding:'11px 12px',fontSize:'11px',color:'#A8A69F'}}>{d.date}</td>
                  <td style={{padding:'11px 12px'}}>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:st.bg,color:st.color}}>{d.statut}</span>
                  </td>
                  <td style={{padding:'11px 12px'}}>
                    {d.statut === 'En attente' ? (
                      <div style={{display:'flex',gap:'4px'}}>
                        <button
                          onClick={() => handleAction(d.id,'approve')}
                          style={{padding:'3px 10px',background:'#E6F5ED',color:'#18865A',border:'1px solid #AADBC5',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}
                        >✓ Approuver</button>
                        <button
                          onClick={() => handleAction(d.id,'refuse')}
                          style={{padding:'3px 10px',background:'#FCEAEA',color:'#C02B2B',border:'1px solid #EABABA',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}
                        >✗ Refuser</button>
                      </div>
                    ) : (
                      <span style={{fontSize:'11px',color:'#A8A69F'}}>Traitée</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}