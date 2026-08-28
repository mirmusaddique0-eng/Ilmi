import { useState } from "react";
import "./Auth.css";
import { supabase } from "../lib/supabaseClient";

function Auth({ onLogin }) {

  const [isLogin, setIsLogin] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // =========================================
  // REGISTER
  // =========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,

        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      console.log("Registered User:", data);

      setMessage("Account created successfully!");

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (error) {
        setError(error.message);
        return;
      }

      console.log("Logged In User:", data);

setMessage("Login successful!");

setEmail("");
setPassword("");

if (onLogin) {
  onLogin();
}

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // SWITCH LOGIN / REGISTER
  // =========================================

  const switchMode = () => {
    setIsLogin(!isLogin);

    setError("");
    setMessage("");

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };


  return (
    <div className="auth-page">

      <div className="auth-box">


        {/* HEADER */}

        <div className="auth-header">

          <span>EDUVANTA</span>

          <h1>
            {isLogin
              ? "Welcome Back"
              : "Create Your Account"}
          </h1>

          <p>
            {isLogin
              ? "Login to continue your learning journey."
              : "Create an account and start learning with EDUVANTA."}
          </p>

        </div>


        {/* TABS */}

        <div className="auth-tabs">

          <button
            type="button"
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setMessage("");
            }}
          >
            Login
          </button>


          <button
            type="button"
            className={!isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setMessage("");
            }}
          >
            Register
          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={
            isLogin
              ? handleLogin
              : handleRegister
          }
        >


          {/* FULL NAME */}

          {!isLogin && (

            <div className="auth-field">

              <label>
                Full Name
              </label>

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

          <div className="auth-field">

            <label>
              Email
            </label>

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

          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          {/* CONFIRM PASSWORD */}

          {!isLogin && (

            <div className="auth-field">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

            </div>

          )}


          {/* MESSAGE */}

          {message && (

            <p
              style={{
                color: "green",
                marginBottom: "15px"
              }}
            >
              {message}
            </p>

          )}


          {/* ERROR */}

          {error && (

            <p
              style={{
                color: "red",
                marginBottom: "15px"
              }}
            >
              {error}
            </p>

          )}


          {/* SUBMIT */}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >

            {loading
              ? isLogin
                ? "Logging In..."
                : "Creating Account..."
              : isLogin
                ? "Login"
                : "Create Account"}

          </button>

        </form>


        {/* SWITCH */}

        <p className="auth-switch">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={switchMode}
          >
            {isLogin
              ? "Create Account"
              : "Login"}
          </button>

        </p>


      </div>

    </div>
  );
}

export default Auth;