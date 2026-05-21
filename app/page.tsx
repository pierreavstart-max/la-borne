'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './lib/firebase';

const ADMIN_EMAILS = ['pierre@la-borne.fr', 'info@la-borne.fr'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      window.location.href = isAdmin ? '/admin' : '/client';
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F2F1EE'}}>
      <div style={{width:'100%',maxWidth:'400px',padding:'24px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{width:'48px',height:'48px',background:'#2B5CE6',borderRadius:'12px',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'700',color:'#fff',marginBottom:'12px'}}>LB</div>
          <div style={{fontSize:'22px',fontWeight:'600',color:'#1A1916'}}>La Borne</div>
          <div style={{fontSize:'12px',color:'#A8A69F',marginTop:'4px'}}>Portail de gestion des communications</div>
        </div>
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'12px',padding:'28px',boxShadow:'0 4px 24px rgba(0,0,0,.06)'}}>
          {error && (
            <div style={{padding:'8px 12px',background:'#FCEAEA',border:'1px solid #EABABA',borderRadius:'6px',fontSize:'11px',color:'#C02B2B',marginBottom:'14px'}}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'10px',fontWeight:'600',color:'#6B6860',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'5px'}}>Adresse email</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                required
                style={{width:'100%',padding:'10px 12px',fontSize:'13px',border:'1px solid #CCC9C0',borderRadius:'6px',fontFamily:'inherit',color:'#1A1916'}}
              />
            </div>
            <div style={{marginBottom:'20px'}}>
              <div style={{fontSize:'10px',fontWeight:'600',color:'#6B6860',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'5px'}}>Mot de passe</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{width:'100%',padding:'10px 12px',fontSize:'13px',border:'1px solid #CCC9C0',borderRadius:'6px',fontFamily:'inherit',color:'#1A1916'}}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{width:'100%',padding:'11px',background:'#2B5CE6',color:'#fff',border:'none',borderRadius:'6px',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}