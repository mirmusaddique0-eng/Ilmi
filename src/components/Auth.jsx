import { useState } from "react";
import "./Auth.css";
import { supabase } from "../lib/supabaseClient";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // EMAIL LOGIN / REGISTER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // =========================
      // REGISTER
      // =========================
      if (!isLogin) {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        // Email verification enabled
        if (data.user && !data.session) {
          setMessage(
            "Registration successful! Please check your email and verify your account."
          );
        } else {
          setMessage("Account created successfully!");

          if (data.user && onLogin) {
            onLogin(data.user);
          }
        }
      }

      // =========================
      // LOGIN
      // =========================
      else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setMessage("Login successful!");

          if (onLogin) {
            onLogin(data.user);
          }
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.message || "Google login failed.");
      setLoading(false);
    }
  };

  // =========================
  // SWITCH LOGIN / REGISTER
  // =========================
  const switchMode = () => {
    setIsLogin(!isLogin);

    setFullName("");
    setEmail("");
    setPassword("");

    setMessage("");
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="auth-brand">
            <h1>ILMI</h1>
            <p>Learn. Practice. Build. Grow.</p>
          </div>

          <div className="auth-info">
            <h2>
              {isLogin
                ? "Welcome Back!"
                : "Start Your Learning Journey"}
            </h2>

            <p>
              {isLogin
                ? "Login to continue your learning journey with ILMI."
                : "Create your ILMI account and start learning today."}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">

          <div className="auth-form-box">

            <h2>
              {isLogin ? "Sign In" : "Create Account"}
            </h2>

            <p className="auth-subtitle">
              {isLogin
                ? "Sign in to continue to ILMI"
                : "Create your account to get started"}
            </p>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <span className="google-icon">G</span>

              {loading
                ? "Please wait..."
                : "Continue with Google"}
            </button>

            {/* DIVIDER */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* ERROR */}
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* MESSAGE */}
            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              {/* FULL NAME - REGISTER ONLY */}
              {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    required
                  />
                </div>
              )}

              {/* EMAIL */}
              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            {/* SWITCH MODE */}
            <div className="auth-switch">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={switchMode}
              >
                {isLogin
                  ? " Create Account"
                  : " Sign In"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;