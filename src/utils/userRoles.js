import {doc, setDoc, getDoc} from "firebase/firestore";
import {db} from "../firebase";

export const createUserProfile = async (user, role="client") => {
  if(!user) return;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if(!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      role: role,
      createdAt: new Date().toISOString()
    });
  }
};
