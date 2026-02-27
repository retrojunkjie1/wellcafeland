import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { bootstrapAnonymousAuth } from "@/services/authBootstrap";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Authentication is not available. Please check your Firebase configuration.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Failed to sign in. Please try again.";

      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Authentication is not available. Please check your Firebase configuration.");
      setLoading(false);
      return;
    }

    try {
      await bootstrapAnonymousAuth();
      const onboardingComplete = localStorage.getItem("wc_onboarding_complete");
      const from = location.state?.from?.pathname;
      if (!onboardingComplete && !from) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate(from || "/", { replace: true });
      }
    } catch (err) {
      console.error("Anonymous login error:", err);
      setError("Failed to continue as guest. Please try again.");
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
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to WellnessCafe</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account or continue as a guest
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={loading}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60 transition-colors"
            >
              {loading ? "Loading..." : "Continue as Guest"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Your progress will be saved privately. You can upgrade your account anytime.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
