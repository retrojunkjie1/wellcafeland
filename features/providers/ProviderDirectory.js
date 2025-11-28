import React,{useEffect,useState} from 'react';
import {db,auth} from '../../firebase';
import {collection,getDocs,query,where} from 'firebase/firestore';
import '../../styles/providers.css';
import {useNavigate} from 'react-router-dom';

const ProviderDirectory=()=>{
  const navigate=useNavigate();
  const [providers,setProviders]=useState([]);
  const [user,setUser]=useState(null);
  const [search,setSearch]=useState('');

  useEffect(()=>{
    const unsub=auth?.onAuthStateChanged((u)=>setUser(u||null));
    return()=>unsub&&unsub();
  },[]);

  useEffect(()=>{
    const fetchProviders=async()=>{
      // Only show approved+verified in public directory
      const q=query(collection(db,'providers'),
        where('verificationStatus','==','approved'),
        where('verified','==',true)
      );
      const snap=await getDocs(q);
      const docs=snap.docs.map((d)=>({id:d.id,...d.data()}));
      setProviders(docs);
    };
    fetchProviders();
  },[]);

  const filtered=providers.filter((p)=>
    (p.fullName?.toLowerCase()||'').includes(search.toLowerCase()) ||
    (p.serviceTypes?.join(' ').toLowerCase()||'').includes(search.toLowerCase())
  );

  return(
    <section className="pv-wrap">
      <div className="pv-header-row">
        <div>
          <h1 className="pv-title">Find a Wellness Professional</h1>
          <p className="pv-sub">Browse verified providers. Create an account to unlock full profiles and booking.</p>
        </div>
        <div className="pv-cta-right">
          <button className="pv-ghost" onClick={()=>navigate('/providers/apply')}>Become a Provider</button>
          {!user&&<button className="pv-solid" onClick={()=>navigate('/signin')}>Sign In</button>}
        </div>
      </div>

      <input
        type="text"
        className="pv-search"
        placeholder="Search by name or specialty..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      <div className="pv-grid pv-cards">
        {filtered.map((p)=>(
          <div key={p.id} className="pv-card">
            <div className="pv-card-head">
              <div className="pv-avatar">{p.fullName?.charAt(0)||'W'}</div>
              <div>
                <h3 className="pv-name">{p.fullName}</h3>
                <div className="pv-role">{p.role}</div>
              </div>
            </div>

            <div className="pv-services">
              {p.serviceTypes?.slice(0,3).map((s,i)=>(
                <span key={i} className="chip small">{s}</span>
              ))}
            </div>

            <p className="pv-bio">{p.bio?.slice(0,100)}{p.bio?.length>100?'...':''}</p>

            <div className="pv-meta">
              <span>{p.city}, {p.country}</span>
              <span className="pv-rate">${p.ratePerHour}/hr</span>
            </div>

            {user?(
              <a href={p.calendarUrl||'#'} target="_blank" rel="noopener noreferrer" className="pv-book">
                Book Session
              </a>
            ):(
              <div className="pv-login-hint">Sign in to view full profile & contact</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProviderDirectory;
