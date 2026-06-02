'use client';
import { useState, useEffect, useRef } from 'react';
import { getDemandesClient, getBornes, updateDemande } from '../../lib/db';

const FONTS = ['Arial', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Trebuchet MS'];
const COLORS = ['#ffffff', '#000000', '#2E8FA3', '#2B5CE6', '#1D9E75', '#C02B2B', '#9A5E0A', '#5B3DB8'];

export default function EditeurPage() {
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bgColor, setBgColor] = useState('#2E8FA3');
  const [bgImage, setBgImage] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedEl, setSelectedEl] = useState(null);

  const previewRef = useRef(null);

  useEffect(() => {
    async function load() {
      const email = localStorage.getItem('clientEmail');
      if (!email) return;
      const [data, bornes] = await Promise.all([
        getDemandesClient(email),
        getBornes(),
      ]);
      const clientBorne = bornes.find(b => b.clientEmail === email);
      setIsPortrait(clientBorne?.orient?.toLowerCase() === 'portrait');
      const approuvees = data.filter(d =>
        (d.statut === 'Approuv\u00e9e' || d.statut === 'Diffus\u00e9e') && !d.archived
      );
      setDemandes(approuvees);
      setLoading(false);
    }
    load();
  }, []);

  function selectDemande(d) {
    setSelectedDemande(d);
    setSelectedEl(null);
    // Charge l'état sauvegardé si existant
    if (d.editeurState) {
      const state = JSON.parse(d.editeurState);
      setBgColor(state.bgColor || '#2E8FA3');
      setBgImage(state.bgImage || null);
      setElements(state.elements || []);
    } else {
      setBgColor('#2E8FA3');
      setBgImage(null);
      setElements([]);
    }
  }

  function addText() {
    const el = {
      id: Date.now(),
      type: 'text',
      text: 'Votre texte',
      x: 40, y: 40,
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#ffffff',
      bold: false,
      italic: false,
    };
    setElements(prev => [...prev, el]);
    setSelectedEl(el.id);
  }

  function updateElement(id, changes) {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  }

  function removeElement(id) {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedEl === id) setSelectedEl(null);
  }

  function handleBgImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setBgImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleImageElementUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        // Calcule la taille proportionnelle pour la preview
        const maxW = previewW * 0.5;
        const ratio = Math.min(maxW / img.width, maxW / img.height);
        const el = {
          id: Date.now(),
          type: 'image',
          src: ev.target.result,
          x: 40, y: 40,
          width: Math.round(img.width * ratio),
          height: Math.round(img.height * ratio),
        };
        setElements(prev => [...prev, el]);
        setSelectedEl(el.id);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function onMouseDown(e, id) {
    e.stopPropagation();
    e.preventDefault();
    setSelectedEl(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const el = elements.find(el => el.id === id);
    const origX = el.x;
    const origY = el.y;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setElements(prev => prev.map(e2 => e2.id === id ? { ...e2, x: origX + dx, y: origY + dy } : e2));
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  async function handleSave() {
    if (!selectedDemande) return;
    setSaving(true);
    const state = JSON.stringify({ bgColor, bgImage, elements });
    await updateDemande(selectedDemande.id, { editeurState: state });
    setSaving(false);
    alert('Modifications enregistrées !');
  }

  async function handlePublish() {
  if (!selectedDemande) return;
  setPublishing(true);
  try {
    const preview = previewRef.current;
    if (!preview) return;

    // Pour portrait : canvas en 1080x1920, puis on pivote lors de l'upload
    // Pour paysage : canvas en 1920x1080 direct
    const W = isPortrait ? 1080 : 1920;
    const H = isPortrait ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const scaleX = W / preview.offsetWidth;
    const scaleY = H / preview.offsetHeight;

    // Fond
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      await new Promise(r => { img.onload = r; });
      ctx.drawImage(img, 0, 0, W, H);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
    }

    // Éléments
    for (const el of elements) {
      if (el.type === 'text') {
        ctx.fillStyle = el.color;
        const weight = el.bold ? 'bold ' : '';
        const style = el.italic ? 'italic ' : '';
        ctx.font = `${style}${weight}${Math.round(el.fontSize * scaleY)}px ${el.fontFamily}`;
        ctx.fillText(el.text, Math.round(el.x * scaleX), Math.round(el.y * scaleY + el.fontSize * scaleY));
      } else if (el.type === 'image') {
        const img = new Image();
        img.src = el.src;
        await new Promise(r => { img.onload = r; });
        ctx.drawImage(img, Math.round(el.x * scaleX), Math.round(el.y * scaleY), Math.round(el.width * scaleX), Math.round(el.height * scaleY));
      }
    }

    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const filename = selectedDemande.ibFilename || selectedDemande.nom.toLowerCase().replace(/\s+/g, '-') + '.png';

    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('orientation', isPortrait ? 'portrait' : 'paysage');
    formData.append('filename', filename);

    const res = await fetch('/api/infobeamer/upload-rotated', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      await updateDemande(selectedDemande.id, {
        ibAssetId: data.assetId,
        ibThumb: data.thumb || null,
        editeurState: JSON.stringify({ bgColor, bgImage, elements }),
      });
      alert('Votre communication est publiée !');
    } else {
      alert('Erreur : ' + data.error);
    }
  } catch (err) {
    alert('Erreur lors de la publication.');
  }
  setPublishing(false);
}

  const selectedElement = elements.find(el => el.id === selectedEl);
  const previewW = isPortrait ? 200 : 356;
  const previewH = isPortrait ? 356 : 200;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>;

  return (
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: '12px', height: 'calc(100vh - 32px)' }}>

      {/* Panneau gauche */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #E4E2DC', fontSize: '12px', fontWeight: '600', color: '#1A1916' }}>
          Communications
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {demandes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#A8A69F', fontSize: '11px' }}>Aucune communication approuvée</div>
          ) : demandes.map(d => (
            <div
              key={d.id}
              onClick={() => selectDemande(d)}
              style={{
                padding: '10px 12px', borderBottom: '1px solid #E4E2DC', cursor: 'pointer',
                background: selectedDemande?.id === d.id ? '#EBF0FD' : '#fff',
              }}
              onMouseEnter={e => { if (selectedDemande?.id !== d.id) e.currentTarget.style.background = '#F7F6F3'; }}
              onMouseLeave={e => { if (selectedDemande?.id !== d.id) e.currentTarget.style.background = '#fff'; }}
            >
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#1A1916' }}>{d.nom}</div>
              <div style={{ fontSize: '10px', color: '#A8A69F', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {d.type}
                {d.editeurState && <span style={{ background: '#E6F5ED', color: '#18865A', padding: '1px 5px', borderRadius: '10px', fontSize: '9px' }}>Sauvegardé</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone centrale */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>

        {/* Toolbar */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '8px 12px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          <button onClick={addText} style={{ padding: '5px 10px', background: '#EBF0FD', color: '#2B5CE6', border: '1px solid #C5D8F8', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
            + Texte
          </button>
          <label style={{ padding: '5px 10px', background: '#E6F5ED', color: '#18865A', border: '1px solid #AADBC5', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>
            🖼️ Image
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageElementUpload} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderLeft: '1px solid #E4E2DC', paddingLeft: '6px' }}>
            <span style={{ fontSize: '11px', color: '#6B6860' }}>Fond :</span>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '26px', height: '26px', border: '1px solid #E4E2DC', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
            <label style={{ padding: '5px 8px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
              📷 Fond image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgImageUpload} />
            </label>
            {bgImage && <button onClick={() => setBgImage(null)} style={{ padding: '3px 6px', background: '#FCEAEA', color: '#C02B2B', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>✕</button>}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <button
              onClick={handleSave}
              disabled={!selectedDemande || saving}
              style={{ padding: '5px 12px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: selectedDemande ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
            >
              {saving ? '⏳' : '💾 Enregistrer'}
            </button>
            <button
              onClick={handlePublish}
              disabled={!selectedDemande || publishing}
              style={{ padding: '5px 14px', background: selectedDemande ? '#2B5CE6' : '#E4E2DC', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: selectedDemande ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
            >
              {publishing ? '⏳ Publication…' : '🚀 Publier'}
            </button>
          </div>
        </div>

        {/* Canvas preview */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden' }}>
          {!selectedDemande ? (
            <div style={{ textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
              ← Sélectionnez une communication pour commencer
            </div>
          ) : (
            <div
              ref={previewRef}
              style={{
                width: `${previewW}px`,
                height: `${previewH}px`,
                background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,.2)',
                borderRadius: '3px',
                flexShrink: 0,
              }}
              onClick={() => setSelectedEl(null)}
            >
              {elements.map(el => (
                <div
                  key={el.id}
                  onMouseDown={e => onMouseDown(e, el.id)}
                  onClick={e => { e.stopPropagation(); setSelectedEl(el.id); }}
                  style={{
                    position: 'absolute',
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    cursor: 'move',
                    userSelect: 'none',
                    outline: selectedEl === el.id ? '1.5px dashed #2B5CE6' : '1px dashed transparent',
                    padding: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                  {el.type === 'text' ? (
                    <span style={{
                      fontSize: `${Math.round(el.fontSize / (isPortrait ? 9.6 : 5.4))}px`,
                      fontFamily: el.fontFamily,
                      color: el.color,
                      fontWeight: el.bold ? 'bold' : 'normal',
                      fontStyle: el.italic ? 'italic' : 'normal',
                      whiteSpace: 'pre-wrap',
                      display: 'block',
                    }}>
                      {el.text}
                    </span>
                  ) : (
                    <img
                      src={el.src}
                      alt=""
                      style={{
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        display: 'block',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panneau droit — propriétés */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #E4E2DC', fontSize: '12px', fontWeight: '600', color: '#1A1916' }}>
          Propriétés
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {!selectedElement ? (
            <div style={{ textAlign: 'center', color: '#A8A69F', fontSize: '11px', marginTop: '20px' }}>
              Cliquez sur un élément pour le modifier
            </div>
          ) : selectedElement.type === 'text' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Texte</div>
                <textarea
                  value={selectedElement.text}
                  onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #CCC9C0', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Police</div>
                <select
                  value={selectedElement.fontFamily}
                  onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #CCC9C0', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916' }}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Taille : {selectedElement.fontSize}px</div>
                <input type="range" min="12" max="200" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Couleur</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {COLORS.map(col => (
                    <div key={col} onClick={() => updateElement(selectedElement.id, { color: col })} style={{ width: '22px', height: '22px', borderRadius: '4px', background: col, border: selectedElement.color === col ? '2px solid #2B5CE6' : '1px solid #E4E2DC', cursor: 'pointer' }} />
                  ))}
                  <input type="color" value={selectedElement.color} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} style={{ width: '22px', height: '22px', border: '1px solid #E4E2DC', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })} style={{ flex: 1, padding: '5px', background: selectedElement.bold ? '#EBF0FD' : '#F7F6F3', color: selectedElement.bold ? '#2B5CE6' : '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>G</button>
                <button onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })} style={{ flex: 1, padding: '5px', background: selectedElement.italic ? '#EBF0FD' : '#F7F6F3', color: selectedElement.italic ? '#2B5CE6' : '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
                <button onClick={() => removeElement(selectedElement.id)} style={{ flex: 1, padding: '5px', background: '#FCEAEA', color: '#C02B2B', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Largeur : {selectedElement.width}px</div>
                <input type="range" min="20" max={previewW} value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Hauteur : {selectedElement.height}px</div>
                <input type="range" min="20" max={previewH} value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <button onClick={() => removeElement(selectedElement.id)} style={{ padding: '6px', background: '#FCEAEA', color: '#C02B2B', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}