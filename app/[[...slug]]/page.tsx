'use client';

import { useEffect, useMemo, useState } from 'react';

type Property = { title:string; location:string; meta:string; match:number; image:string };

const properties: Property[] = [
  {title:'Appartement - Golf Malela',location:'Quartier Golf Malela',meta:'2 ch. • 2 sdb • Parking',match:85,image:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80'},
  {title:'Maison - Kenya',location:'Quartier Kenya',meta:'4 ch. • 2 sdb • Parking',match:78,image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80'},
  {title:'Studio - Kampemba',location:'Quartier Kampemba',meta:'1 ch. • 1 sdb • Meublé',match:72,image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80'},
  {title:'Appartement - Bel Air',location:'Quartier Bel Air',meta:'2 ch. • 1 sdb • Sécurité',match:66,image:'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80'},
];

function go(path:string){ window.history.pushState({},'',path); window.dispatchEvent(new PopStateEvent('popstate')); }

function Header(){
  const [connected,setConnected]=useState(true);
  return <header className="topbar">
    <button className="brand" onClick={()=>go('/')}><span className="brand-mark"/>FASTHOME</button>
    <nav className="nav">
      <button onClick={()=>go('/')}>Accueil</button><button onClick={()=>go('/rechercher')}>Rechercher</button><button onClick={()=>go('/comment-ca-marche')}>Comment ça marche</button><button onClick={()=>go('/a-propos')}>À propos</button><button onClick={()=>go('/contact')}>Contact</button>
    </nav>
    <div className="actions">
      {!connected && <><button className="btn btn-light" onClick={()=>go('/connexion')}>Se connecter</button><button className="btn btn-primary" onClick={()=>go('/inscription')}>S'inscrire</button></>}
      {connected && <button className="avatar" aria-label="Profil" onClick={()=>go('/dashboard')}>JD</button>}
      <button className="mobile-menu btn btn-light" onClick={()=>go('/dashboard')}>☰</button>
    </div>
  </header>
}

function PropertyCard({p}:{p:Property}){ return <button className="card property" onClick={()=>go('/bien/appartement-golf-malela')} style={{padding:0,textAlign:'left',border:'1px solid #e1e8f0'}}><img src={p.image} alt=""/><div className="property-body"><span className="match">{p.match}% MATCH</span><div className="property-title">{p.title}</div><div className="property-meta">{p.meta}</div><div className="property-meta">{p.location}</div></div></button> }

function Home(){
  const [query,setQuery]=useState('');
  return <><Header/><main className="container">
    <section className="hero"><div><div className="eyebrow">Immobilier vérifié en RDC</div><h1>Trouvez votre prochain<br/><span>chez-vous</span> en toute confiance.</h1><p>Découvrez des biens vérifiés et trouvez un logement correspondant réellement à vos critères, avec l'accompagnement FASTHOME.</p><div className="searchbox"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ville / quartier"/><select><option>Commune</option><option>Lubumbashi</option><option>Kampemba</option></select><select><option>Type de bien</option><option>Appartement</option><option>Maison</option><option>Studio</option></select><select><option>Budget max.</option><option>300 $</option><option>500 $</option><option>800 $</option></select><button className="btn btn-primary" onClick={()=>go('/rechercher'+(query?`?q=${encodeURIComponent(query)}`:''))}>Rechercher</button></div></div><div className="hero-photo"/></section>
    <section className="features"><Feature icon="✓" title="Biens vérifiés" text="Des annonces contrôlées par FASTHOME."/><Feature icon="◉" title="Matching intelligent" text="Un score expliqué selon vos critères."/><Feature icon="◷" title="Visites sécurisées" text="Des visites planifiées et accompagnées."/><Feature icon="▣" title="Contrats légaux" text="Documents et références uniques."/><Feature icon="△" title="Accompagnement" text="Une équipe à chaque étape."/></section>
    <div className="section-head"><h2>Biens populaires</h2><button className="btn btn-light" onClick={()=>go('/rechercher')}>Voir plus →</button></div>
    <div className="property-grid">{properties.map((p,i)=><PropertyCard p={p} key={i}/>)}</div>
  </main></>
}
function Feature({icon,title,text}:{icon:string;title:string;text:string}){return <div className="feature"><div className="feature-icon">{icon}</div><strong>{title}</strong><small>{text}</small></div>}

function Search(){return <><Header/><main className="container"><div className="section-head"><div><div className="eyebrow">Recherche</div><h1 className="page-title">Trouvez les biens qui vous correspondent</h1><span className="muted">22 biens trouvés à Lubumbashi</span></div><button className="btn btn-primary" onClick={()=>go('/matching')}>Mon matching</button></div><div className="card" style={{padding:16,marginBottom:16}}><div className="form-grid"><Field label="Ville" value="Lubumbashi"/><Field label="Quartier" value="Golf Malela"/><Field label="Type" value="Appartement"/><Field label="Budget maximum" value="500 $"/></div></div><div className="property-grid">{properties.map((p,i)=><PropertyCard p={p} key={i}/>)}</div></main></>}
function Field({label,value}:{label:string;value:string}){return <div className="field"><label>{label}</label><input defaultValue={value}/></div>}

function Detail(){const p=properties[0];return <><Header/><main className="container"><button className="btn btn-light" onClick={()=>go('/rechercher')}>← Retour</button><div className="two-col" style={{marginTop:14}}><section className="panel"><img src={p.image} alt="Appartement" style={{width:'100%',height:330,objectFit:'cover',borderRadius:12}}/><div className="property-grid" style={{marginTop:10}}>{properties.slice(1).map((x,i)=><img key={i} src={x.image} alt="" style={{width:'100%',height:90,objectFit:'cover',borderRadius:9}}/>)}</div><h1 className="page-title" style={{marginTop:18}}>Appartement - Golf Malela</h1><div className="muted">Golf Malela • Lubumbashi • Adresse exacte masquée</div><p style={{lineHeight:1.7,color:'#65748a'}}>Bel appartement moderne, lumineux et sécurisé. Les informations sensibles du propriétaire, le prix exact et l'adresse précise restent protégés jusqu'aux étapes autorisées du parcours.</p><div className="toolbar"><button className="btn btn-primary" onClick={()=>go('/visite/nouvelle')}>Demander une visite</button><button className="btn btn-light">♡ Ajouter aux favoris</button></div></section><aside className="panel"><div className="match" style={{float:'none',display:'inline-block'}}>85% MATCH</div><h3 style={{fontSize:20,marginTop:14}}>Pourquoi ce bien vous correspond ?</h3>{[['Budget','25/25'],['Localisation','20/25'],['Chambres','15/15'],['Commodités','15/20'],['Type de bien','10/10'],['Sécurité','10/10']].map(([a,b])=><div className="row" key={a}><span>{a}</span><b>{b}</b></div>)}<div className="notice" style={{marginTop:14}}>Ce bien correspond parfaitement à votre budget et au nombre de chambres recherché. Le parking réduit légèrement le score.</div></aside></div></main></>}

const sideItems:[string,string][]=[['⌂','Tableau de bord'],['⌕','Rechercher'],['♡','Mes favoris'],['▦','Mes publications'],['◷','Mes demandes de visite'],['◉','Mes visites'],['□','Mes contrats'],['$','Mes paiements'],['◴','Mes échéances'],['✉','Mes messages'],['!','Notifications'],['●','Mon profil'],['⚙','Paramètres']];
function Sidebar({active='Tableau de bord'}:{active?:string}){return <aside className="sidebar"><div className="side-brand">⌂ FASTHOME</div>{sideItems.map(([ic,t])=><button className={'side-item '+(active===t?'active':'')} key={t} onClick={()=>go('/'+routeFor(t))}>{ic}&nbsp;&nbsp;{t}</button>)}</aside>}
function routeFor(t:string){const m:{[key:string]:string}={'Tableau de bord':'dashboard','Rechercher':'rechercher','Mes favoris':'favoris','Mes publications':'publications','Mes demandes de visite':'demandes-visite','Mes visites':'visites','Mes contrats':'contrats','Mes paiements':'paiements','Mes échéances':'echeances','Mes messages':'messages','Notifications':'notifications','Mon profil':'profil','Paramètres':'parametres'};return m[t]||'dashboard'}
function Dashboard(){return <><Header/><main className="container"><div className="dashboard"><Sidebar/><section className="dash-main"><div className="welcome"><div><div className="eyebrow">Espace personnel</div><h1 className="page-title">Bonjour Jean 👋</h1><div className="muted">Voici un résumé de votre activité.</div></div><button className="btn btn-primary" onClick={()=>go('/publications/nouveau')}>+ Ajouter un bien</button></div><div className="stats"><Stat n="2" t="Visites demandées"/><Stat n="1" t="Visite confirmée"/><Stat n="3" t="Publications"/><Stat n="1" t="Contrat actif"/></div><div className="two-col"><section className="panel"><h3>Prochaines actions</h3><div className="row"><span>Visite — Appartement Golf Malela</span><span className="badge yellow">Demain • 10:00</span></div><div className="row"><span>Paiement du loyer</span><span className="badge yellow">15 sept. • 350 $</span></div><div className="row"><span>Contrat FAST-CTR-2026-000125</span><span className="badge green">Actif</span></div></section><section className="panel"><h3>Mon activité propriétaire</h3><div className="row"><span>3 biens publiés</span><b>→</b></div><div className="row"><span>2 demandes reçues</span><b>→</b></div><div className="row"><span>1 paiement attendu</span><b>350 $</b></div></section></div></section></div></main></>}
function Stat({n,t}:{n:string;t:string}){return <div className="stat"><b>{n}</b><span>{t}</span></div>}

function GenericDashboard({title,active}:{title:string;active:string}){return <><Header/><main className="container"><div className="dashboard"><Sidebar active={active}/><section className="dash-main"><div className="section-head"><div><div className="eyebrow">Espace personnel</div><h1 className="page-title">{title}</h1></div><button className="btn btn-primary" onClick={()=>go('/dashboard')}>← Dashboard</button></div><section className="panel"><div className="tabs"><button className="active">Toutes</button><button>En attente</button><button>Actives</button><button>Historique</button></div>{[1,2,3].map(i=><div className="row" key={i}><div><b>Appartement - Golf Malela</b><div className="muted">FAST-BIEN-00084{i} • Lubumbashi</div></div><span className={'badge '+(i===1?'green':'yellow')}>{i===1?'Actif':'En attente'}</span></div>)}</section></section></div></main></>}

function Auth({signup=false}:{signup?:boolean}){return <><Header/><main className="auth"><section className="auth-box"><div className="brand"><span className="brand-mark"/>FASTHOME</div><h1>{signup?'Créer votre compte FASTHOME':'Bienvenue !'}</h1><p>{signup?'Un seul compte pour tout faire.':'Connectez-vous à votre espace.'}</p><div className="stack">{signup&&<><Field label="Nom complet" value=""/><Field label="Téléphone" value=""/></>}<Field label="Email ou téléphone" value=""/><Field label="Mot de passe" value=""/>{signup&&<Field label="Confirmer le mot de passe" value=""/>}<div className="notice">☐ J'accepte les Conditions d'utilisation et la Politique de confidentialité.</div><button className="btn btn-primary" onClick={()=>go('/dashboard')}>{signup?'Créer mon compte':'Se connecter'}</button><button className="btn btn-light" onClick={()=>go(signup?'/connexion':'/inscription')}>{signup?'Déjà un compte ? Se connecter':'Pas encore de compte ? S’inscrire'}</button></div></section></main></>}

function NewProperty(){return <><Header/><main className="container"><div className="form-card"><div className="eyebrow">Mes publications</div><h1 className="page-title">Ajouter un bien</h1><p className="muted">Étape 1 sur 6 — Informations</p><div className="tabs"><button className="active">1 Informations</button><button>2 Caractéristiques</button><button>3 Localisation</button><button>4 Photos</button><button>5 Financier</button><button>6 Résumé</button></div><div className="form-grid"><Field label="Nom du bien" value="Appartement moderne"/><Field label="Type de bien" value="Appartement"/><Field label="Province" value="Haut-Katanga"/><Field label="Ville" value="Lubumbashi"/><Field label="Commune" value="Annexe"/><Field label="Quartier" value="Golf Malela"/><div className="field full"><label>Description</label><textarea defaultValue="Bel appartement moderne situé dans un quartier calme et sécurisé."/></div></div><div className="toolbar"><button className="btn btn-light">Enregistrer brouillon</button><button className="btn btn-primary" onClick={()=>go('/publications')}>Soumettre en vérification</button></div></div></main></>}

function Admin(){return <><Header/><main className="container"><div className="dashboard"><Sidebar active="Tableau de bord"/><section className="dash-main"><div className="welcome"><div><div className="eyebrow">Administration FASTHOME</div><h1 className="page-title">Tableau de bord admin</h1></div><span className="badge red">5 à vérifier</span></div><div className="stats"><Stat n="1 245" t="Utilisateurs"/><Stat n="842" t="Publications"/><Stat n="28" t="Visites aujourd'hui"/><Stat n="514" t="Contrats"/></div><div className="two-col"><section className="panel"><h3>Publications à vérifier</h3>{properties.slice(0,3).map((p,i)=><div className="row" key={i}><span>{p.title}<small className="muted"> • FAST-BIEN-0008{i}</small></span><button className="btn btn-dark" onClick={()=>go('/admin/validation')}>Voir</button></div>)}</section><section className="panel"><h3>Activité</h3><div className="notice">Nouvelles annonces : +18%</div><div className="notice" style={{marginTop:8}}>Visites : +12%</div><div className="notice" style={{marginTop:8}}>Revenus : 12 450 $</div></section></div></section></div></main></>}

function ErrorPage({code='404'}:{code?:string}){return <><Header/><main className="container error-page"><div><div className="error-code">{code}</div><h1>Page introuvable</h1><p className="muted">La page que vous recherchez n'existe pas ou n'est plus disponible.</p><button className="btn btn-primary" onClick={()=>go('/')}>Retour à l'accueil</button></div></main></>}

export default function Page(){
  const [path,setPath]=useState('');
  useEffect(()=>{const update=()=>setPath(window.location.pathname);update();window.addEventListener('popstate',update);return()=>window.removeEventListener('popstate',update)},[]);
  const page=useMemo(()=>{
    if(path==='/'||path==='') return <Home/>;
    if(path==='/rechercher') return <Search/>;
    if(path.startsWith('/bien/')) return <Detail/>;
    if(path==='/matching') return <GenericDashboard title="Matching détaillé" active="Rechercher"/>;
    if(path==='/dashboard') return <Dashboard/>;
    if(path==='/inscription') return <Auth signup/>;
    if(path==='/connexion') return <Auth/>;
    if(path==='/publications/nouveau') return <NewProperty/>;
    if(path.startsWith('/admin')) return <Admin/>;
    const map:{[key:string]:[string,string]}={
      '/favoris':['Mes favoris','Mes favoris'],'/publications':['Mes publications','Mes publications'],'/demandes-visite':['Mes demandes de visite','Mes demandes de visite'],'/visites':['Mes visites','Mes visites'],'/contrats':['Mes contrats','Mes contrats'],'/paiements':['Mes paiements','Mes paiements'],'/echeances':['Mes échéances','Mes échéances'],'/messages':['Mes messages','Mes messages'],'/notifications':['Notifications','Notifications'],'/profil':['Mon profil','Mon profil'],'/parametres':['Paramètres','Paramètres']
    };
    if(map[path]) return <GenericDashboard title={map[path][0]} active={map[path][1]}/>;
    if(path==='/comment-ca-marche'||path==='/a-propos'||path==='/contact') return <GenericDashboard title={path==='/comment-ca-marche'?'Comment ça marche':path==='/a-propos'?'À propos de FASTHOME':'Contact FASTHOME'} active="Tableau de bord"/>;
    if(path==='/visite/nouvelle') return <GenericDashboard title="Demander une visite" active="Mes demandes de visite"/>;
    return <ErrorPage/>;
  },[path]);
  return page;
}
