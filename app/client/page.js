'use client';

export default function ClientDashboard() {
  const stats = [
    {label:'Total commu.',  value:'5', sub:'dont 1 en attente'},
    {label:'Images',        value:'3', sub:'Diffusées',        subColor:'#18865A'},
    {label:'Vidéos',        value:'1', sub:'Diffusée',         subColor:'#18865A'},
    {label:'Bornes',        value:'2', sub:'En ligne',         subColor:'#18865A'},
  ];

  const messages = [
    {titre:'Mise à jour de la plateforme', contenu:'La plateforme sera en maintenance samedi de 22h à 6h.'},
    {titre:'Nouvelle fonctionnalité', contenu:'Vous pouvez désormais synchroniser vos bornes entre elles.'},
  ];

  return (
    <div style={{padding:'24px'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>

        {/* Bienvenue */}
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
            🏠 Bienvenue
          </div>
          <div style={{padding:'16px'}}>
            <p style={{fontSize:'12px',color:'#6B6860',lineHeight:1.6,marginBottom:'14px'}}>
              Depuis cet espace, gérez les visuels affichés sur vos bornes.
            </p>
            {/* Messages admin */}
            {messages.map((m,i) => (
              <div key={i} style={{padding:'10px 12px',background:'#EBF0FD',border:'1px solid #C5D8F8',borderRadius:'6px',marginBottom:'6px',display:'flex',gap:'8px',alignItems:'flex-start'}}>
                <span style={{fontSize:'14px',flexShrink:0}}>📢</span>
                <div>
                  <div style={{fontSize:'12px',fontWeight:'600',color:'#1A3DB8',marginBottom:'2px'}}>{m.titre}</div>
                  <div style={{fontSize:'11px',color:'#1A3DB8',opacity:.85}}>{m.contenu}</div>
                </div>
              </div>
            ))}
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginTop:'10px'}}>
              {stats.map(s => (
                <div key={s.label} style={{background:'#F7F6F3',border:'1px solid #E4E2DC',borderRadius:'8px',padding:'9px 11px'}}>
                  <div style={{fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'500',marginBottom:'4px'}}>{s.label}</div>
                  <div style={{fontSize:'20px',fontWeight:'600',color:'#1A1916',lineHeight:1}}>{s.value}</div>
                  <div style={{fontSize:'10px',color:s.subColor||'#A8A69F',marginTop:'3px'}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <a href="/client/bornes" style={{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'10px',padding:'9px',background:'#2B5CE6',color:'#fff',borderRadius:'6px',fontSize:'12px',fontWeight:'600',textDecoration:'none'}}>
              📺 Gérer mes bornes
            </a>
          </div>
        </div>

        {/* Mode d'emploi */}
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
            ❓ Mode d'emploi
          </div>
          <div style={{padding:'4px 16px'}}>
            {[
              "Qu'est-ce qu'une communication ?",
              "Comment mettre à jour une communication ?",
              "Formats acceptés — image et vidéo",
              "Un problème ? Nous contacter",
            ].map(q => (
              <div key={q} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #E4E2DC',cursor:'pointer'}}>
                <span style={{fontSize:'11px',color:'#2B5CE6'}}>{q}</span>
                <span style={{color:'#A8A69F',fontSize:'12px'}}>›</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}