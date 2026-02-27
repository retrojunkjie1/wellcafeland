import {onAuthStateChanged,signInAnonymously} from "firebase/auth"

export const bootstrapAnonymousAuth=(auth)=>(
  new Promise((resolve,reject)=>{
    if (!auth) return resolve(null)
    if (auth.currentUser) return resolve(auth.currentUser)

    const unsub=onAuthStateChanged(auth,async(u)=>{
      unsub()
      try{
        if (u) return resolve(u)
        const cred=await signInAnonymously(auth)
        return resolve(cred.user)
      }catch(e){
        return reject(e)
      }
    })
  })
)
