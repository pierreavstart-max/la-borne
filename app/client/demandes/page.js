'use client';
import { useState, useEffect } from 'react';
import { getDemandesClient, addDemande } from '../../lib/db';

export default function DemandesClientPage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('');
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDemandes(); }, []);

  async function loadDemandes() {
    setLoading(true);
    const email = localStorage.getItem('clientEmail');
    if (email) {
      const data = await getDemandesClient(email);
      setDemandes(data);
    }
    setLoading(false);
  }

  async function soumettre() {
    if (!type || !nom) return;
    setSaving(true);
    const email = localStorage.getItem('clientEmail');
    await addDemande({
      clientEmail: email,
      clientNom: email,
      nom, type, description,
    });
    setType(''); setNom(''); setDescription('');
    setShowForm(false);
    await loadDemandes();
    setSaving(false);
  }

  const statutStyle = (s) => ({
    'En attente': { bg: '#FDF3E3', color: '#9A5E0A' },
    'Approuvée':  { bg: '#E6F5ED', color: '#18865A' },
    'Refusée':    { bg: '#FCEAEA', color: '#C02B2B' },
  }[s] || { bg: '#F7F6F3', color: '#6B6860' });

  const inputStyle = {
    width: '100%', padding: '8px 11px', fontSize: '12px',
    border: '1px solid #CCC9C0', borderRadius: '6px',
    fontFamily: 'inherit', color: '#1A1916'
  };
  const labelStyle = {
    fontSize: '10px', fontWeight: '600', color: '#6B6860',
    textTransform: 'uppercase', letterSpacing: '.04em',
    marginBottom: '4px', display: 'block'
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '8px 16px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Nouvelle demande
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1916', marginBottom: '14px' }}>Nouvelle demande</div>
          <div style={{ padding: '10px 12px', background: '#FDF3E3', border: '1px solid #F0C070', borderRadius: '6px', fontSize: '11px', color: '#9A5E0A', marginBottom: '14px', lineHeight: 1.5 }}>
            ⚠️ Chaque nouvelle communication doit être approuvée par l'administrateur.
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Type *</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              <option value="">— Choisir</option>
              <option value="Image">Image (JPG / PNG)</option>
              <option value="Vidéo">Vidéo (MP4 · max 30s · 50Mo)</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Nom souhaité *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} placeholder="Ex : Menu semaine…" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Description (optionnel)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Décrivez ce que vous souhaitez afficher…" />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
            <button onClick={soumettre} disabled={saving} style={{ padding: '7px 14px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          Historique des demandes
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>
        ) : demandes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Aucune demande pour le moment.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F6F3' }}>
                {['Communication', 'Type', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '600', borderBottom: '1px solid #E4E2DC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demandes.map(d => {
                const st = statutStyle(d.statut);
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #E4E2DC' }}>
                    <td style={{ padding: '11px 12px', fontWeight: '500', fontSize: '13px', color: '#1A1916' }}>{d.nom}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#F0ECFB', color: '#5B3DB8' }}>{d.type}</span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: st.bg, color: st.color }}>{d.statut}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '11px', color: '#A8A69F' }}>
                      {d.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '—'}
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