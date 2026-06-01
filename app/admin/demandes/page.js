'use client';
import { useState, useEffect } from 'react';
import { getDemandes, updateDemande, addNotification, getClients, getBornes, archiverDemande } from '../../lib/db';

export default function DemandesPage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showArchives, setShowArchives] = useState(false);

  useEffect(() => { loadDemandes(); }, []);

  async function loadDemandes() {
    setLoading(true);
    const data = await getDemandes();
    const sorted = data.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    setDemandes(sorted);
    setLoading(false);
  }

  async function handleAction(demande, action) {
    setProcessing(demande.id);
    const statut = action === 'approve' ? 'Approuvée' : 'Refusée';
    await updateDemande(demande.id, { statut });

    await addNotification({
      clientEmail: demande.clientEmail,
      type: statut,
      titre: statut === 'Approuvée' ? 'Demande approuvée' : 'Demande refusée',
      message: statut === 'Approuvée'
        ? `Votre communication « ${demande.nom} » a été approuvée.`
        : `Votre demande pour « ${demande.nom} » a été refusée.`,
      lu: false,
    });

    if (action === 'approve') {
      try {
        const clients = await getClients();
        const client = clients.find(c => c.email === demande.clientEmail);
        const bornesList = await getBornes();
        const borne = bornesList.find(b => b.clientEmail === demande.clientEmail);
        const orientationValue = borne?.orient?.toLowerCase() || 'portrait';
        const filename = demande.clientEmail.split('@')[0] + '-' + demande.nom.toLowerCase().replace(/\s+/g, '-');

        const genRes = await fetch('/api/generate-communication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientNom: client ? `${client.prenom} ${client.nom}` : demande.clientNom,
            clientSociete: client?.societe || '',
            orientation: orientationValue,
            filename,
            type: demande.type,
          }),
        });
        const genData = await genRes.json();
console.log('Réponse génération:', genData);
const assetId = genData.assetId || genData.asset_id;
const assetFilename = genData.filename;
if (assetId) {
  await updateDemande(demande.id, { ibAssetId: assetId, ibFilename: assetFilename });
}
      } catch (err) {
        console.error('Erreur génération image:', err);
      }
    }

    await loadDemandes();
    setProcessing(null);
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

  return (
    <div style={{ padding: '24px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button
          onClick={() => setShowArchives(!showArchives)}
          style={{ padding: '6px 14px', background: showArchives ? '#1A1916' : '#fff', color: showArchives ? '#fff' : '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showArchives ? '← Demandes actives' : '🗃️ Voir les archives'}
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
          {showArchives ? 'Archives' : 'Demandes'}
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>
        ) : (showArchives ? archives : actives).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
            {showArchives ? 'Aucune archive.' : 'Aucune demande.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F6F3' }}>
                {['Client', 'Communication', 'Type', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '600', borderBottom: '1px solid #E4E2DC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(showArchives ? archives : actives).map(d => {
                const st = statutStyle(d.statut);
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #E4E2DC' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '11px 12px', fontWeight: '500', fontSize: '13px', color: '#1A1916' }}>{d.clientNom}</td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: '#6B6860' }}>{d.nom}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#F0ECFB', color: '#5B3DB8' }}>{d.type}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '11px', color: '#A8A69F' }}>
                      {d.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '—'}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: st.bg, color: st.color }}>{d.statut}</span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      {!showArchives && d.statut === 'En attente' ? (
                        processing === d.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B6860' }}>
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                            En cours…
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleAction(d, 'approve')}
                              disabled={processing !== null}
                              style={{ padding: '3px 10px', background: '#E6F5ED', color: '#18865A', border: '1px solid #AADBC5', borderRadius: '6px', fontSize: '11px', cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: processing ? .5 : 1 }}
                            >✓ Approuver</button>
                            <button
                              onClick={() => handleAction(d, 'refuse')}
                              disabled={processing !== null}
                              style={{ padding: '3px 10px', background: '#FCEAEA', color: '#C02B2B', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '11px', cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: processing ? .5 : 1 }}
                            >✗ Refuser</button>
                          </div>
                        )
                      ) : !showArchives && (d.statut === 'Approuvée' || d.statut === 'Refusée') ? (
                        <button
                          onClick={() => handleArchive(d.id)}
                          style={{ padding: '3px 10px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >🗃️ Archiver</button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#A8A69F' }}>Archivée</span>
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