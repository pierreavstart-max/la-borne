'use client';
import { useState, useEffect, useRef } from 'react';
import { getDemandesClient, getBornes, updateDemande } from '../../lib/db';

const FONTS = ['Arial', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Trebuchet MS'];
const COLORS = ['#ffffff', '#000000', '#2E8FA3', '#2B5CE6', '#1D9E75', '#C02B2B', '#9A5E0A', '#5B3DB8'];
const SCALE = 0.5;

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
      x: 100, y: 100,
      fontSize: 80,
      fontFamily: 'Arial',
      color: '#ffffff',
      bold: false,
      italic: false,
    };
    setElements(prev => [...prev, el]);
    setSelectedEl(el.id);
  }

  function addVideoZone() {
    const W = isPortrait ? 1080 : 1920;
    const H = isPortrait ? 1920 : 1080;
    const el = {
      id: Date.now(),
      type: 'video',
      x: 100, y: Math.round(H * 0.2),
      width: Math.round(W * 0.8),
      height: Math.round(H * 0.6),
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
        const maxW = (isPortrait ? 1080 : 1920) * 0.4;
        const ratio = Math.min(maxW / img.width, maxW / img.height);
        const el = {
          id: Date.now(),
          type: 'image',
          src: ev.target.result,
          x: 100, y: 100,
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
      const dx = (ev.clientX - startX) / SCALE;
      const dy = (ev.clientY - startY) / SCALE;
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

  async function handleVideoUpload(videoFile) {
  if (videoFile.size > 50 * 1024 * 1024) {
    alert('Fichier trop volumineux. Maximum 50MB.');
    return;
  }

  setPublishing(true);
  try {
    alert('Assemblage en cours — cela peut prendre quelques minutes. Ne fermez pas cette page.');

    const W = isPortrait ? 1080 : 1920;
    const H = isPortrait ? 1920 : 1080;

    // Canvas de rendu
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Prépare le fond
    let bgImg = null;
    if (bgImage) {
      bgImg = new Image();
      bgImg.src = bgImage;
      await new Promise(r => { bgImg.onload = r; });
    }

    // Prépare les images overlay
    const imgEls = {};
    for (const el of elements) {
      if (el.type === 'image') {
        const img = new Image();
        img.src = el.src;
        await new Promise(r => { img.onload = r; });
        imgEls[el.id] = img;
      }
    }

    // Prépare la vidéo source
    const videoZone = elements.find(el => el.type === 'video');
    const videoUrl = URL.createObjectURL(videoFile);
    const videoEl = document.createElement('video');
    videoEl.src = videoUrl;
    videoEl.muted = true;
    videoEl.playsInline = true;
    await new Promise(r => { videoEl.onloadedmetadata = r; });

    // Rotation pour portrait
    let finalX = videoZone.x;
    let finalY = videoZone.y;
    let finalW = videoZone.width;
    let finalH = videoZone.height;

    if (isPortrait) {
      finalX = 1920 - videoZone.y - videoZone.height;
      finalY = videoZone.x;
      finalW = videoZone.height;
      finalH = videoZone.width;
    }

    function drawFrame() {
      // Fond
      if (bgImg) {
        if (isPortrait) {
          ctx.save();
          ctx.translate(W, 0);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(bgImg, 0, 0, H, W);
          ctx.restore();
        } else {
          ctx.drawImage(bgImg, 0, 0, W, H);
        }
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, W, H);
      }

      // Vidéo dans sa zone
      ctx.drawImage(videoEl, finalX, finalY, finalW, finalH);

      // Textes et images overlay
      for (const el of elements) {
        if (el.type === 'text') {
          const weight = el.bold ? 'bold ' : '';
          const style = el.italic ? 'italic ' : '';
          let elX = el.x;
          let elY = el.y + el.fontSize;
          if (isPortrait) {
            ctx.save();
            ctx.translate(W, 0);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = el.color;
            ctx.font = `${style}${weight}${el.fontSize}px ${el.fontFamily}`;
            ctx.fillText(el.text, elX, elY);
            ctx.restore();
          } else {
            ctx.fillStyle = el.color;
            ctx.font = `${style}${weight}${el.fontSize}px ${el.fontFamily}`;
            ctx.fillText(el.text, elX, elY);
          }
        } else if (el.type === 'image' && imgEls[el.id]) {
          if (isPortrait) {
            ctx.save();
            ctx.translate(W, 0);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(imgEls[el.id], el.x, el.y, el.width, el.height);
            ctx.restore();
          } else {
            ctx.drawImage(imgEls[el.id], el.x, el.y, el.width, el.height);
          }
        }
      }
    }

    // Capture du canvas avec MediaRecorder
    const stream = canvas.captureStream(25);
    
    // Ajoute l'audio si disponible
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(videoEl);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.connect(audioCtx.destination);
    stream.addTrack(dest.stream.getAudioTracks()[0]);

    const chunks = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    // Lance l'enregistrement
    recorder.start(100);
    videoEl.currentTime = 0;
    await videoEl.play();

    // Dessine les frames pendant la durée de la vidéo
    await new Promise(resolve => {
      const interval = setInterval(() => {
        drawFrame();
        if (videoEl.ended || videoEl.currentTime >= videoEl.duration) {
          clearInterval(interval);
          resolve();
        }
      }, 1000 / 25);
    });

    recorder.stop();
    await new Promise(r => { recorder.onstop = r; });
    URL.revokeObjectURL(videoUrl);

    // Crée le blob final
    const webmBlob = new Blob(chunks, { type: mimeType });
    const filename = selectedDemande.ibFilename || selectedDemande.nom.toLowerCase().replace(/\s+/g, '-') + '.mp4';

    // Upload sur info-beamer via notre API
    const keyRes = await fetch('/api/infobeamer/get-upload-token');
    const { token } = await keyRes.json();

    const form = new FormData();
    form.append('file', webmBlob, filename);

    const uploadRes = await fetch('https://info-beamer.com/api/v1/asset/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + btoa('api:' + token) },
      body: form,
    });
    const uploadData = await uploadRes.json();

    if (uploadData.ok) {
      await updateDemande(selectedDemande.id, {
        ibAssetId: uploadData.asset_id,
        ibThumb: uploadData.info?.thumb || null,
        editeurState: JSON.stringify({ bgColor, bgImage, elements }),
      });
      alert('Votre communication est publiée !');
    } else {
      alert('Erreur upload : ' + uploadData.error);
    }

  } catch (err) {
    console.error(err);
    alert('Erreur lors de la publication : ' + err.message);
  }
  setPublishing(false);
}

  async function handlePublish() {
    if (!selectedDemande) return;

    const hasVideoZone = elements.some(el => el.type === 'video');
    if (selectedDemande.type === 'Vid\u00e9o' && hasVideoZone) {
      const state = JSON.stringify({ bgColor, bgImage, elements });
      await updateDemande(selectedDemande.id, { editeurState: state });
      document.getElementById('video-upload-input').click();
      return;
    }

    setPublishing(true);
    try {
      const W = isPortrait ? 1080 : 1920;
      const H = isPortrait ? 1920 : 1080;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      if (bgImage) {
        const img = new Image();
        img.src = bgImage;
        await new Promise(r => { img.onload = r; });
        ctx.drawImage(img, 0, 0, W, H);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, W, H);
      }

      for (const el of elements) {
        if (el.type === 'text') {
          ctx.fillStyle = el.color;
          const weight = el.bold ? 'bold ' : '';
          const style = el.italic ? 'italic ' : '';
          ctx.font = `${style}${weight}${el.fontSize}px ${el.fontFamily}`;
          ctx.fillText(el.text, Math.round(el.x), Math.round(el.y + el.fontSize));
        } else if (el.type === 'image') {
          const img = new Image();
          img.src = el.src;
          await new Promise(r => { img.onload = r; });
          ctx.drawImage(img, Math.round(el.x), Math.round(el.y), Math.round(el.width), Math.round(el.height));
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
  const canvasW = isPortrait ? 1080 : 1920;
  const canvasH = isPortrait ? 1920 : 1080;

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#A8A69F', fontSize: '12px' }}>
      Chargement…
    </div>
  );

  return (
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: '12px', height: 'calc(100vh - 32px)' }}>

      {/* Input vidéo caché */}
      <input
        id="video-upload-input"
        type="file"
        accept="video/mp4"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files[0];
          if (file) handleVideoUpload(file);
        }}
      />

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
                {d.editeurState && (
                  <span style={{ background: '#E6F5ED', color: '#18865A', padding: '1px 5px', borderRadius: '10px', fontSize: '9px' }}>
                    Sauvegardé
                  </span>
                )}
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
          {selectedDemande?.type === 'Vid\u00e9o' && (
            <button onClick={addVideoZone} style={{ padding: '5px 10px', background: '#FDF3E3', color: '#9A5E0A', border: '1px solid #F0C070', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
              🎬 Zone vidéo
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderLeft: '1px solid #E4E2DC', paddingLeft: '6px' }}>
            <span style={{ fontSize: '11px', color: '#6B6860' }}>Fond :</span>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '26px', height: '26px', border: '1px solid #E4E2DC', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
            <label style={{ padding: '5px 8px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
              📷 Fond image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgImageUpload} />
            </label>
            {bgImage && (
              <button onClick={() => setBgImage(null)} style={{ padding: '3px 6px', background: '#FCEAEA', color: '#C02B2B', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>✕</button>
            )}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <button onClick={handleSave} disabled={!selectedDemande || saving} style={{ padding: '5px 12px', background: '#F7F6F3', color: '#6B6860', border: '1px solid #E4E2DC', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: selectedDemande ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              {saving ? '⏳' : '💾 Enregistrer'}
            </button>
            <button onClick={handlePublish} disabled={!selectedDemande || publishing} style={{ padding: '5px 14px', background: selectedDemande ? '#2B5CE6' : '#E4E2DC', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: selectedDemande ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              {publishing ? '⏳ Publication…' : '🚀 Publier'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, overflow: 'auto', background: '#F7F6F3', border: '1px solid #E4E2DC', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          {!selectedDemande ? (
            <div style={{ textAlign: 'center', color: '#A8A69F', fontSize: '12px', alignSelf: 'center' }}>
              ← Sélectionnez une communication pour commencer
            </div>
          ) : (
            <div style={{
              width: `${canvasW * SCALE}px`,
              height: `${canvasH * SCALE}px`,
              flexShrink: 0,
              position: 'relative',
            }}>
              <div
                ref={previewRef}
                style={{
                  width: `${canvasW}px`,
                  height: `${canvasH}px`,
                  background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor,
                  position: 'absolute',
                  top: 0, left: 0,
                  transform: `scale(${SCALE})`,
                  transformOrigin: 'top left',
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,.2)',
                  borderRadius: '3px',
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
                      outline: selectedEl === el.id ? '4px dashed #2B5CE6' : '2px dashed transparent',
                      padding: '4px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {el.type === 'text' ? (
                      <span style={{
                        fontSize: `${el.fontSize}px`,
                        fontFamily: el.fontFamily,
                        color: el.color,
                        fontWeight: el.bold ? 'bold' : 'normal',
                        fontStyle: el.italic ? 'italic' : 'normal',
                        whiteSpace: 'pre-wrap',
                        display: 'block',
                      }}>
                        {el.text}
                      </span>
                    ) : el.type === 'image' ? (
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
                    ) : el.type === 'video' ? (
                      <div style={{
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        background: 'rgba(0,0,0,0.6)',
                        border: '6px dashed rgba(255,255,255,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: '16px',
                        boxSizing: 'border-box',
                      }}>
                        <span style={{ fontSize: '80px' }}>🎬</span>
                        <span style={{ fontSize: '36px', color: '#fff', fontFamily: 'Arial', fontWeight: '600' }}>Zone vidéo</span>
                        <span style={{ fontSize: '28px', color: 'rgba(255,255,255,.6)', fontFamily: 'Arial' }}>{el.width} × {el.height}px</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panneau droit */}
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
                <select value={selectedElement.fontFamily} onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })} style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #CCC9C0', borderRadius: '6px', fontFamily: 'inherit', color: '#1A1916' }}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Taille : {selectedElement.fontSize}px</div>
                <input type="range" min="20" max="300" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} style={{ width: '100%' }} />
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
          ) : selectedElement.type === 'video' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px', background: '#FDF3E3', border: '1px solid #F0C070', borderRadius: '6px', fontSize: '11px', color: '#9A5E0A', lineHeight: 1.5 }}>
                🎬 Définissez la zone où sera placée votre vidéo. Cliquez sur Publier pour uploader votre fichier MP4.
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Largeur : {selectedElement.width}px</div>
                <input type="range" min="100" max={canvasW} value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Hauteur : {selectedElement.height}px</div>
                <input type="range" min="100" max={canvasH} value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <button onClick={() => removeElement(selectedElement.id)} style={{ padding: '6px', background: '#FCEAEA', color: '#C02B2B', border: '1px solid #EABABA', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                🗑️ Supprimer
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Largeur : {selectedElement.width}px</div>
                <input type="range" min="20" max={canvasW} value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6B6860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '4px' }}>Hauteur : {selectedElement.height}px</div>
                <input type="range" min="20" max={canvasH} value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} style={{ width: '100%' }} />
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