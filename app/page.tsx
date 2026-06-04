'use client';
import { useState } from 'react';
import { auth } from './lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const ADMIN_EMAILS = ['pierre@la-borne.fr', 'info@la-borne.fr'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      localStorage.setItem('clientEmail', user.email);
      if (ADMIN_EMAILS.includes(user.email)) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/client';
      }
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetMsg('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg('Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.');
    } catch (err) {
      setResetMsg('Adresse email introuvable ou erreur. Vérifiez l\'adresse saisie.');
    }
    setResetLoading(false);
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: '1px solid #CCC9C0', borderRadius: '7px',
    fontFamily: 'inherit', color: '#1A1916', boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F2F1EE', fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '36px 40px',
        width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(0,0,0,.08)',
        border: '1px solid #E4E2DC',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '36px', height: '36px', background: '#2B5CE6', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff' }}>LB</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1916' }}>La Borne</div>
            <div style={{ fontSize: '10px', color: '#A8A69F', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {resetMode ? 'Réinitialisation' : 'Connexion'}
            </div>
          </div>
        </div>

        {!resetMode ? (
          /* Formulaire connexion */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B6860', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '5px', display: 'block' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com" required style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B6860', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '5px', display: 'block' }}>Mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ padding: '8px 11px', background: '#FCEAEA', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '12px', color: '#C02B2B' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '10px', background: '#2B5CE6', color: '#fff', border: 'none',
              borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginTop: '4px', opacity: loading ? .7 : 1,
            }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(true); setResetEmail(email); setError(''); }}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2B5CE6', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', marginTop: '4px' }}
            >
              Mot de passe oublié ?
            </button>
          </form>
        ) : (
          /* Formulaire reset */
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6B6860', lineHeight: 1.6, margin: 0 }}>
              Saisissez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B6860', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '5px', display: 'block' }}>Email</label>
              <input
                type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                placeholder="votre@email.com" required style={inputStyle}
              />
            </div>

            {resetMsg && (
              <div style={{
                padding: '8px 11px', borderRadius: '6px', fontSize: '12px',
                background: resetMsg.includes('envoyé') ? '#E6F5ED' : '#FCEAEA',
                border: `1px solid ${resetMsg.includes('envoyé') ? '#AADBC5' : '#EABABA'}`,
                color: resetMsg.includes('envoyé') ? '#18865A' : '#C02B2B',
              }}>
                {resetMsg}
              </div>
            )}

            <button type="submit" disabled={resetLoading} style={{
              padding: '10px', background: '#2B5CE6', color: '#fff', border: 'none',
              borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: resetLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: resetLoading ? .7 : 1,
            }}>
              {resetLoading ? 'Envoi…' : 'Envoyer le lien'}
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(false); setResetMsg(''); }}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: '#6B6860', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}
            >
              ← Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}