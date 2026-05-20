'use client';
import { useState } from 'react';

const DEMANDES_INITIALES = [
  {id:1, nom:'Menu semaine', type:'Image', statut:'En attente', date:'15.05.2026'},
  {id:2, nom:'Présentation centre', type:'Image', statut:'Approuvée', date:'30.04.2026'},
  {id:3, nom:'Activités été', type:'Vidéo', statut:'Approuvée', date:'24.05.2024'},
];

const statutStyle = (s) => ({
  'En attente': {bg:'#FDF3E3', color:'#9A5E0A'},
  'Approuvée':  {bg:'#E6F5ED', color:'#18865A'},
  'Refusée':    {bg:'#FCEAEA', color:'#C02B2B'},
}[s] || {bg:'#F7F6F3', color:'#6B6860'});

export default function DemandesClientPage() {
  const [demandes] = useState(DEMANDES_INITIALES);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('');
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');

  function soumettre() {
    if (!type || !nom) return;
    alert('Demande envoyée — en attente d\'approbation admin.');
    setShowForm(false);
    setType(''); setNom(''); setDescription('');
  }

  const inputStyle = {
    width:'100%',padding:'8px 11px',fontSize:'12px',
    border:'1px solid #CCC9C0',borderRadius:'6px',fontFamily:'inherit'
  };
  const labelStyle = {
    fontSize:'10px',fontWeight:'600',color:'#6B6860',
    textTransform:'uppercase',letterSpacing:'.04em',
    marginBottom:'4px',display:'block'
  };

  return (
    <div style={{padding:'24px'}}>

      {/* Bouton nouvelle demande */}
      <div style={{marginBottom:'16px',display:'flex',justifyContent:'flex-end'}}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{padding:'8px 16px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}
        >
          + Nouvelle demande
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',padding:'18px',marginBottom:'16px'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'#1A1916',marginBottom:'14px'}}>
            Nouvelle demande de communication
          </div>
          <div style={{padding:'10px 12px',background:'#FDF3E3',border:'1px solid #F0C070',borderRadius:'6px',fontSize:'11px',color:'#9A5E0A',marginBottom:'14px',lineHeight:1.5}}>
            ⚠️ Chaque nouvelle communication doit être approuvée par l'administrateur avant d'être créée.
          </div>
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Type *</label>
            <select value={type} onChange={e=>setType(e.target.value)} style={inputStyle}>
              <option value="">— Choisir</option>
              <option value="Image">Image (JPG / PNG)</option>
              <option value="Vidéo">Vidéo (MP4 · max 30s · 50Mo)</option>
            </select>
          </div>
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Nom souhaité *</label>
            <input value={nom} onChange={e=>setNom(e.target.value)} style={inputStyle} placeholder="Ex : Menu semaine, Événement juillet…"/>
          </div>
          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Description (optionnel)</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} style={{...inputStyle,minHeight:'60px',resize:'vertical'}} placeholder="Décrivez brièvement ce que vous souhaitez afficher…"/>
          </div>
          <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
            <button onClick={() => setShowForm(false)} style={{padding:'7px 14px',background:'#fff',border:'1px solid #E4E2DC',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
              Annuler
            </button>
            <button onClick={soumettre} style={{padding:'7px 14px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              Envoyer la demande
            </button>
          </div>
        </div>
      )}

      {/* Liste des demandes */}
      <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
          Historique des demandes
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#F7F6F3'}}>
              {['Communication','Type','Statut','Date'].map(h => (
                <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'600',borderBottom:'1px solid #E4E2DC'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demandes.map(d => {
              const st = statutStyle(d.statut);
              return (
                <tr key={d.id} style={{borderBottom:'1px solid #E4E2DC'}}>
                  <td style={{padding:'11px 12px',fontWeight:'500',fontSize:'13px',color:'#1A1916'}}>{d.nom}</td>
                  <td style={{padding:'11px 12px'}}>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#F0ECFB',color:'#5B3DB8'}}>{d.type}</span>
                  </td>
                  <td style={{padding:'11px 12px'}}>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:st.bg,color:st.color}}>{d.statut}</span>
                  </td>
                  <td style={{padding:'11px 12px',fontSize:'11px',color:'#A8A69F'}}>{d.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}