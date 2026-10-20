import { useState } from 'react';
import mascotImg from '../assets/mascot.png';
import { supabase, isSupabaseConfigured, setRememberMe as saveRememberMe, friendlyAuthError } from '../lib/supabase';
import { sounds } from '../lib/sounds';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Sparkles,
} from './CustomIcons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const HEADINGS = {
  login: ['Welcome Back!', 'Track expenses, auto-balance ambagan, and save smarter.'],
  signup: ['Join Gastosaurus', 'Create your account to master your budget effortlessly.'],
  forgot: ['Forgot your password?', "Enter your email and we'll send you a reset link."],
  'update-password': ['Set a new password', 'Choose a new password for your Gastosaurus account.'],
  'check-email': ['Check your email', 'One more step to join the herd.'],
};

function validate(mode, { name, email, password }) {
  const errors = {};
  if (mode === 'signup' && !name.trim()) errors.name = 'Enter your name or nickname.';
  if (mode === 'signup' && name.trim().length > 60) errors.name = 'Name must be 60 characters or fewer.';
  if (mode !== 'update-password') {
    if (!email.trim()) errors.email = 'Enter your email.';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
  }
  if (mode !== 'forgot') {
    if (!password) errors.password = 'Enter your password.';
    else if (mode !== 'login' && password.length < 8) errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export const AuthModal = (props) => {
  if (!props.isOpen) return null;
  return <AuthModalContent key={props.initialMode} {...props} />;
};

const AuthModalContent = ({ initialMode = 'login', onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Submission & redirect state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Messages
  const [formError, setFormError] = useState(
    isSupabaseConfigured ? '' : 'Supabase is not configured. Copy .env.example to .env.local.'
  );
  const [formInfo, setFormInfo] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [title, subtitle] = HEADINGS[mode];
  const isTabMode = mode === 'login' || mode === 'signup';
  const isEmailValid = EMAIL_RE.test(email.trim());

  const switchMode = (nextMode) => {
    sounds.playPop();
    setMode(nextMode);
    setFormError('');
    setFormInfo('');
    setFieldErrors({});
    setPassword('');
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const finishWithSuccess = (message, isSignUp = false, user = null) => {
    sounds.playSuccess();
    setSuccessMessage(message);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onAuthSuccess) onAuthSuccess({ isSignUp, user });
    }, 1100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setFormError('');
    setFormInfo('');

    const errors = validate(mode, { name, email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !supabase) return;

    setIsSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const returnUrl = window.location.origin;

    try {
      if (mode === 'login') {
        saveRememberMe(rememberMe);
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        const displayName = data.user?.user_metadata?.name || 'Budget Dino';
        finishWithSuccess(`Welcome back, ${displayName}!`, false, data.user);
      }

      if (mode === 'signup') {
        saveRememberMe(true);
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: returnUrl },
        });
        if (error) throw error;

        if (data.user && data.user.identities?.length === 0) {
          setFieldErrors({ email: 'This email is already registered.' });
          setFormError('An account with this email already exists. Try logging in.');
        } else if (!data.session) {
          switchMode('check-email');
        } else {
          finishWithSuccess(`Welcome to the herd, ${name.trim()}!`, true, data.user);
        }
      }

      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: returnUrl });
        if (error) throw error;
        setFormInfo('If an account exists for that email, a reset link is on its way. 🦕');
      }

      if (mode === 'update-password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        finishWithSuccess('Password updated!');
      }
    } catch (err) {
      setFormError(friendlyAuthError(err));
    } finally {
      setPassword((p) => (mode === 'forgot' ? p : ''));
      setIsSubmitting(false);
    }
  };

  const submitLabel = {
    login: ['Log In to Gastosaurus', 'Logging in... 🦕'],
    signup: ['Create Dino Account', 'Creating your account... 🦕'],
    forgot: ['Send Reset Link', 'Sending... 🦕'],
    'update-password': ['Save New Password', 'Saving... 🦕'],
  }[mode];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card auth-modal-card liquid-glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          className="auth-close-btn active-press"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Reactive Peeking Mascot */}
        <div className="peeking-mascot-wrapper">
          <div className={`peeking-dino ${isPasswordFocused ? 'covering-eyes' : ''} ${isEmailValid ? 'happy-dino' : ''}`}>
            <img src={mascotImg} alt="" className="peeking-dino-avatar" />
            {isPasswordFocused && (
              <div className="dino-eye-cover animate-pop">
                <span>🙈</span>
              </div>
            )}
            {isEmailValid && !isPasswordFocused && (
              <span className="dino-valid-sparkle animate-pop">
                <Sparkles size={16} color="#E2486E" />
              </span>
            )}
          </div>
        </div>

        {/* Header Text */}
        <div className="auth-header-visual">
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {/* Liquid Glass Segmented Mode Switcher */}
        {isTabMode && !isSuccess && (
          <div className="auth-mode-switch liquid-glass-subtle">
            <button
              type="button"
              className={`auth-mode-btn active-press ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-mode-btn active-press ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="auth-success-screen animate-fade-in">
            <div className="auth-success-icon-wrap liquid-glass-subtle">
              <span className="auth-dino-success-emoji">🦖</span>
            </div>
            <h3 className="auth-success-title">{successMessage}</h3>
            <p className="auth-success-sub">Redirecting you to your dashboard...</p>
            <div className="auth-loading-bar">
              <div className="auth-loading-fill" />
            </div>
          </div>
        ) : mode === 'check-email' ? (
          <div className="auth-success-screen animate-fade-in">
            <div className="auth-success-icon-wrap liquid-glass-subtle">
              <span className="auth-dino-success-emoji">📬</span>
            </div>
            <h3 className="auth-success-title">Almost there!</h3>
            <p className="auth-success-sub">
              We sent an activation link to <strong>{email.trim().toLowerCase()}</strong>. Open it to activate your account.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block active-press"
              onClick={() => switchMode('login')}
            >
              <span>Back to Log In</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {formError && (
              <div className="auth-alert auth-alert-error animate-pop" role="alert">{formError}</div>
            )}
            {formInfo && (
              <div className="auth-alert auth-alert-info animate-pop" role="status">{formInfo}</div>
            )}

            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="auth-name">Your Name / Nickname</label>
                <div className="auth-input-wrapper liquid-glass-subtle">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="e.g. Francoise"
                    autoComplete="nickname"
                    maxLength={60}
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                    className={`auth-input ${fieldErrors.name ? 'has-error' : ''}`}
                    aria-invalid={!!fieldErrors.name}
                  />
                </div>
                {fieldErrors.name && <p className="auth-field-error">{fieldErrors.name}</p>}
              </div>
            )}

            {mode !== 'update-password' && (
              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <div className="auth-input-wrapper liquid-glass-subtle">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                    className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                    aria-invalid={!!fieldErrors.email}
                  />
                </div>
                {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="auth-password">
                    {mode === 'update-password' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="forgot-link-btn"
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="auth-input-wrapper liquid-glass-subtle">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                    className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                    aria-invalid={!!fieldErrors.password}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn active-press"
                    onClick={() => {
                      sounds.playClick();
                      setShowPassword(!showPassword);
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="auth-form-extra">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      sounds.playClick();
                      setRememberMe(e.target.checked);
                    }}
                  />
                  <span>Keep me logged in</span>
                </label>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block auth-submit active-press"
              disabled={isSubmitting || !isSupabaseConfigured}
            >
              {isSubmitting ? (
                <span>{submitLabel[1]}</span>
              ) : (
                <>
                  <span>{submitLabel[0]}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                className="auth-back-link"
                onClick={() => switchMode('login')}
              >
                ← Back to Log In
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
