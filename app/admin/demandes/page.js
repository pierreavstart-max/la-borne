'use client';
import { useState, useEffect } from 'react';
import { getDemandes, updateDemande, addNotification } from '../../lib/db';

export default function DemandesPage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDemandes(); }, []);

  async function loadDemandes() {
    setLoading(true);
    const data = await getDemandes();
    setDemandes(data);
    setLoading(false);
  }

  async function handleAction(demande, action) {
    const statut = action === 'approve' ? 'Approuvée' : 'Refusée';
    await updateDemande(demande.id, { statut });

    // Crée une notification pour le client
    await addNotification({
      clientEmail: demande.clientEmail,
      type: statut,
      titre: statut === 'Approuvée' ? 'Demande approuvée' : 'Demande refusée',
      message: statut === 'Approuvée'
        ? `Votre communication « ${demande.nom} » a été approuvée.`
        : `Votre demande pour « ${demande.nom} » a été refusée.`,
      lu: false,
    });

    await loadDemandes();
  }

  const statutStyle = (s) => ({
    'En attente': {bg:'#FDF3E3', color:'#9A5E0A'},
    'Approuvée':  {bg:'#E6F5ED', color:'#18865A'},
    'Refusée':    {bg:'#FCEAEA', color:'#C02B2B'},
  }[s] || {bg:'#F7F6F3', color:'#6B6860'});

  return (
    <div style={{padding:'24px'}}>
      <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
          Demandes
        </div>
        {loading ? (
          <div style={{padding:'40px',textAlign:'center',color:'#A8A69F',fontSize:'12px'}}>Chargement…</div>
        ) : demandes.length === 0 ? (
          <div style={{padding:'40px',textAlign:'center',color:'#A8A69F',fontSize:'12px'}}>Aucune demande.</div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F7F6F3'}}>
                {['Client','Communication','Type','Date','Statut','Actions'].map(h => (
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'600',borderBottom:'1px solid #E4E2DC'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demandes.map(d => {
                const st = statutStyle(d.statut);
                return (
                  <tr key={d.id} style={{borderBottom:'1px solid #E4E2DC'}}
                    onMouseEnter={e => e.currentTarget.style.background='#F7F6F3'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}
                  >
                    <td style={{padding:'11px 12px',fontWeight:'500',fontSize:'13px',color:'#1A1916'}}>{d.clientNom}</td>
                    <td style={{padding:'11px 12px',fontSize:'12px',color:'#6B6860'}}>{d.nom}</td>
                    <td style={{padding:'11px 12px'}}>
                      <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#F0ECFB',color:'#5B3DB8'}}>{d.type}</span>
                    </td>
                    <td style={{padding:'11px 12px',fontSize:'11px',color:'#A8A69F'}}>
                      {d.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '—'}
                    </td>
                    <td style={{padding:'11px 12px'}}>
                      <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:st.bg,color:st.color}}>{d.statut}</span>
                    </td>
                    <td style={{padding:'11px 12px'}}>
                      {d.statut === 'En attente' ? (
                        <div style={{display:'flex',gap:'4px'}}>
                          <button
                            onClick={() => handleAction(d, 'approve')}
                            style={{padding:'3px 10px',background:'#E6F5ED',color:'#18865A',border:'1px solid #AADBC5',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:'500'}}
                          >✓ Approuver</button>
                          <button
                            onClick={() => handleAction(d, 'refuse')}
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
        )}
      </div>
    </div>
  );
}