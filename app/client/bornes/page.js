'use client';
import { useState, useEffect, useRef } from 'react';
import { getBornes, getDemandesClient, updateDemande } from '../../lib/db';

const statutStyle = (s) => ({
  'Diffus\u00e9e':  { bg: '#E6F5ED', color: '#18865A' },
  'En attente':     { bg: '#FDF3E3', color: '#9A5E0A' },
  'Refus\u00e9e':   { bg: '#FCEAEA', color: '#C02B2B' },
  'Approuv\u00e9e': { bg: '#E6F5ED', color: '#18865A' },
}[s] || { bg: '#F7F6F3', color: '#6B6860' });

export default function BornesClientPage() {
  const [bornes, setBornes] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [editingComm, setEditingComm] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    async function load() {
      const email = localStorage.getItem('clientEmail');
      if (!email) return;
      const allBornes = await getBornes();
      const clientBornes = allBornes.filter(b => b.clientEmail === email);
      setBornes(clientBornes);
      const clientDemandes = await getDemandesClient(email);
      setDemandes(clientDemandes);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(demande) {
    if (!confirm(`Supprimer la communication "${demande.nom}" ? Cette action est irréversible.`)) return;
    setDeleting(demande.id);
    try {
      if (demande.ibAssetId) {
        await fetch('/api/infobeamer/delete-asset', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: demande.ibAssetId }),
        });
      }
      await updateDemande(demande.id, { archived: true });
      const email = localStorage.getItem('clientEmail');
      const clientDemandes = await getDemandesClient(email);
      setDemandes(clientDemandes);
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
    setDeleting(null);
  }

  async function handleUpload(demande, file) {
    setUploading(demande.id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (demande.ibAssetId) {
        formData.append('assetId', demande.ibAssetId);
      }

      const res = await fetch('/api/infobeamer/upload-asset', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Met à jour ibAssetId si c'était un nouvel asset
        if (!demande.ibAssetId && data.assetId) {
          await updateDemande(demande.id, { ibAssetId: data.assetId });
        }
        alert('Communication mise à jour sur info-beamer !');
        const email = localStorage.getItem('clientEmail');
        const clientDemandes = await getDemandesClient(email);
        setDemandes(clientDemandes);
      } else {
        alert('Erreur : ' + data.error);
      }
    } catch (err) {
      alert('Erreur lors de l\'upload.');
    }
    setUploading(null);
    setEditingComm(null);
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
      Chargement…
    </div>
  );

  if (bornes.length === 0) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
      Aucune borne assignée à votre compte.
    </div>
  );

  const borne = bornes[activeTab];
  const borneFormat = borne.orient === 'Portrait' ? '1080×1920 px' : '1920×1080 px';
  const borneComms = demandes.filter(d =>
    (d.statut === 'Approuv\u00e9e' || d.statut === 'Diffus\u00e9e') && !d.archived
  );

  return (
    <div style={{ padding: '24px' }}>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {bornes.map((b, i) => (
          <button key={b.id} onClick={() => setActiveTab(i)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
            cursor: 'pointer', border: '1px solid', fontFamily: 'inherit',
            background: activeTab === i ? '#2B5CE6' : '#fff',
            color: activeTab === i ? '#fff' : '#1A1916',
            borderColor: activeTab === i ? '#2B5CE6' : '#E4E2DC',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.statut === 'En ligne' ? '#1D9E75' : '#E24B4A', flexShrink: 0 }}></div>
            Borne {i + 1} — {b.nom}
          </button>
        ))}
      </div>

      {/* Header borne */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: borne.statut === 'En ligne' ? '#1D9E75' : '#E24B4A', boxShadow: borne.statut === 'En ligne' ? '0 0 0 3px rgba(29,158,117,.15)' : 'none' }}></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>{borne.nom}</div>
            <div style={{ fontSize: '10px', color: '#A8A69F' }}>{borne.adresse}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#F0ECFB', color: '#5B3DB8' }}>
            {borne.orient} · {borneFormat}
          </span>
          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: borne.statut === 'En ligne' ? '#E6F5ED' : '#FCEAEA', color: borne.statut === 'En ligne' ? '#18865A' : '#C02B2B' }}>
            {borne.statut}
          </span>
        </div>
      </div>

      {/* Header communications */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', fontWeight: '600', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Communications
        </div>
        <div style={{ fontSize: '10px', padding: '5px 10px', background: '#EBF0FD', border: '1px solid #C5D8F8', borderRadius: '6px', color: '#1A3DB8' }}>
          Format : <strong>{borneFormat}</strong>
        </div>
      </div>

      {/* Grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {borneComms.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px' }}>
            Aucune communication approuvée pour cette borne.
          </div>
        ) : borneComms.map(c => {
          const st = statutStyle(c.statut);
          const isEditing = editingComm === c.id;
          return (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
              {/* Vignette */}
              <div
                style={{
                  height: borne.orient === 'Portrait' ? '150px' : '90px',
                  background: 'linear-gradient(135deg, #1a3a5c, #2d7a4f)',
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const overlay = e.currentTarget.querySelector('.del-overlay');
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  const overlay = e.currentTarget.querySelector('.del-overlay');
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', textAlign: 'center', padding: '10px' }}>
                  {c.nom}
                </div>
                <div className="del-overlay" style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: 0, transition: 'opacity .15s',
                }}>
                  <button
                    onClick={() => setEditingComm(isEditing ? null : c.id)}
                    style={{ padding: '5px 10px', background: '#EBF0FD', color: '#2B5CE6', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    disabled={deleting === c.id}
                    style={{ padding: '5px 10px', background: '#FCEAEA', color: '#C02B2B', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}
                  >
                    {deleting === c.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>

              {/* Formulaire upload */}
              {isEditing && (
                <div style={{ padding: '10px 12px', borderTop: '1px solid #E4E2DC', background: '#F7F6F3' }}>
                  <div style={{ fontSize: '10px', color: '#6B6860', marginBottom: '6px' }}>
                    Uploader un nouveau fichier ({c.type === 'Vidéo' ? 'MP4' : 'JPG/PNG'}) :
                  </div>
                  <input
                    type="file"
                    accept={c.type === 'Vidéo' ? 'video/mp4' : 'image/jpeg,image/png'}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) handleUpload(c, file);
                    }}
                    style={{ fontSize: '11px', color: '#1A1916', width: '100%' }}
                  />
                  {uploading === c.id && (
                    <div style={{ fontSize: '11px', color: '#2B5CE6', marginTop: '6px' }}>⏳ Upload en cours…</div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '9px 12px', borderTop: '1px solid #E4E2DC' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', marginBottom: '3px' }}>{c.nom}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', color: '#A8A69F' }}>{c.type}</span>
                  <span style={{ fontSize: '9px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: st.bg, color: st.color }}>{c.statut}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Demander une communication */}
        <div
          style={{
            border: '1.5px dashed #CCC9C0', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '6px', cursor: 'pointer', minHeight: '200px', background: '#fff', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2B5CE6'; e.currentTarget.style.background = '#EBF0FD'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#CCC9C0'; e.currentTarget.style.background = '#fff'; }}
          onClick={() => window.location.href = '/client/demandes'}
        >
          <span style={{ fontSize: '24px', color: '#A8A69F' }}>+</span>
          <span style={{ fontSize: '12px', color: '#6B6860', fontWeight: '500' }}>Demander une communication</span>
          <span style={{ fontSize: '10px', color: '#A8A69F' }}>Soumis à approbation admin</span>
        </div>
      </div>
    </div>
  );
}