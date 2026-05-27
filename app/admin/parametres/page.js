'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getMessages, addMessage, deleteMessage } from '../../lib/db';

export default function ParametresPage() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgDest, setMsgDest] = useState('');
  const [msgDestType, setMsgDestType] = useState('tous');
  const [msgTitre, setMsgTitre] = useState('');
  const [msgContenu, setMsgContenu] = useState('');
  const [savingMsg, setSavingMsg] = useState(false);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    const data = await getMessages();
    setMessages(data);
  }

  async function handlePwdChange(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPwd !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (newPwd.length < 8) { setError('Minimum 8 caractères.'); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      setSuccess('Mot de passe modifié avec succès.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch {
      setError('Mot de passe actuel incorrect.');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!msgTitre || !msgContenu) return;
    setSavingMsg(true);
    await addMessage({
      dest: msgDestType === 'tous' ? 'Tous les clients' : msgDest,
      destType: msgDestType,
      titre: msgTitre,
      contenu: msgContenu,
    });
    setMsgTitre(''); setMsgContenu(''); setMsgDest(''); setMsgDestType('tous');
    setShowMsgForm(false);
    await loadMessages();
    setSavingMsg(false);
  }

  async function handleDeleteMessage(id) {
    await deleteMessage(id);
    await loadMessages();
  }

  const cardStyle = { background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', marginBottom: '14px', overflow: 'hidden' };
  const inputStyle = { width: '100%', padding: '8px 11px', fontSize: '12px', border: '1px solid #CCC9C0', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916' };
  const labelStyle = { fontSize: '10px', fontWeight: '600', color: '#6B6860', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px', display: 'block' };

  return (
    <div style={{ padding: '24px', maxWidth: '560px' }}>

      {/* Messages aux clients */}
      <div style={cardStyle}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>📢 Messages aux clients</span>
          <button
            onClick={() => setShowMsgForm(!showMsgForm)}
            style={{ padding: '5px 12px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Nouveau message
          </button>
        </div>

        {showMsgForm && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', background: '#F7F6F3' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Destinataire</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  onClick={() => setMsgDestType('tous')}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: '1px solid', borderRadius: '6px', fontFamily: 'inherit', background: msgDestType === 'tous' ? '#EBF0FD' : '#fff', color: msgDestType === 'tous' ? '#2B5CE6' : '#6B6860', borderColor: msgDestType === 'tous' ? '#C5D8F8' : '#E4E2DC' }}
                >
                  Tous les clients
                </button>
                <button
                  onClick={() => setMsgDestType('role')}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: '1px solid', borderRadius: '6px', fontFamily: 'inherit', background: msgDestType === 'role' ? '#EBF0FD' : '#fff', color: msgDestType === 'role' ? '#2B5CE6' : '#6B6860', borderColor: msgDestType === 'role' ? '#C5D8F8' : '#E4E2DC' }}
                >
                  Par rôle
                </button>
                <button
                  onClick={() => setMsgDestType('client')}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: '1px solid', borderRadius: '6px', fontFamily: 'inherit', background: msgDestType === 'client' ? '#EBF0FD' : '#fff', color: msgDestType === 'client' ? '#2B5CE6' : '#6B6860', borderColor: msgDestType === 'client' ? '#C5D8F8' : '#E4E2DC' }}
                >
                  Client précis
                </button>
              </div>
              {msgDestType === 'role' && (
                <select value={msgDest} onChange={e => setMsgDest(e.target.value)} style={inputStyle}>
                  <option value="">— Choisir un rôle</option>
                  <option value="ODCVL">ODCVL</option>
                  <option value="Établissement">Établissement</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Mairie">Mairie</option>
                  <option value="Autre">Autre</option>
                </select>
              )}
              {msgDestType === 'client' && (
                <input value={msgDest} onChange={e => setMsgDest(e.target.value)} style={inputStyle} placeholder="Email du client"/>
              )}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Titre *</label>
              <input value={msgTitre} onChange={e => setMsgTitre(e.target.value)} style={inputStyle} placeholder="Ex : Maintenance prévue"/>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Contenu *</label>
              <textarea value={msgContenu} onChange={e => setMsgContenu(e.target.value)} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Votre message…"/>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowMsgForm(false)} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#1A1916' }}>Annuler</button>
              <button onClick={sendMessage} disabled={savingMsg} style={{ padding: '6px 12px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {savingMsg ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: '14px 16px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#A8A69F', fontSize: '12px', padding: '20px 0' }}>Aucun message actif</div>
          ) : messages.map(m => (
            <div key={m.id} style={{ padding: '10px 12px', background: '#F7F6F3', border: '1px solid #E4E2DC', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#EBF0FD', color: '#1A3DB8' }}>{m.dest}</span>
                  <span style={{ fontSize: '10px', color: '#A8A69F' }}>
                    {m.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '—'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916' }}>{m.titre}</div>
                <div style={{ fontSize: '11px', color: '#6B6860', marginTop: '2px' }}>{m.contenu}</div>
              </div>
              <button
                onClick={() => handleDeleteMessage(m.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A69F', fontSize: '16px', padding: '0', lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Mot de passe */}
      <div style={cardStyle}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          🔒 Modifier le mot de passe
        </div>
        <form onSubmit={handlePwdChange} style={{ padding: '16px' }}>
          {error && <div style={{ padding: '8px 12px', background: '#FCEAEA', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '11px', color: '#C02B2B', marginBottom: '12px' }}>{error}</div>}
          {success && <div style={{ padding: '8px 12px', background: '#E6F5ED', border: '1px solid #AADBC5', borderRadius: '6px', fontSize: '11px', color: '#18865A', marginBottom: '12px' }}>{success}</div>}
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Mot de passe actuel</label>
            <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Confirmation</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} style={inputStyle} required/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}