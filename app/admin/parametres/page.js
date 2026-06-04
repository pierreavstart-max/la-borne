'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { getMessages, addMessage, deleteMessage, getFaq, addFaqItem, updateFaqItem, deleteFaqItem } from '../../lib/db';

export default function ParametresPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const [messages, setMessages] = useState([]);
  const [msgTitre, setMsgTitre] = useState('');
  const [msgContenu, setMsgContenu] = useState('');
  const [msgDest, setMsgDest] = useState('');
  const [msgDestType, setMsgDestType] = useState('tous');

  const [faq, setFaq] = useState([]);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqReponse, setFaqReponse] = useState('');
  const [editingFaq, setEditingFaq] = useState(null);

  useEffect(() => {
    loadMessages();
    loadFaq();
  }, []);

  async function loadMessages() {
    const data = await getMessages();
    setMessages(data.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)));
  }

  async function loadFaq() {
    const data = await getFaq();
    setFaq(data);
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) { setPwMsg('Les mots de passe ne correspondent pas.'); return; }
    if (newPassword.length < 6) { setPwMsg('Le mot de passe doit faire au moins 6 caractères.'); return; }
    try {
      await updatePassword(auth.currentUser, newPassword);
      setPwMsg('Mot de passe mis à jour !');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPwMsg('Erreur : ' + err.message);
    }
  }

  async function handleAddMessage() {
    if (!msgTitre || !msgContenu) return;
    await addMessage({ titre: msgTitre, contenu: msgContenu, dest: msgDest, destType: msgDestType });
    setMsgTitre(''); setMsgContenu(''); setMsgDest(''); setMsgDestType('tous');
    await loadMessages();
  }

  async function handleDeleteMessage(id) {
    await deleteMessage(id);
    await loadMessages();
  }

  async function handleAddFaq() {
    if (!faqQuestion || !faqReponse) return;
    if (editingFaq) {
      await updateFaqItem(editingFaq, { question: faqQuestion, reponse: faqReponse });
      setEditingFaq(null);
    } else {
      await addFaqItem({ question: faqQuestion, reponse: faqReponse, ordre: faq.length });
    }
    setFaqQuestion(''); setFaqReponse('');
    await loadFaq();
  }

  function startEditFaq(item) {
    setEditingFaq(item.id);
    setFaqQuestion(item.question);
    setFaqReponse(item.reponse);
  }

  async function handleDeleteFaq(id) {
    await deleteFaqItem(id);
    await loadFaq();
  }

  const inputStyle = {
    width: '100%', padding: '8px 11px', fontSize: '12px',
    border: '1px solid #CCC9C0', borderRadius: '6px',
    fontFamily: 'inherit', color: '#1A1916', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: '10px', fontWeight: '600', color: '#6B6860',
    textTransform: 'uppercase', letterSpacing: '.04em',
    marginBottom: '4px', display: 'block',
  };

  return (
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

      {/* Mot de passe */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          Changer le mot de passe
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirmer le mot de passe</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
          </div>
          {pwMsg && <div style={{ fontSize: '11px', color: pwMsg.includes('!') ? '#18865A' : '#C02B2B' }}>{pwMsg}</div>}
          <button onClick={handlePasswordChange} style={{ padding: '8px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            Mettre à jour
          </button>
        </div>
      </div>

      {/* Messages clients */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          Messages aux clients
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Destinataire</label>
            <select value={msgDestType} onChange={e => setMsgDestType(e.target.value)} style={inputStyle}>
              <option value="tous">Tous les clients</option>
              <option value="client">Client spécifique</option>
            </select>
          </div>
          {msgDestType === 'client' && (
            <div>
              <label style={labelStyle}>Email du client</label>
              <input value={msgDest} onChange={e => setMsgDest(e.target.value)} style={inputStyle} placeholder="client@example.com" />
            </div>
          )}
          <div>
            <label style={labelStyle}>Titre</label>
            <input value={msgTitre} onChange={e => setMsgTitre(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Message</label>
            <textarea value={msgContenu} onChange={e => setMsgContenu(e.target.value)} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
          </div>
          <button onClick={handleAddMessage} style={{ padding: '8px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            Envoyer
          </button>
          {messages.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <label style={labelStyle}>Messages envoyés</label>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F7F6F3', borderRadius: '6px', marginBottom: '4px', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titre}</div>
                    <div style={{ fontSize: '10px', color: '#A8A69F' }}>{m.destType === 'tous' ? 'Tous' : m.dest}</div>
                  </div>
                  <button onClick={() => handleDeleteMessage(m.id)} style={{ padding: '3px 8px', background: '#FCEAEA', color: '#C02B2B', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Mode d'emploi */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden', gridColumn: '1 / -1' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          Mode d'emploi — FAQ clients
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', marginBottom: '4px' }}>
              {editingFaq ? 'Modifier une entrée' : 'Ajouter une entrée'}
            </div>
            <div>
              <label style={labelStyle}>Question</label>
              <input value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} style={inputStyle} placeholder="Ex : Comment mettre à jour une communication ?" />
            </div>
            <div>
              <label style={labelStyle}>Réponse</label>
              <textarea value={faqReponse} onChange={e => setFaqReponse(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Expliquez ici…" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAddFaq} disabled={!faqQuestion || !faqReponse} style={{ flex: 1, padding: '8px', background: faqQuestion && faqReponse ? '#2B5CE6' : '#E4E2DC', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: faqQuestion && faqReponse ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                {editingFaq ? 'Mettre à jour' : '+ Ajouter'}
              </button>
              {editingFaq && (
                <button onClick={() => { setEditingFaq(null); setFaqQuestion(''); setFaqReponse(''); }} style={{ padding: '8px 14px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Liste FAQ */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', marginBottom: '10px' }}>
              {faq.length} entrée{faq.length > 1 ? 's' : ''}
            </div>
            {faq.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#A8A69F', fontSize: '11px', background: '#F7F6F3', borderRadius: '6px' }}>
                Aucune entrée FAQ
              </div>
            ) : faq.map(item => (
              <div key={item.id} style={{ padding: '10px 12px', background: '#F7F6F3', borderRadius: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1A1916', marginBottom: '3px' }}>{item.question}</div>
                    <div style={{ fontSize: '11px', color: '#6B6860', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.reponse}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => startEditFaq(item)} style={{ padding: '3px 8px', background: '#EBF0FD', color: '#2B5CE6', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDeleteFaq(item.id)} style={{ padding: '3px 8px', background: '#FCEAEA', color: '#C02B2B', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}