import React,{useEffect,useState} from 'react';
import {db} from '../../firebase';
import {collection,getDocs,doc,updateDoc} from 'firebase/firestore';
import '../../styles/providers.css';

const AdminVerify=()=>{
  const [providers,setProviders]=useState([]);

  useEffect(()=>{
    const fetchAll=async()=>{
      const snap=await getDocs(collection(db,'providers'));
      setProviders(snap.docs.map((d)=>({id:d.id,...d.data()})));
    };
    fetchAll();
  },[]);

  const setStatus=async(id,verificationStatus,verified)=>{
    await updateDoc(doc(db,'providers',id),{verificationStatus,verified});
    setProviders((prev)=>prev.map((p)=>p.id===id?{...p,verificationStatus,verified}:p));
  };

  return(
    <section className="pv-wrap">
      <h1 className="pv-title">Admin — Provider Verification</h1>
      <p className="pv-sub">Approve or reject applications. Only approved+verified appear publicly.</p>

      <div className="pv-grid pv-cards">
        {providers.map((p)=>(
          <div key={p.id} className="pv-card">
            <h3 className="pv-name">{p.fullName} <span className="pv-role">({p.role})</span></h3>
            <div className="pv-meta"><span>{p.city}, {p.country}</span><span className="pv-rate">${p.ratePerHour}/hr</span></div>
            <p className="pv-bio"><strong>Lic:</strong> {p.licenseNumber||'-'} {p.licenseState?`(${p.licenseState})`:''} {p.licenseExpires?`exp ${p.licenseExpires}`:''}</p>
            <p className="pv-bio"><strong>NPI:</strong> {p.npiNumber||'-'}</p>
            <p className="pv-bio">{p.bio}</p>
            <div className="pv-admin-actions">
              <button className="pv-solid" onClick={()=>setStatus(p.id,'approved',true)}>Approve</button>
              <button className="pv-ghost" onClick={()=>setStatus(p.id,'rejected',false)}>Reject</button>
              <button className="pv-ghost" onClick={()=>setStatus(p.id,'pending_review',false)}>Reset</button>
            </div>
            <div className="pv-status">Status: <strong>{p.verificationStatus||'pending_review'}</strong> • Verified: <strong>{String(p.verified)}</strong></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminVerify;
