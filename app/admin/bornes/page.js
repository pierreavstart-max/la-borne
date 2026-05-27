'use client';
import { useState, useEffect } from 'react';
import { getBornes, addBorne, deleteBorne, getClients } from '../../lib/db';

export default function BornesPage() {
  const [bornes, setBornes] = useState([]);
  const [clients, setClients] = useState([]);
  const [ibDevices, setIbDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [orient, setOrient] = useState('Portrait');
  const [ibDeviceId, setIbDeviceId] = useState('');

  useEffect(() => {
    async function load() {
      const [b, c, ibRes] = await Promise.all([
        getBornes(),
        getClients(),
        fetch('/api/infobeamer/devices').then(r => r.json()),
      ]);
      setBornes(b);
      setClients(c);
      setIbDevices(ibRes.devices || []);
      setLoading(false);
    }
    load();
  }, []);

  async function loadBornes() {
    const data = await getBornes();
    setBornes(data);
  }

  function genRef(n) {
    return n.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-brn-0';
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const selectedClient = clients.find(c => c.email === clientEmail);
    const selectedDevice = ibDevices.find(d => d.id === parseInt(ibDeviceId));
    await addBorne({
      nom,
      ref: genRef(nom),
      adresse: selectedDevice?.location || adresse,
      client: selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : '',
      clientEmail,
      orient,
      ibDeviceId: ibDeviceId ? parseInt(ibDeviceId) : null,
      statut: selectedDevice?.is_online ? 'En ligne' : 'Hors ligne',
    });
    setNom(''); setAdresse(''); setClientEmail('');
    setOrient('Portrait'); setIbDeviceId('');
    setShowForm(false);
    await loadBornes();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette borne ?')) return;
    await deleteBorne(id);
    await loadBornes();
  }

  // Fusionne les données Firestore avec info-beamer
  function getDeviceStatus(borne) {
    if (!borne.ibDeviceId) return borne.statut || 'Non connectée';
    const device = ibDevices.find(d => d.id === borne.ibDeviceId);
    if (!device) return 'Non trouvée';
    return device.is_online ? 'En ligne' : 'Hors ligne';
  }

  function getDeviceName(borne) {
    if (!borne.ibDeviceId) return null;
    const device = ibDevices.find(d => d.id === borne.ibDeviceId);
    return device?.description || null;
  }

  const filtered = bornes.filter(b =>
    (b.nom + ' ' + b.ref + ' ' + b.client)
      .toLowerCase().includes(search.toLowerCase())
  );

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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une borne…"
          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', border: '1px solid #E4E2DC', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916' }}
        />
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '8px 14px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Nouvelle borne
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1916', marginBottom: '14px' }}>Nouvelle borne</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} required/>
              </div>
              <div>
                <label style={labelStyle}>Référence (auto)</label>
                <input value={nom ? genRef(nom) : ''} style={{ ...inputStyle, background: '#F7F6F3', color: '#A8A69F' }} readOnly/>
              </div>
              <div>
                <label style={labelStyle}>Client assigné</label>
                <select value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={inputStyle}>
                  <option value="">— Aucun</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.email}>
                      {c.prenom} {c.nom} — {c.societe}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Appareil info-beamer</label>
                <select value={ibDeviceId} onChange={e => setIbDeviceId(e.target.value)} style={inputStyle}>
                  <option value="">— Aucun</option>
                  {ibDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.description} — {d.is_online ? '🟢 En ligne' : '🔴 Hors ligne'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Orientation *</label>
                <select value={orient} onChange={e => setOrient(e.target.value)} style={inputStyle}>
                  <option value="Portrait">Portrait</option>
                  <option value="Paysage">Paysage</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#1A1916' }}>Annuler</button>
              <button type="submit" disabled={saving} style={{ padding: '7px 14px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Enregistrement...' : 'Créer la borne'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
            {bornes.length === 0 ? 'Aucune borne — créez la première.' : 'Aucun résultat.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F6F3' }}>
                {['Borne', 'Référence', 'Client', 'Info-beamer', 'Orientation', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '600', borderBottom: '1px solid #E4E2DC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const status = getDeviceStatus(b);
                const deviceName = getDeviceName(b);
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #E4E2DC' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: '500', fontSize: '13px', color: '#1A1916' }}>{b.nom}</div>
                      <div style={{ fontSize: '10px', color: '#A8A69F' }}>{b.adresse}</div>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '10px', background: '#F7F6F3', border: '1px solid #E4E2DC', padding: '2px 7px', borderRadius: '4px' }}>{b.ref}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: '#1A1916' }}>{b.client}</td>
                    <td style={{ padding: '11px 12px', fontSize: '11px', color: '#6B6860' }}>
                      {deviceName ? (
                        <span style={{ fontSize: '10px', background: '#F7F6F3', border: '1px solid #E4E2DC', padding: '2px 7px', borderRadius: '4px' }}>{deviceName}</span>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#A8A69F', fontStyle: 'italic' }}>Non lié</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: b.orient === 'Portrait' ? '#F0ECFB' : '#F7F6F3', color: b.orient === 'Portrait' ? '#5B3DB8' : '#6B6860' }}>{b.orient}</span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: status === 'En ligne' ? '#E6F5ED' : '#FCEAEA', color: status === 'En ligne' ? '#18865A' : '#C02B2B' }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <button onClick={() => handleDelete(b.id)} style={{ background: '#FCEAEA', border: '1px solid #EABABA', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', color: '#C02B2B', fontFamily: 'inherit' }}>
                        Supprimer
                      </button>
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