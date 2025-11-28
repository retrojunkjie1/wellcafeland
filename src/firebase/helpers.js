// @ts-check
import {
  collection as firestoreCollection,
  doc as firestoreDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  setDoc as firestoreSetDoc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  deleteDoc as firestoreDeleteDoc,
  query as firestoreQuery,
  where as firestoreWhere,
  orderBy as firestoreOrderBy,
  onSnapshot as firestoreOnSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { FirestoreSchema } from './schema';

/**
 * @typedef {keyof FirestoreSchema} CollectionName
 */

/**
 * Gets a typed collection reference.
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @returns {import('firebase/firestore').CollectionReference<FirestoreSchema[C]>}
 */
export const getCollection = (collectionName) => {
  return firestoreCollection(db, collectionName);
};

/**
 * Gets a typed document reference.
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @param {string} id The document ID.
 * @returns {import('firebase/firestore').DocumentReference<FirestoreSchema[C]>}
 */
export const getDocRef = (collectionName, id) => {
  return firestoreDoc(db, collectionName, id);
};

/**
 * Adds a document to a collection with type safety.
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @param {FirestoreSchema[C]} data The document data.
 * @returns {Promise<import('firebase/firestore').DocumentReference<FirestoreSchema[C]>>}
 */
export const addDoc = (collectionName, data) => {
  const collRef = getCollection(collectionName);
  // Type assertion for the data being passed to the original addDoc
  return firestoreAddDoc(collRef, /** @type {any} */ (data));
};

/**
 * Updates a document with type safety.
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @param {string} id The document ID.
 * @param {Partial<FirestoreSchema[C]>} data The data to update.
 * @returns {Promise<void>}
 */
export const updateDoc = (collectionName, id, data) => {
  const docRef = getDocRef(collectionName, id);
  // Type assertion for the data being passed to the original updateDoc
  return firestoreUpdateDoc(docRef, /** @type {any} */ (data));
};

/**
 * Sets a document with type safety (overwrites the document).
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @param {string} id The document ID.
 * @param {FirestoreSchema[C]} data The full document data.
 * @returns {Promise<void>}
 */
export const setDoc = (collectionName, id, data) => {
    const docRef = getDocRef(collectionName, id);
    return firestoreSetDoc(docRef, data);
};

/**
 * Gets a single document's data with type safety.
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @param {string} id The document ID.
 * @returns {Promise<FirestoreSchema[C] | undefined>}
 */
export const getDocData = async (collectionName, id) => {
    const docRef = getDocRef(collectionName, id);
    const docSnap = await firestoreGetDoc(docRef);
    return docSnap.exists() ? docSnap.data() : undefined;
};

/**
 * Gets all documents from a collection with type safety.
 * @template {CollectionName} C
 * @param {C} collectionName The name of the collection.
 * @returns {Promise<Array<FirestoreSchema[C] & {id: string}>>}
 */
export const getCollectionData = async (collectionName) => {
    const collRef = getCollection(collectionName);
    const snapshot = await firestoreGetDocs(collRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


/**
 * Deletes a document.
 * @param {CollectionName} collectionName The name of the collection.
 * @param {string} id The document ID.
 * @returns {Promise<void>}
 */
export const deleteDoc = (collectionName, id) => {
    const docRef = getDocRef(collectionName, id);
    return firestoreDeleteDoc(docRef);
};

// Exporting query-related functions directly as they are modular
export { firestoreQuery as query, firestoreWhere as where, firestoreOrderBy as orderBy, firestoreOnSnapshot as onSnapshot }; 
// Re-export db for convenience
export { db };