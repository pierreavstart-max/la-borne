'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function ProfilPage() {
  const [prenom, setPrenom] = useState('Juliette');
  const [nom, setNom] = useState('Perrin');
  const [tel, setTel] = useState('0033329631194');
  const [infoSuccess, setInfoSuccess] = useState('');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function saveInfo(e) {
    e.preventDefault();
    setInfoSuccess('Informations enregistrées.');
    setTimeout(() => setInfoSuccess(''), 3000);
  }

  async function savePwd(e) {
    e.preventDefault();
    setPwdError(''); setPwdSuccess('');
    if (newPwd !== confirmPwd) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    if (newPwd.length < 8) { setPwdError('Minimum 8 caractères.'); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      setPwdSuccess('Mot de passe modifié avec succès.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch {
      setPwdError('Mot de passe actuel incorrect.');
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    background:'#fff',border:'1px solid #E4E2DC',
    borderRadius:'10px',marginBottom:'14px',overflow:'hidden'
  };
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
    <div style={{padding:'24px',maxWidth:'520px'}}>

      {/* Informations */}
      <div style={cardStyle}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
          👤 Informations personnelles
        </div>
        <form onSubmit={saveInfo} style={{padding:'16px'}}>
          {infoSuccess && (
            <div style={{padding:'8px 12px',background:'#E6F5ED',border:'1px solid #AADBC5',borderRadius:'6px',fontSize:'11px',color:'#18865A',marginBottom:'12px'}}>
              {infoSuccess}
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input value={prenom} onChange={e=>setPrenom(e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input value={nom} onChange={e=>setNom(e.target.value)} style={inputStyle}/>
            </div>
          </div>
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Email</label>
            <input value={auth.currentUser?.email || ''} style={{...inputStyle,background:'#F7F6F3',color:'#A8A69F'}} readOnly/>
          </div>
          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Téléphone</label>
            <input value={tel} onChange={e=>setTel(e.target.value)} style={inputStyle}/>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button type="submit" style={{padding:'8px 16px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Mot de passe */}
      <div style={cardStyle}>
        <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
          🔒 Modifier le mot de passe
        </div>
        <form onSubmit={savePwd} style={{padding:'16px'}}>
          {pwdError && (
            <div style={{padding:'8px 12px',background:'#FCEAEA',border:'1px solid #EABABA',borderRadius:'6px',fontSize:'11px',color:'#C02B2B',marginBottom:'12px'}}>
              {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div style={{padding:'8px 12px',background:'#E6F5ED',border:'1px solid #AADBC5',borderRadius:'6px',fontSize:'11px',color:'#18865A',marginBottom:'12px'}}>
              {pwdSuccess}
            </div>
          )}
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Mot de passe actuel *</label>
            <input type="password" value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{marginBottom:'10px'}}>
            <label style={labelStyle}>Nouveau mot de passe *</label>
            <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Confirmation *</label>
            <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button type="submit" disabled={loading} style={{padding:'8px 16px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}