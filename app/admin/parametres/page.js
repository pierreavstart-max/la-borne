'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function ParametresPage() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {id:1, dest:'ODCVL', titre:'Mise à jour de la plateforme', contenu:'La plateforme sera en maintenance samedi de 22h à 6h.', date:'10.05.2026'},
    {id:2, dest:'Odcvl La Mauselaine', titre:'Nouvelle fonctionnalité', contenu:'Vous pouvez désormais synchroniser vos bornes.', date:'08.05.2026'},
  ]);

  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgDest, setMsgDest] = useState('');
  const [msgTitre, setMsgTitre] = useState('');
  const [msgContenu, setMsgContenu] = useState('');

  async function handlePwdChange(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPwd !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (newPwd.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      setSuccess('Mot de passe modifié avec succès.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setError('Mot de passe actuel incorrect.');
    } finally {
      setLoading(false);
    }
  }

  function sendMessage() {
    if (!msgDest || !msgTitre || !msgContenu) return;
    setMessages(prev => [{
      id: Date.now(),
      dest: msgDest,
      titre: msgTitre,
      contenu: msgContenu,
      date: new Date().toLocaleDateString('fr-FR'),
    }, ...prev]);
    setMsgDest(''); setMsgTitre(''); setMsgContenu('');
    setShowMsgForm(false);
  }

  const cardStyle = {background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',marginBottom:'14px',overflow:'hidden'};
  const inputStyle = {width:'100%',padding:'8px 11px',fontSize:'12px',border:'1px solid #CCC9C0',borderRadius:'6px',fontFamily:'inherit'};
  const labelStyle = {fontSize:'10px',fontWeight:'600',color:'#6B6860',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'4px',display:'block'};

  return (
    <div style={{padding:'24px',maxWidth:'560px'}}>

      {/* Mot de passe */}
      <div style={cardStyle}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
          🔒 Modifier le mot de passe
        </div>
        <form onSubmit={handlePwdChange} style={{padding:'16px'}}>
          {error && <div style={{padding:'8px 12px',background:'#FCEAEA',border:'1px solid #EABABA',borderRadius:'6px',fontSize:'11px',color:'#C02B2B',marginBottom:'12px'}}>{error}</div>}
          {success && <div style={{padding:'8px 12px',background:'#E6F5ED',border:'1px solid #AADBC5',borderRadius:'6px',fontSize:'11px',color:'#18865A',marginBottom:'12px'}}>{success}</div>}
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Mot de passe actuel</label>
            <input type="password" value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Confirmation</label>
            <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button type="submit" disabled={loading} style={{padding:'8px 16px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>

      {/* Messages */}
      <div style={cardStyle}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>📢 Messages aux clients</span>
          <button onClick={() => setShowMsgForm(!showMsgForm)} style={{padding:'5px 12px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'11px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit'}}>
            + Nouveau message
          </button>
        </div>

        {showMsgForm && (
          <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',background:'#F7F6F3'}}>
            <div style={{marginBottom:'8px'}}>
              <label style={labelStyle}>Destinataire</label>
              <select value={msgDest} onChange={e=>setMsgDest(e.target.value)} style={inputStyle}>
                <option value="">— Choisir</option>
                <option value="Tous les clients">Tous les clients</option>
                <option value="ODCVL">Rôle — ODCVL</option>
                <option value="Établissement">Rôle — Établissement</option>
                <option value="Odcvl La Mauselaine">Odcvl La Mauselaine</option>
                <option value="Institut du Beau-Joly">Institut du Beau-Joly</option>
              </select>
            </div>
            <div style={{marginBottom:'8px'}}>
              <label style={labelStyle}>Titre</label>
              <input value={msgTitre} onChange={e=>setMsgTitre(e.target.value)} style={inputStyle} placeholder="Ex : Maintenance prévue"/>
            </div>
            <div style={{marginBottom:'10px'}}>
              <label style={labelStyle}>Contenu</label>
              <textarea value={msgContenu} onChange={e=>setMsgContenu(e.target.value)} style={{...inputStyle,minHeight:'60px',resize:'vertical'}} placeholder="Votre message…"/>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
              <button onClick={() => setShowMsgForm(false)} style={{padding:'6px 12px',background:'#fff',border:'1px solid #E4E2DC',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit'}}>Annuler</button>
              <button onClick={sendMessage} style={{padding:'6px 12px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'11px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit'}}>Envoyer</button>
            </div>
          </div>
        )}

        <div style={{padding:'14px 16px'}}>
          {messages.map(m => (
            <div key={m.id} style={{padding:'10px 12px',background:'#F7F6F3',border:'1px solid #E4E2DC',borderRadius:'6px',marginBottom:'8px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'3px'}}>
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#EBF0FD',color:'#1A3DB8'}}>{m.dest}</span>
                  <span style={{fontSize:'10px',color:'#A8A69F'}}>{m.date}</span>
                </div>
                <div style={{fontSize:'12px',fontWeight:'500',color:'#1A1916'}}>{m.titre}</div>
                <div style={{fontSize:'11px',color:'#6B6860',marginTop:'2px'}}>{m.contenu}</div>
              </div>
              <button onClick={() => setMessages(prev => prev.filter(x => x.id !== m.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#A8A69F',fontSize:'16px',padding:'0',lineHeight:1}}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}