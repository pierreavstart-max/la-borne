'use client';
import { useState, useEffect } from 'react';
import { getClients, getBornes } from '../../lib/db';

export default function CommunicationsPage() {
  const [clients, setClients] = useState([]);
  const [bornes, setBornes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    async function load() {
      const [c, b] = await Promise.all([getClients(), getBornes()]);
      setClients(c);
      setBornes(b);
      setLoading(false);
    }
    load();
  }, []);

  function getBornesForClient(clientEmail) {
    return bornes.filter(b => b.client === clientEmail || b.clientEmail === clientEmail);
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>;

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
          ) : clients.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedClient(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
                borderBottom: '1px solid #E4E2DC', cursor: 'pointer',
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
              <span style={{ fontSize: '10px', color: '#A8A69F', flexShrink: 0 }}>
                {getBornesForClient(c.email).length} borne{getBornesForClient(c.email).length > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Détail client */}
        <div>
          {!selectedClient ? (
            <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '60px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
              ← Sélectionnez un client pour voir ses communications
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

              {/* Bornes du client */}
              {getBornesForClient(selectedClient.email).length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
                  Aucune borne assignée à ce client
                </div>
              ) : getBornesForClient(selectedClient.email).map(b => (
                <div key={b.id} style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', marginBottom: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E4E2DC', display: 'flex', alignItems: 'center', gap: '10px', background: '#F7F6F3' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.statut === 'En ligne' ? '#1D9E75' : '#E24B4A', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1916' }}>{b.nom}</div>
                      <div style={{ fontSize: '10px', color: '#A8A69F' }}>{b.ref} · {b.orient}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: b.statut === 'En ligne' ? '#E6F5ED' : '#FCEAEA', color: b.statut === 'En ligne' ? '#18865A' : '#C02B2B' }}>
                      {b.statut}
                    </span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#A8A69F', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                      Les communications seront affichées ici une fois connectées à info-beamer.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}