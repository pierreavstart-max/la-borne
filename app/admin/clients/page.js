'use client';
import { useState, useEffect } from 'react';
import { getClients, addClient, deleteClient } from '../../lib/db';

const ROLES = ['ODCVL', 'Établissement', 'Commerce', 'Mairie', 'Autre'];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [societe, setSociete] = useState('');
  const [role, setRole] = useState('');
  const [statut, setStatut] = useState('Actif');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    await addClient({ prenom, nom, email, tel, societe, role, statut });
    setPrenom(''); setNom(''); setEmail(''); setTel('');
    setSociete(''); setRole(''); setStatut('Actif');
    setShowForm(false);
    await loadClients();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce client ?')) return;
    await deleteClient(id);
    await loadClients();
  }

  const filtered = clients.filter(c =>
    (c.nom + ' ' + c.prenom + ' ' + c.societe + ' ' + c.email)
      .toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width:'100%', padding:'8px 11px', fontSize:'12px',
    border:'1px solid #CCC9C0', borderRadius:'6px', fontFamily:'inherit',
    color:'#1A1916'
  };
  const labelStyle = {
    fontSize:'10px', fontWeight:'600', color:'#6B6860',
    textTransform:'uppercase', letterSpacing:'.04em',
    marginBottom:'4px', display:'block'
  };

  return (
    <div style={{padding:'24px'}}>

      {/* Barre */}
      <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher client, contact…"
          style={{flex:1,padding:'8px 12px',fontSize:'12px',border:'1px solid #E4E2DC',borderRadius:'6px',fontFamily:'inherit'}}
        />
        <button
          onClick={() => setShowForm(!showForm)}
          style={{padding:'8px 14px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit'}}
        >
          + Nouveau client
        </button>
      </div>

      {/* Formulaire nouveau client */}
      {showForm && (
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',padding:'18px',marginBottom:'16px'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'#1A1916',marginBottom:'14px'}}>Nouveau client</div>
          <form onSubmit={handleAdd}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
              <div><label style={labelStyle}>Prénom *</label><input value={prenom} onChange={e=>setPrenom(e.target.value)} style={inputStyle} required/></div>
              <div><label style={labelStyle}>Nom *</label><input value={nom} onChange={e=>setNom(e.target.value)} style={inputStyle} required/></div>
              <div><label style={labelStyle}>Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} required/></div>
              <div><label style={labelStyle}>Téléphone</label><input value={tel} onChange={e=>setTel(e.target.value)} style={inputStyle}/></div>
              <div><label style={labelStyle}>Société</label><input value={societe} onChange={e=>setSociete(e.target.value)} style={inputStyle}/></div>
              <div>
                <label style={labelStyle}>Rôle *</label>
                <select value={role} onChange={e=>setRole(e.target.value)} style={inputStyle} required>
                  <option value="">— Choisir</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Statut</label>
                <select value={statut} onChange={e=>setStatut(e.target.value)} style={inputStyle}>
                  <option value="Actif">Actif</option>
                  <option value="Essai">Essai</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'10px'}}>
              <button type="button" onClick={() => setShowForm(false)} style={{padding:'7px 14px',background:'#fff',border:'1px solid #E4E2DC',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>Annuler</button>
              <button type="submit" disabled={saving} style={{padding:'7px 14px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                {saving ? 'Enregistrement...' : 'Créer le client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
        {loading ? (
          <div style={{padding:'40px',textAlign:'center',color:'#A8A69F',fontSize:'12px'}}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{padding:'40px',textAlign:'center',color:'#A8A69F',fontSize:'12px'}}>
            {clients.length === 0 ? 'Aucun client — créez le premier.' : 'Aucun résultat.'}
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F7F6F3'}}>
                {['Client','Email','Rôle','Statut',''].map(h => (
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'600',borderBottom:'1px solid #E4E2DC'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{borderBottom:'1px solid #E4E2DC'}}
                  onMouseEnter={e => e.currentTarget.style.background='#F7F6F3'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}
                >
                  <td style={{padding:'11px 12px'}}>
                    <div style={{fontWeight:'500',fontSize:'13px',color:'#1A1916'}}>{c.prenom} {c.nom}</div>
                    <div style={{fontSize:'10px',color:'#A8A69F'}}>{c.societe}</div>
                  </td>
                  <td style={{padding:'11px 12px',fontSize:'12px',color:'#6B6860'}}>{c.email}</td>
                  <td style={{padding:'11px 12px'}}>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#EBF0FD',color:'#1A3DB8'}}>{c.role}</span>
                  </td>
                  <td style={{padding:'11px 12px'}}>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',
                      background:c.statut==='Actif'?'#E6F5ED':c.statut==='Essai'?'#FDF3E3':'#F7F6F3',
                      color:c.statut==='Actif'?'#18865A':c.statut==='Essai'?'#9A5E0A':'#6B6860'
                    }}>{c.statut}</span>
                  </td>
                  <td style={{padding:'11px 12px'}}>
                    <button onClick={() => handleDelete(c.id)} style={{background:'#FCEAEA',border:'1px solid #EABABA',borderRadius:'6px',padding:'3px 8px',cursor:'pointer',fontSize:'11px',color:'#C02B2B',fontFamily:'inherit'}}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}