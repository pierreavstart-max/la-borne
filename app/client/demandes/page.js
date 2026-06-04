'use client';
import { useState, useEffect } from 'react';
import { getDemandesClient, addDemande, archiverDemande } from '../../lib/db';

export default function DemandesClientPage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchives, setShowArchives] = useState(false);
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
      const sorted = data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setDemandes(sorted);
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

  // Envoie un email de notification
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: `Nouvelle demande — ${nom}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #1A1916;">Nouvelle demande reçue</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px;">Client</td><td style="padding: 8px 0; font-size: 13px;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px;">Communication</td><td style="padding: 8px 0; font-size: 13px;">${nom}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px;">Type</td><td style="padding: 8px 0; font-size: 13px;">${type}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px;">Description</td><td style="padding: 8px 0; font-size: 13px;">${description || '—'}</td></tr>
          </table>
          <a href="https://app.la-borne.fr/admin/demandes" style="display:inline-block; margin-top:16px; padding: 10px 20px; background: #2B5CE6; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px;">
            Voir la demande →
          </a>
        </div>
      `,
    }),
  });

  setType(''); setNom(''); setDescription('');
  setShowForm(false);
  await loadDemandes();
  setSaving(false);
}

  async function handleArchive(id) {
    await archiverDemande(id);
    await loadDemandes();
  }

  const statutStyle = (s) => ({
    'En attente': { bg: '#FDF3E3', color: '#9A5E0A' },
    'Approuvée':  { bg: '#E6F5ED', color: '#18865A' },
    'Refusée':    { bg: '#FCEAEA', color: '#C02B2B' },
  }[s] || { bg: '#F7F6F3', color: '#6B6860' });

  const actives = demandes.filter(d => !d.archived);
  const archives = demandes.filter(d => d.archived);

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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <button
          onClick={() => setShowArchives(!showArchives)}
          style={{ padding: '6px 14px', background: showArchives ? '#1A1916' : '#fff', color: showArchives ? '#fff' : '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showArchives ? '← Demandes actives' : '🗃️ Voir les archives'}
        </button>
        {!showArchives && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '8px 16px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Nouvelle demande
          </button>
        )}
      </div>

      {showForm && !showArchives && (
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
            <button onClick={() => setShowForm(false)} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#1A1916' }}>Annuler</button>
            <button onClick={soumettre} disabled={saving} style={{ padding: '7px 14px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          {showArchives ? 'Archives' : 'Historique des demandes'}
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>
        ) : (showArchives ? archives : actives).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
            {showArchives ? 'Aucune archive.' : 'Aucune demande pour le moment.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F6F3' }}>
                {['Communication', 'Type', 'Statut', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '600', borderBottom: '1px solid #E4E2DC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(showArchives ? archives : actives).map(d => {
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
                    <td style={{ padding: '11px 12px' }}>
                      {!showArchives && (d.statut === 'Approuvée' || d.statut === 'Refusée') && (
                        <button
                          onClick={() => handleArchive(d.id)}
                          style={{ padding: '3px 10px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >🗃️ Archiver</button>
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