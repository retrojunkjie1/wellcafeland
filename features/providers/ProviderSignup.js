import React,{useState} from 'react';
import {db,auth} from '../../firebase';
import {addDoc,collection,serverTimestamp} from 'firebase/firestore';
import '../../styles/providers.css';
import ComplianceNotice from '../../components/ComplianceNotice';

const ProviderSignup=()=>{
  const [form,setForm]=useState({
    fullName:'', orgName:'', email:'', phone:'',
    role:'Therapist', certifications:'', years:0,
    serviceTypes:[], ratePerHour:'', meetingModes:[],
    city:'', country:'', bio:'', calendarUrl:'',
    // Licensing / verification
    licenseNumber:'', licenseState:'', licenseExpires:'', npiNumber:'',
    verified:false, verificationStatus:'pending_review',
    // Consents
    hipaaConsent:false, cfr42Consent:false, tosConsent:false
  });
  const [status,setStatus]=useState({ok:false,msg:''});

  const toggleInArray=(field,val)=>{
    setForm((p)=>({...p,[field]:p[field].includes(val)?p[field].filter((v)=>v!==val):[...p[field],val]}));
  };

  const onChange=(e)=>{
    const {name,value,type,checked}=e.target;
    setForm((p)=>({...p,[name]:type==='checkbox'?checked:value}));
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!form.hipaaConsent||!form.cfr42Consent||!form.tosConsent){
      setStatus({ok:false,msg:'Please accept all compliance terms to continue.'});
      return;
    }
    try{
      const uid=auth?.currentUser?.uid||null;
      await addDoc(collection(db,'providers'),{
        ...form,
        years:Number(form.years||0),
        ratePerHour:Number(form.ratePerHour||0),
        ownerUid:uid,
        // Enforce workflow defaults
        verified:false,
        verificationStatus:'pending_review',
        createdAt:serverTimestamp()
      });
      setStatus({ok:true,msg:'Application submitted. We will review and email you shortly.'});
    }catch(err){
      setStatus({ok:false,msg:err?.message||'Failed. Try again.'});
    }
  };

  const serviceList=['Yoga','Acuwellness','Therapy','Counseling','Spiritual','Recovery Coaching','Group Facilitation','Nutrition'];
  const modes=['Video','Chat','In-person'];
  const roles=['Therapist','Counselor','Yogist','Acuwellness','Sponsor','Facility'];

  return(
    <section className="pv-wrap">
      <h1 className="pv-title">Join WellnessCafe Network</h1>
      <p className="pv-sub">Offer sessions via schedules, video and chat. Set your rates, list services, and get matched to clients.</p>

      <ComplianceNotice/>

      <form className="pv-form" onSubmit={handleSubmit}>
        <div className="pv-grid">
          <label>Full name<input name="fullName" value={form.fullName} onChange={onChange} required/></label>
          <label>Organization (optional)<input name="orgName" value={form.orgName} onChange={onChange}/></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={onChange} required/></label>
          <label>Phone<input name="phone" value={form.phone} onChange={onChange}/></label>
          <label>Role
            <select name="role" value={form.role} onChange={onChange}>
              {roles.map((r)=>(<option key={r} value={r}>{r}</option>))}
            </select>
          </label>
          <label>Years experience<input name="years" type="number" min="0" value={form.years} onChange={onChange}/></label>
          <label>Rate per hour (USD)<input name="ratePerHour" type="number" min="0" value={form.ratePerHour} onChange={onChange}/></label>
          <label>City<input name="city" value={form.city} onChange={onChange}/></label>
          <label>Country<input name="country" value={form.country} onChange={onChange}/></label>
          <label>Calendar link (Cal/Calendly)<input name="calendarUrl" value={form.calendarUrl} onChange={onChange}/></label>
        </div>

        <label>Certifications<textarea name="certifications" rows="2" value={form.certifications} onChange={onChange}/></label>
        <label>Bio<textarea name="bio" rows="4" value={form.bio} onChange={onChange} placeholder="Short professional bio"/></label>

        <div className="pv-grid">
          <label>License Number<input name="licenseNumber" value={form.licenseNumber} onChange={onChange}/></label>
          <label>License State/Region<input name="licenseState" value={form.licenseState} onChange={onChange}/></label>
          <label>License Expiry<input name="licenseExpires" type="date" value={form.licenseExpires} onChange={onChange}/></label>
          <label>NPI (if applicable)<input name="npiNumber" value={form.npiNumber} onChange={onChange}/></label>
        </div>

        <div className="pv-chips">
          <div className="pv-chip-label">Service Types</div>
          <div className="pv-chip-list">
            {serviceList.map((s)=>(
              <button type="button" key={s}
                className={form.serviceTypes.includes(s)?'chip active':'chip'}
                onClick={()=>toggleInArray('serviceTypes',s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="pv-chips">
          <div className="pv-chip-label">Meeting Modes</div>
          <div className="pv-chip-list">
            {modes.map((m)=>(
              <button type="button" key={m}
                className={form.meetingModes.includes(m)?'chip active':'chip'}
                onClick={()=>toggleInArray('meetingModes',m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="pv-consents">
          <label className="pv-consent"><input type="checkbox" name="hipaaConsent" checked={form.hipaaConsent} onChange={onChange}/> I acknowledge HIPAA-compliant handling of PHI.</label>
          <label className="pv-consent"><input type="checkbox" name="cfr42Consent" checked={form.cfr42Consent} onChange={onChange}/> I understand 42 CFR Part 2 protections for substance-use data.</label>
          <label className="pv-consent"><input type="checkbox" name="tosConsent" checked={form.tosConsent} onChange={onChange}/> I accept WellnessCafe Terms & Privacy.</label>
        </div>

        <button className="pv-submit" type="submit">Submit Application</button>
        {status.msg && <div className={status.ok?'pv-ok':'pv-err'}>{status.msg}</div>}
      </form>
    </section>
  );
};

export default ProviderSignup;
