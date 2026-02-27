import React from "react"
import {useNavigate} from "react-router-dom"

export const NotReady=({title="Coming online",message="This feature is being prepared."})=>{
  const nav=useNavigate()
  return (
    <div style={{padding:"24px"}}>
      <div style={{fontSize:"18px",fontWeight:600,marginBottom:"8px"}}>{title}</div>
      <div style={{opacity:0.85,marginBottom:"16px"}}>{message}</div>
      <button onClick={()=>(nav(-1))} style={{padding:"10px 14px",borderRadius:"10px"}}>
        Back
      </button>
    </div>
  )
}
