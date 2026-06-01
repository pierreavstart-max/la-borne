'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getDemandesClient, updateDemande } from '../../lib/db';

const FONTS = ['Arial', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Trebuchet MS'];
const COLORS = ['#ffffff', '#000000', '#2E8FA3', '#2B5CE6', '#1D9E75', '#C02B2B', '#9A5E0A', '#5B3DB8'];

export default function EditeurPage() {
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Etat canvas
  const [bgColor, setBgColor] = useState('#2E8FA3');
  const [bgImage, setBgImage] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedEl, setSelectedEl] = useState(null);
  const [dragging, setDragging] = useState(null);

  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    async function load() {
      const email = localStorage.getItem('clientEmail');
      if (!email) return;
      const data = await getDemandesClient(email);
      const approuvees = data.filter(d =>
        (d.statut === 'Approuv\u00e9e' || d.statut === 'Diffus\u00e9e') && !d.archived
      );
      setDemandes(approuvees);
      setLoading(false);
    }
    load();
  }, []);

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
      const el = {
        id: Date.now(),
        type: 'image',
        src: ev.target.result,
        x: 40, y: 40,
        width: 200, height: 200,
      };
      setElements(prev => [...prev, el]);
      setSelectedEl(el.id);
    };
    reader.readAsDataURL(file);
  }

  // Drag
  function onMouseDown(e, id) {
    e.stopPropagation();
    setSelectedEl(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const el = elements.find(el => el.id === id);
    const origX = el.x;
    const origY = el.y;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      updateElement(id, { x: origX + dx, y: origY + dy });
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  async function handlePublish() {
    if (!selectedDemande) return;
    setPublishing(true);
    try {
      // Génère l'image depuis le canvas
      const canvas = document.createElement('canvas');
      const isPortrait = selectedDemande.orientation === 'portrait';

      // Canvas en 1080x1920 pour portrait, 1920x1080 pour paysage
      const W = isPortrait ? 1080 : 1920;
      const H = isPortrait ? 1920 : 1080;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Scale depuis la preview
      const preview = previewRef.current;
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
          ctx.font = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${el.fontSize * scaleY}px ${el.fontFamily}`;
          ctx.fillText(el.text, el.x * scaleX, el.y * scaleY + el.fontSize * scaleY);
        } else if (el.type === 'image') {
          const img = new Image();
          img.src = el.src;
          await new Promise(r => { img.onload = r; });
          ctx.drawImage(img, el.x * scaleX, el.y * scaleY, el.width * scaleX, el.height * scaleY);
        }
      }

      // Convertit en blob
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
        });
        alert('Communication publiée sur info-beamer !');
      } else {
        alert('Erreur : ' + data.error);
      }
    } catch (err) {
      alert('Erreur lors de la publication.');
    }
    setPublishing(false);
  }

  const selectedElement = elements.find(el => el.id === selectedEl);
  const isPortrait = selectedDemande?.orientation === 'portrait';
  const previewW = isPortrait ? 200 : 356;
  const previewH = isPortrait ? 356 : 200;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>Chargement…</div>;

  return (
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '220px 1fr 240px', gap: '14px', height: 'calc(100vh - 48px)' }}>

      {/* Panneau gauche — sélection communication */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #E4E2DC', fontSize: '12px', fontWeight: '600', color: '#1A1916' }}>
          Communications
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {demandes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#A8A69F', fontSize: '11px' }}>
              Aucune communication approuvée
            </div>
          ) : demandes.map(d => (
            <div
              key={d.id}
              onClick={() => setSelectedDemande(d)}
              style={{
                padding: '10px 14px', borderBottom: '1px solid #E4E2DC', cursor: 'pointer', fontSize: '12px',
                background: selectedDemande?.id === d.id ? '#EBF0FD' : '#fff',
                color: '#1A1916', fontWeight: selectedDemande?.id === d.id ? '600' : '400',
              }}
              onMouseEnter={e => { if (selectedDemande?.id !== d.id) e.currentTarget.style.background = '#F7F6F3'; }}
              onMouseLeave={e => { if (selectedDemande?.id !== d.id) e.currentTarget.style.background = '#fff'; }}
            >
              <div style={{ fontWeight: '500' }}>{d.nom}</div>
              <div style={{ fontSize: '10px', color: '#A8A69F', marginTop: '2px' }}>{d.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone centrale — canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Toolbar */}
        <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={addText} style={{ padding: '5px 12px', background: '#EBF0FD', color: '#2B5CE6', border: '1px solid #C5D8F8', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
            + Texte
          </button>
          <label style={{ padding: '5px 12px', background: '#E6F5ED', color: '#18865A', border: '1px solid #AADBC5', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>
            🖼️ Image
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageElementUpload} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px', borderLeft: '1px solid #E4E2DC', paddingLeft: '8px' }}>
            <span style={{ fontSize: '11px', color: '#6B6860' }}>Fond :</span>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '28px', height: '28px', border: '1px solid #E4E2DC', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
            <label style={{ padding: '5px 10px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
              📷 Fond image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgImageUpload} />
            </label>
            {bgImage && (
              <button onClick={() => setBgImage(null)} style={{ padding: '5px 8px', background: '#FCEAEA', color: '#C02B2B', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>✕</button>
            )}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={handlePublish}
              disabled={!selectedDemande || publishing}
              style={{ padding: '6px 16px', background: selectedDemande ? '#2B5CE6' : '#E4E2DC', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: selectedDemande ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
            >
              {publishing ? '⏳ Publication…' : '🚀 Publier sur info-beamer'}
            </button>
          </div>
        </div>

        {/* Preview canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '20px' }}>
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
                background: bgImage ? `url(${bgImage}) center/cover` : bgColor,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,.15)',
                borderRadius: '4px',
                cursor: 'default',
              }}
              onClick={() => setSelectedEl(null)}
            >
              {elements.map(el => (
                <div
                  key={el.id}
                  onMouseDown={e => onMouseDown(e, el.id)}
                  style={{
                    position: 'absolute',
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    cursor: 'move',
                    userSelect: 'none',
                    outline: selectedEl === el.id ? '1.5px dashed #2B5CE6' : 'none',
                    padding: '2px',
                  }}
                >
                  {el.type === 'text' ? (
                    <span style={{
                      fontSize: `${el.fontSize / 5}px`,
                      fontFamily: el.fontFamily,
                      color: el.color,
                      fontWeight: el.bold ? 'bold' : 'normal',
                      fontStyle: el.italic ? 'italic' : 'normal',
                      whiteSpace: 'nowrap',
                    }}>
                      {el.text}
                    </span>
                  ) : (
                    <img src={el.src} alt="" style={{ width: `${el.width / 5}px`, height: `${el.height / 5}px`, display: 'block' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panneau droit — propriétés */}
      <div style={{ background: '#fff', border: '1px solid #E4E2DC', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #E4E2DC', fontSize: '12px', fontWeight: '600', color: '#1A1916' }}>
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
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #CCC9C0', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916', resize: 'vertical', minHeight: '60px' }}
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
                <input
                  type="range" min="12" max="200"
                  value={selectedElement.fontSize}
                  onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Couleur</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {COLORS.map(col => (
                    <div
                      key={col}
                      onClick={() => updateElement(selectedElement.id, { color: col })}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', background: col, border: selectedElement.color === col ? '2px solid #2B5CE6' : '1px solid #E4E2DC', cursor: 'pointer' }}
                    />
                  ))}
                  <input type="color" value={selectedElement.color} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} style={{ width: '24px', height: '24px', border: '1px solid #E4E2DC', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })}
                  style={{ flex: 1, padding: '5px', background: selectedElement.bold ? '#EBF0FD' : '#F7F6F3', color: selectedElement.bold ? '#2B5CE6' : '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  G
                </button>
                <button
                  onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}
                  style={{ flex: 1, padding: '5px', background: selectedElement.italic ? '#EBF0FD' : '#F7F6F3', color: selectedElement.italic ? '#2B5CE6' : '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontStyle: 'italic' }}
                >
                  I
                </button>
                <button
                  onClick={() => removeElement(selectedElement.id)}
                  style={{ flex: 1, padding: '5px', background: '#FCEAEA', color: '#C02B2B', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Largeur : {selectedElement.width}px</div>
                <input type="range" min="50" max="1920" value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Hauteur : {selectedElement.height}px</div>
                <input type="range" min="50" max="1920" value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <button
                onClick={() => removeElement(selectedElement.id)}
                style={{ padding: '6px', background: '#FCEAEA', color: '#C02B2B', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
              >
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}