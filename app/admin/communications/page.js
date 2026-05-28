'use client';
import { useState, useEffect } from 'react';
import { getClients, getBornes, getDemandes } from '../../lib/db';

export default function CommunicationsPage() {
  const [clients, setClients] = useState([]);
  const [bornes, setBornes] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, b, d] = await Promise.all([
        getClients(),
        getBornes(),
        getDemandes(),
      ]);
      setClients(c);
      setBornes(b);
      setDemandes(d);
      setLoading(false);
    }
    load();
  }, []);

  function getBornesForClient(clientEmail) {
    return bornes.filter(b => b.clientEmail === clientEmail);
  }

  function getDemandesApprouveesForClient(clientEmail) {
    return demandes.filter(d => d.clientEmail === clientEmail && d.statut === 'Approuvée');
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
      Chargement…
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '14px' }}>

        {/* Liste clients */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>
            Clients
          </div>
          {clients.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Aucun client</div>
          ) : clients.map(c => {
            const approuvees = getDemandesApprouveesForClient(c.email).length;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 14px', borderBottom: '1px solid #E4E2DC',
                  cursor: 'pointer',
                  background: selectedClient?.id === c.id ? '#EBF0FD' : '#fff',
                }}
                onMouseEnter={e => { if (selectedClient?.id !== c.id) e.currentTarget.style.background = '#F7F6F3'; }}
                onMouseLeave={e => { if (selectedClient?.id !== c.id) e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E1F5EE', color: '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                  {(c.prenom?.[0] || '') + (c.nom?.[0] || '')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.prenom} {c.nom}</div>
                  <div style={{ fontSize: '10px', color: '#A8A69F' }}>{c.societe}</div>
                </div>
                {approuvees > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', background: '#E6F5ED', color: '#18865A', flexShrink: 0 }}>
                    {approuvees}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Détail */}
        <div>
          {!selectedClient ? (
            <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '60px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
              ← Sélectionnez un client
            </div>
          ) : (
            <div>
              {/* Header client */}
              <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E1F5EE', color: '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                  {(selectedClient.prenom?.[0] || '') + (selectedClient.nom?.[0] || '')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1916' }}>{selectedClient.prenom} {selectedClient.nom}</div>
                  <div style={{ fontSize: '11px', color: '#A8A69F' }}>{selectedClient.societe} · {selectedClient.email}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#EBF0FD', color: '#1A3DB8' }}>{selectedClient.role}</span>
              </div>

              {/* Bornes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {getBornesForClient(selectedClient.email).map(b => (
                  <div key={b.id} style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.statut === 'En ligne' ? '#1D9E75' : '#E24B4A', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1A1916' }}>{b.nom}</div>
                      <div style={{ fontSize: '10px', color: '#A8A69F' }}>{b.ref} · {b.orient}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: b.statut === 'En ligne' ? '#E6F5ED' : '#FCEAEA', color: b.statut === 'En ligne' ? '#18865A' : '#C02B2B' }}>
                      {b.statut}
                    </span>
                  </div>
                ))}
              </div>

              {/* Communications approuvées */}
              <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #E4E2DC', fontSize: '13px', fontWeight: '600', color: '#1A1916', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Communications approuvées</span>
                  <span style={{ fontSize: '11px', color: '#A8A69F', fontWeight: '400' }}>
                    {getDemandesApprouveesForClient(selectedClient.email).length} communication{getDemandesApprouveesForClient(selectedClient.email).length > 1 ? 's' : ''}
                  </span>
                </div>

                {getDemandesApprouveesForClient(selectedClient.email).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px', fontStyle: 'italic' }}>
                    Aucune communication approuvée pour ce client
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F7F6F3' }}>
                        {['Nom', 'Type', 'Date d\'approbation', 'Statut info-beamer'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '600', borderBottom: '1px solid #E4E2DC' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getDemandesApprouveesForClient(selectedClient.email).map(d => (
                        <tr key={d.id} style={{ borderBottom: '1px solid #E4E2DC' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          <td style={{ padding: '11px 12px', fontWeight: '500', fontSize: '13px', color: '#1A1916' }}>{d.nom}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#F0ECFB', color: '#5B3DB8' }}>{d.type}</span>
                          </td>
                          <td style={{ padding: '11px 12px', fontSize: '11px', color: '#A8A69F' }}>
                            {d.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '—'}
                          </td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#FDF3E3', color: '#9A5E0A' }}>
                              À créer sur info-beamer
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}