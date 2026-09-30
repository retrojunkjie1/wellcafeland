import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";
import { HeartHandshake, UserRound } from "lucide-react";

const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const cameFromProvider = ["/provider", "/provider/apply"].includes(location.state?.from?.pathname);
  const [accountIntent, setAccountIntent] = useState(cameFromProvider ? "support" : "client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const destination = ["support", "both"].includes(accountIntent) ? "/provider" : location.state?.from?.pathname || "/home";

  React.useEffect(() => {
    if (isAuthenticated && user && !user.isAnonymous && user.emailVerified) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (!auth || !db) {
      setError("Authentication is not available. Please check your Firebase configuration.");
      setLoading(false);
      return;
    }

    let createdUser = null;
    let verificationSent = false;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      createdUser = user;

      if (name.trim()) {
        await updateProfile(user, {
          displayName: name.trim(),
        });
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name.trim() || null,
        role: "client",
        roles: accountIntent === "support" ? [] : ["client"],
        workspaceIntent: accountIntent === "support" ? "practitioner" : accountIntent,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const verificationUrl = new URL("/verify-email", window.location.origin);
      verificationUrl.searchParams.set("verified", "1");
      verificationUrl.searchParams.set("next", destination);
      await sendEmailVerification(user, { url: verificationUrl.toString(), handleCodeInApp: false });
      verificationSent = true;
      await firebaseSignOut(auth);
      navigate("/verify-email", { replace: true, state: { email: user.email, destination } });
    } catch (err) {
      console.error("Signup error:", err);
      if (createdUser) {
        try { await firebaseSignOut(auth); } catch { /* the account is already signed out */ }
        navigate("/verify-email", {
          replace: true,
          state: {
            email: createdUser.email,
            destination,
            deliveryError: !verificationSent,
            setupIssue: verificationSent,
          },
        });
        return;
      }
      let errorMessage = "Failed to create account. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="lux-card p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Logo variant="default" size="md" showText={true} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
            <p className="text-sm text-muted-foreground">
              Choose how you’re joining WellnessCafe
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-muted-foreground">I’m here to…</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button type="button" aria-pressed={accountIntent === "client"} onClick={() => setAccountIntent("client")}
                className={`min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${accountIntent === "client" ? "border-amber-200/60 bg-amber-200/10" : "border-border bg-background/50 hover:bg-muted/50"}`}>
                <UserRound className="mb-2 h-5 w-5 text-amber-200" />
                <span className="block text-sm font-semibold">Find support</span>
                <span className="mt-1 block text-xs text-muted-foreground">Use the client space</span>
              </button>
              <button type="button" aria-pressed={accountIntent === "support"} onClick={() => setAccountIntent("support")}
                className={`min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${accountIntent === "support" ? "border-amber-200/60 bg-amber-200/10" : "border-border bg-background/50 hover:bg-muted/50"}`}>
                <HeartHandshake className="mb-2 h-5 w-5 text-amber-200" />
                <span className="block text-sm font-semibold">Offer support</span>
                <span className="mt-1 block text-xs text-muted-foreground">Apply as a practitioner or giver</span>
              </button>
              <button type="button" aria-pressed={accountIntent === "both"} onClick={() => setAccountIntent("both")}
                className={`min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${accountIntent === "both" ? "border-amber-200/60 bg-amber-200/10" : "border-border bg-background/50 hover:bg-muted/50"}`}>
                <HeartHandshake className="mb-2 h-5 w-5 text-amber-200" />
                <span className="block text-sm font-semibold">Use both spaces</span>
                <span className="mt-1 block text-xs text-muted-foreground">Find support and apply to offer it</span>
              </button>
            </div>
            {accountIntent === "support" && <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">Verify your email first, then complete the application. Practitioner workspace access opens only after review and approval.</p>}
            {accountIntent === "both" && <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">Verify your email first. Then you can use the client space and complete the practitioner application; practitioner workspace access opens after approval.</p>}
          </fieldset>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
              <p className="text-[11px] text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground disabled:opacity-60 transition-colors"
            >
              {loading ? "Creating account..." : ["support", "both"].includes(accountIntent) ? "Continue to application" : "Create my account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
