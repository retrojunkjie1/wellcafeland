/**
 * src/data/resources.js
 * Firestore-backed resource directory. Collection: resources
 * Fields: title, type, tags[], verified, location?, contact?, updatedAt
 */

import {collection,query,where,orderBy,limit,startAfter,getDocs,getDoc,doc} from "firebase/firestore"
import {db} from "@/firebase"

const COLLECTION="resources"
const PAGE_SIZE=20

function normalizeBool(value){
  if(value===true) return true
  if(value===false) return false
  return null
}

/**
 * List resources with filters + pagination (indexed, production-correct).
 * @param {{type?:string,verified?:boolean|null,tag?:string,startAfterDoc?:import("firebase/firestore").DocumentSnapshot|null,mode?:"indexed"}} opts
 */
export async function listResources(opts={}){
  if(!db) return {items:[],nextDoc:null,error:"Database not configured"}

  try{
    const {type,tag,startAfterDoc}=opts
    const verified=normalizeBool(opts.verified)

    const colRef=collection(db,COLLECTION)
    const constraints=[]

    if(type) constraints.push(where("type","==",type))
    if(verified!==null) constraints.push(where("verified","==",verified))
    if(tag) constraints.push(where("tags","array-contains",tag))

    constraints.push(orderBy("updatedAt","desc"))
    constraints.push(limit(PAGE_SIZE))

    if(startAfterDoc) constraints.push(startAfter(startAfterDoc))

    const q=query(colRef,...constraints)
    const snap=await getDocs(q)

    const items=snap.docs.map((d) => ({id:d.id,...d.data()}))
    const nextDoc=snap.docs.length===PAGE_SIZE ? snap.docs[snap.docs.length-1] : null

    return {items,nextDoc,error:null}
  }catch(err){
    console.error("[resources] list error:",err)
    return {items:[],nextDoc:null,error:err.message||"Failed to load"}
  }
}

/**
 * Get distinct types and tags for filters (best-effort).
 * Note: For large datasets, move facets to a dedicated doc (e.g. meta/resourceFacets).
 */
export async function getResourceFilters(){
  if(!db) return {types:[],tags:[]}

  try{
    const snap=await getDocs(query(collection(db,COLLECTION),orderBy("updatedAt","desc"),limit(200)))

    const types=new Set()
    const tags=new Set()

    snap.forEach((d) => {
      const d2=d.data()
      if(d2?.type) types.add(d2.type)
      if(Array.isArray(d2?.tags)) d2.tags.forEach((t) => tags.add(t))
    })

    return {types:Array.from(types).sort(),tags:Array.from(tags).sort()}
  }catch{
    return {types:[],tags:[]}
  }
}

/**
 * Get single resource by id
 */
export async function getResource(id){
  if(!db || !id) return null
  try{
    const d=await getDoc(doc(db,COLLECTION,id))
    return d.exists() ? {id:d.id,...d.data()} : null
  }catch(err){
    console.error("[resources] get error:",err)
    return null
  }
}