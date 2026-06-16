'use client';
import { useState, useEffect } from 'react';
import { getClients, addClient, deleteClient, updateClient, getRoles, } from '../../lib/db';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [societe, setSociete] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [statut, setStatut] = useState('Actif');

  useEffect(() => {
    loadClients();
    getRoles().then(setRoles);
  }, []);

  async function loadClients() {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  }

  function toggleRole(roleName) {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  }

  function resetForm() {
    setPrenom(''); setNom(''); setEmail(''); setTel('');
    setSociete(''); setSelectedRoles([]); setStatut('Actif');
    setEditingClient(null);
    setShowForm(false);
  }

  function startEdit(client) {
    setEditingClient(client);
    setPrenom(client.prenom || '');
    setNom(client.nom || '');
    setEmail(client.email || '');
    setTel(client.tel || '');
    setSociete(client.societe || '');
    setSelectedRoles(client.roles && client.roles.length > 0 ? client.roles : (client.role ? [client.role] : []));
    setStatut(client.statut || 'Actif');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, {
          prenom, nom, tel, societe,
          roles: selectedRoles,
          role: selectedRoles[0] || '',
          statut,
        });
        resetForm();
        await loadClients();
      } else {
        const tempPassword = '123456';
        const res = await fetch('/api/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: tempPassword }),
        });
        const data = await res.json();
        if (data.error) {
          alert('Erreur : ' + data.error);
          setSaving(false);
          return;
        }
        await addClient({
          prenom, nom, email, tel, societe,
          roles: selectedRoles,
          role: selectedRoles[0] || '',
          statut,
          uid: data.uid,
          tempPassword,
        });
        alert(`Client créé !\nEmail : ${email}\nMot de passe temporaire : ${tempPassword}`);
        resetForm();
        await loadClients();
      }
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce client ?')) return;
    await deleteClient(id);
    await loadClients();
  }

  async function handleResetPassword(email) {
    if (!confirm(`Réinitialiser le mot de passe de ${email} à 123456 ?`)) return;
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) alert(`Mot de passe réinitialisé à 123456 pour ${email}`);
    else alert('Erreur : ' + data.error);
  }

  const filtered = clients.filter(c =>
    (c.nom + ' ' + c.prenom + ' ' + c.societe + ' ' + c.email)
      .toLowerCase().includes(search.toLowerCase())
  );

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
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher client, contact…"
          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', border: '1px solid #E4E2DC', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916' }}
        />
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{ padding: '8px 14px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Nouveau client
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1916', marginBottom: '14px' }}>
            {editingClient ? `Modifier — ${editingClient.prenom} ${editingClient.nom}` : 'Nouveau client'}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div><label style={labelStyle}>Prénom *</label><input value={prenom} onChange={e => setPrenom(e.target.value)} style={inputStyle} required /></div>
              <div><label style={labelStyle}>Nom *</label><input value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} required /></div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, ...(editingClient ? { background: '#F7F6F3', color: '#A8A69F' } : {}) }} required readOnly={!!editingClient} />
              </div>
              <div><label style={labelStyle}>Téléphone</label><input value={tel} onChange={e => setTel(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Société</label><input value={societe} onChange={e => setSociete(e.target.value)} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Statut</label>
                <select value={statut} onChange={e => setStatut(e.target.value)} style={inputStyle}>
                  <option value="Actif">Actif</option>
                  <option value="Essai">Essai</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Rôles ({selectedRoles.length} sélectionné{selectedRoles.length > 1 ? 's' : ''})</label>
              {roles.length === 0 ? (
                <div style={{ padding: '10px', background: '#F7F6F3', borderRadius: '6px', fontSize: '11px', color: '#A8A69F' }}>
                  Aucun rôle disponible. Créez-en dans Paramètres → Rôles clients.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {roles.map(r => {
                    const isSelected = selectedRoles.includes(r.nom);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRole(r.nom)}
                        style={{
                          padding: '6px 12px',
                          background: isSelected ? '#2B5CE6' : '#F7F6F3',
                          color: isSelected ? '#fff' : '#6B6860',
                          border: `1px solid ${isSelected ? '#2B5CE6' : '#E4E2DC'}`,
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{r.nom}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
              <button type="submit" disabled={saving} style={{ padding: '7px 14px', background: '#2B5CE6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Enregistrement…' : editingClient ? 'Mettre à jour' : 'Créer le client'}
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
            {clients.length === 0 ? 'Aucun client — créez le premier.' : 'Aucun résultat.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F6F3' }}>
                {['Client', 'Email', 'Rôles', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '600', borderBottom: '1px solid #E4E2DC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const clientRoles = c.roles && c.roles.length > 0 ? c.roles : (c.role ? [c.role] : []);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #E4E2DC' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: '500', fontSize: '13px', color: '#1A1916' }}>{c.prenom} {c.nom}</div>
                      <div style={{ fontSize: '10px', color: '#A8A69F' }}>{c.societe}</div>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: '#6B6860' }}>{c.email}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {clientRoles.length === 0 ? (
                          <span style={{ fontSize: '10px', color: '#A8A69F', fontStyle: 'italic' }}>—</span>
                        ) : clientRoles.map(r => (
                          <span key={r} style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#EBF0FD', color: '#1A3DB8' }}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: c.statut === 'Actif' ? '#E6F5ED' : c.statut === 'Essai' ? '#FDF3E3' : '#F7F6F3', color: c.statut === 'Actif' ? '#18865A' : c.statut === 'Essai' ? '#9A5E0A' : '#6B6860' }}>{c.statut}</span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => startEdit(c)}
                          style={{ background: '#EBF0FD', border: '1px solid #C5D8F8', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', color: '#2B5CE6', fontFamily: 'inherit' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleResetPassword(c.email)}
                          style={{ background: '#FDF3E3', border: '1px solid #F0C070', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', color: '#9A5E0A', fontFamily: 'inherit' }}
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ background: '#FCEAEA', border: '1px solid #EABABA', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', color: '#C02B2B', fontFamily: 'inherit' }}
                        >
                          🗑️
                        </button>
                      </div>
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