import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle as CheckCircle, FiArrowDown, FiEye as Eye, FiEyeOff as EyeOff, FiMail as Mail, FiLock as Lock, FiLogIn as LogIn, FiX as X } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import {loginPageStyles as s} from "../assets/dummyStyles";
import API from '../utils/api';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase.js";
import { getGoogleSignInErrorMessage } from "../utils/authErrors";
import { getCanonicalFrontendOrigin, redirectToCanonicalFrontend } from "../utils/googleAuthOrigin";
import { mergeProfileFromCache, setCachedProfile } from "../utils/profileCache";

const STORAGE_KEY = "jobportal_user";

// toast
const Toast = ({ message, type = "success", onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const borderClass =
    type === "success"
      ? "border-green-500"
      : type === "info"
        ? "border-blue-500"
        : "border-red-500";

  return (
    <div
      className={s.toastContainer(borderClass, isExiting)}
      style={s.toastAnimationStyle}
      role="status"
      aria-live="polite"
    >
      {type === "success" ? (
        <CheckCircle className={s.toastSuccessIcon} />
      ) : (
        <svg className={s.toastErrorIcon} viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M15 9L9 15M9 9l6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <p className={s.toastMessage}>{message}</p>
      <button
        onClick={handleClose}
        className={s.toastCloseButton}
        aria-label="Close notification"
      >
        <X className={s.toastCloseIcon} />
      </button>
    </div>
  );
};

const LoginPage = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [view, setView] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = s.globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // to submit and get logged in
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: "Please fill in all fields", type: "error" });
      return;
    }
    try {
      setIsLoading(true);
      const res = await API.post("/auth/login", { email, password });
      const userData = {
        ...res.data.user,
        token: res.data.token,
      }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

        setToast({ 
            message: "Đăng nhập thành công!", 
            type: "success" 
        });
        // rest form
        setEmail("");
        setPassword("");
        setTimeout(() => {
            navigate("/");
        }, 700);
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || "Email hoặc mật khẩu không đúng", 
        type: "error" 
    });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const canonicalOrigin = getCanonicalFrontendOrigin();

    if (canonicalOrigin !== window.location.origin) {
      redirectToCanonicalFrontend("/login");
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (!idToken) {
        throw new Error("Không lấy được Google ID token");
      }

      const res = await API.post("/auth/google-login", { idToken });
      const userData = {
        ...res.data.user,
        token: res.data.token,
      };

      const mergedUserData = mergeProfileFromCache(userData);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedUserData));
      setCachedProfile(mergedUserData);
      setToast({ message: "Đăng nhập Google thành công!", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (error) {
      setToast({
        message: getGoogleSignInErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // to forget and get the otp
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
        setToast({ message: "Email is required", type: "error" });
        return;
    }
    try {
        setIsLoading(true);
        const res = await API.post("/auth/forgot-password", { 
            email: resetEmail });
        if (res.data.success) {
            setToast({ message: "OTP sent to your email", type: "success" });
            setView("reset");
        }
    } catch (error) {
        setToast({ 
            message: error.response?.data?.message || 
            "Failed to send OTP", 
            type: "error" 
        });
    } finally {
        setIsLoading(false);
    }

  }


  // to reset the password
const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
        setToast({ 
            message: "OTP and New Password are required", 
            type: "error" 
        });
        return;
    }
    try {
        setIsLoading(true);
        const res = await API.post("/auth/reset-password", {
            email: resetEmail,
            otp,
            newPassword
        });
        if (res.data.success) {
            setToast({ message: "Password reset successful", type: "success" });
            setView("login");
            setResetEmail("");
            setOtp("");
            setNewPassword("");
        }
    } catch (error) {
        setToast({ 
            message: error.response?.data?.message || "Failed to reset password", 
            type: "error" 
        });
    } finally {
        setIsLoading(false);
    }
}



  return (
    <>
    {toast && (
        <Toast message={toast.message} type={toast.type === "error" ? "error" : "success"}
        onClose={() => setToast(null)} />
    )}
    <div className={s.pageContainer}>
        <Link to="/" className={s.backLink}>  
          <FiArrowDown className={s.backLinkIcon} />
          <span className={s.backLinkText}>Back to Jobs</span>
        </Link>

        <div className={s.cardWrapper}>
            <div className={s.animatedBorderContainer}>
                <div className={s.cardInner}>
                {view === "login" && (
                    <>
                    <h2 className={s.headerTitle}>Sign in to JobsPortal</h2>
                    <p className={s.headerSubtitle}>
                        Access your applications, saved jobs and profile.
                    </p>

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label className={s.label}>Email</label>
                            <div className={s.inputWrapper}>
                              <Mail className={s.inputIcon} />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={s.inputField}
                                placeholder="your@domain.com"
                              />                          
                            </div>
                        </div>

                          <div>
                            <label className={s.label}>Password</label>
                            <div className={s.inputWrapper}>
                              <Lock className={s.inputIcon} />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={s.passwordInput}
                                placeholder="••••••••"
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className={s.passwordToggle}
                                >
                                  {showPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                    )}
                              </button>                                                                                    
                            </div>
                        </div>

                        <div className={s.forgotPasswordContainer}>
                          <button 
                            type="button" 
                             onClick={() => {
                              setView("forgot");
                              setResetEmail(email);
                            }}
                            className={s.forgotPasswordButton}
                             >
                             Forgot password?                                          
                            </button>
                          </div>
                          <button type="submit" className={s.submitButton} disabled={isLoading}>
                            {isLoading ? (
                              "Signing in..."
                              ) : (
                              <>
                                <LogIn className="w-5 h-5" /> Sign In
                              </>
                              )}
                          </button>

                          <div className={s.dividerWrapper}>
                            <div className={s.dividerLine} />
                            <span className={s.dividerText}>or</span>
                            <div className={s.dividerLine} />
                          </div>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className={s.googleButton}
                            disabled={isLoading}
                          >
                            <FcGoogle className="w-5 h-5" />
                            <span>{isLoading ? "Please wait..." : "Continue with Google"}</span>
                          </button>

                    </form>
                    </>
                )}

                {/* for forgot password */}
                {view === "forgot" && (
                <>
                  <h2 className={s.headerTitle}>Forgot Password</h2>
                  <p className={s.headerSubtitle}>
                    Enter your email to receive a reset code.
                  </p>

                  <form onSubmit={handleForgotPassword} className={s.form}>
                    <div>
                      <label className={s.label}>Email address</label>
                      <div className={s.inputWrapper}>
                        <Mail className={s.inputIcon} />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          className={s.inputField}
                          placeholder="you@domain.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={s.submitButtonForgot}
                    >
                      {isLoading ? "Sending OTP..." : "Send Reset Code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className={s.secondaryButton}
                    >
                      Back to Login
                    </button>
                  </form>
                </>
              )}
              {/* for reset password */}
              {view === "reset" && (
                <>
                  <h2 className={s.headerTitle}>Reset Password</h2>
                  <p className={s.headerSubtitle}>
                    Enter the code sent to {resetEmail}
                  </p>

                  <form onSubmit={handleResetPassword} className={s.form}>
                    <div>
                      <label className={s.label}>6-Digit Code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className={s.otpInput}
                        maxLength={6}
                        placeholder="000000"
                      />
                    </div>

                    <div>
                      <label className={s.label}>New Password</label>
                      <div className={s.inputWrapper}>
                        <Lock className={s.inputIcon} />
                        <input
                          type={showResetPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className={s.passwordInput}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowResetPassword(!showResetPassword)
                          }
                          className={s.passwordToggle}
                        >
                          {showResetPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={s.submitButtonReset}
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className={s.secondaryButton}
                    >
                      Cancel
                    </button>
                  </form>
                </>
              )}

                  <div className={s.signupContainer}>
                    <p className={s.signupText}>
                      Don't have an account?{" "}
                      <Link to="/signup" className={s.signupLink}>
                        Create Profile
                      </Link>
                    </p>
                  </div>
                </div>
            </div>
        </div>

        <div className={s.blobTon} style={s.blobTopStyle}></div>
        <div className={s.blobBottom} style={s.blobBottomStyle}></div>
    </div>
    </>
  )
}

export default LoginPage