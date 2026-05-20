'use client';

export default function AdminDashboard() {
  return (
    <div style={{padding:'24px'}}>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        {[
          {label:'Clients',value:'12',sub:'↑ 2 ce mois'},
          {label:'Bornes actives',value:'9',sub:'8 en ligne'},
          {label:'Communications',value:'34',sub:'actives'},
          {label:'Demandes',value:'2',sub:'En attente'},
        ].map(s => (
          <div key={s.label} style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px',padding:'14px 16px'}}>
            <div style={{fontSize:'10px',color:'#A8A69F',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:'500',marginBottom:'6px'}}>{s.label}</div>
            <div style={{fontSize:'24px',fontWeight:'600',color:'#1A1916',letterSpacing:'-.02em',lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:'10px',color:'#A8A69F',marginTop:'4px'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        {/* Clients récents */}
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
            Clients récents
          </div>
          {[
            {initials:'IB',bg:'#E6F1FB',color:'#0C447C',name:'Institut du Beau-Joly',sub:'Camille Miclo · 1 borne',status:'Actif',statusColor:'#18865A',statusBg:'#E6F5ED'},
            {initials:'OL',bg:'#E1F5EE',color:'#085041',name:'Odcvl La Mauselaine',sub:'Juliette Perrin · 2 bornes',status:'Actif',statusColor:'#18865A',statusBg:'#E6F5ED'},
            {initials:'OP',bg:'#FAEEDA',color:'#412402',name:'Odcvl Pont Du Metty',sub:'Martine Vaxelaire · 1 borne',status:'Essai',statusColor:'#9A5E0A',statusBg:'#FDF3E3'},
          ].map(c => (
            <div key={c.name} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',borderBottom:'1px solid #E4E2DC'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:c.bg,color:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'700',flexShrink:0}}>{c.initials}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'500',color:'#1A1916'}}>{c.name}</div>
                <div style={{fontSize:'10px',color:'#A8A69F'}}>{c.sub}</div>
              </div>
              <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:c.statusBg,color:c.statusColor}}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* État des bornes */}
        <div style={{background:'#fff',border:'1px solid #E4E2DC',borderRadius:'10px'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #E4E2DC',fontSize:'13px',fontWeight:'600',color:'#1A1916'}}>
            État des bornes
          </div>
          {[
            {name:'Institut du Beau-Joly',sub:'Mirecourt · Portrait'},
            {name:'Odcvl Artimont',sub:'La Bresse · Paysage'},
            {name:'Odcvl La Mauselaine',sub:'Gérardmer · Portrait'},
          ].map(b => (
            <div key={b.name} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',borderBottom:'1px solid #E4E2DC'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1D9E75',boxShadow:'0 0 0 3px rgba(29,158,117,.15)',flexShrink:0}}></div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'500',color:'#1A1916'}}>{b.name}</div>
                <div style={{fontSize:'10px',color:'#A8A69F'}}>{b.sub}</div>
              </div>
              <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',background:'#E6F5ED',color:'#18865A'}}>En ligne</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}