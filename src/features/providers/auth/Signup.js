import React, {useState} from "react";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {auth} from "../../firebase";
import {createUserProfile} from "../../utils/userRoles";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user, role);
      setMessage("Account created successfully!");
    } catch(err) {
      console.error(err);
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="bg-black/50 p-10 rounded-2xl shadow-2xl border border-gold-400 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gold-400">Create Your WellnessCafe Account</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gold-300 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gold-300 focus:outline-none"
          />

          <select
            value={role}
            onChange={(e)=>setRole(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gold-300"
          >
            <option value="client">Client</option>
            <option value="provider">Provider</option>
          </select>

          <button type="submit" disabled={loading} className="w-full py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded font-semibold hover:opacity-90">
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gold-300">{message}</p>}
      </div>
    </div>
  );
}
