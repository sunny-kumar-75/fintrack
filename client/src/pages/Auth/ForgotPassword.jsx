import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuMail, LuArrowLeft, LuLock, LuKey, LuEye, LuEyeOff } from 'react-icons/lu';
import { validateEmail, validatePassword } from '../../utils/validators';
import { forgotPassword, resetPassword } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);
  
  // Step 2 State
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  // General State
  const [formError, setFormError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = useCallback((e) => {
    const val = e.target.value;
    setEmail(val);
    setFormError('');
    if (touchedEmail && val) {
      const result = validateEmail(val);
      setEmailError(result.isValid ? '' : result.message);
    }
  }, [touchedEmail]);

  const handlePasswordChange = useCallback((e) => {
    const val = e.target.value;
    setPassword(val);
    setFormError('');
    if (touchedPassword && val) {
      const result = validatePassword(val);
      setPasswordError(result.isValid ? '' : result.message);
    }
  }, [touchedPassword]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setTouchedEmail(true);

    const result = validateEmail(email);
    if (!result.isValid) {
      setEmailError(result.message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.demoOtp) setDemoOtp(response.demoOtp);
      setStep(2);
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    setTouchedPassword(true);

    if (!otp || otp.length !== 6) {
      setFormError('Please enter a valid 6-digit OTP.');
      return;
    }

    const result = validatePassword(password);
    if (!result.isValid) {
      setPasswordError(result.message);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, otp, password);
      setStep(3);
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to reset password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render Step 3: Success ──────────────────────────────────────────
  if (step === 3) {
    return (
      <main className={styles.forgotPage}>
        <div className={styles.card}>
          <div className={styles.successWrapper}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>Password Reset!</h2>
            <p className={styles.successText}>
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (step === 2) {
    return (
      <main className={styles.forgotPage}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <LuKey size={24} />
          </div>
          <h2 className={styles.title}>Enter Reset Code</h2>
          <p className={styles.subtitle}>
            We've sent a 6-digit code to <strong>{email}</strong>. Enter it below along with your new password.
          </p>

          {demoOtp && (
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #bae6fd', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>Personal Project Demo Mode:</strong><br />Your OTP code is <strong style={{ fontSize: '18px', letterSpacing: '2px' }}>{demoOtp}</strong>
            </div>
          )}

          {formError && (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          )}

          <form className={styles.form} onSubmit={handleResetPassword} noValidate>
            <Input
              label="6-Digit OTP Code"
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                setFormError('');
              }}
              placeholder="123456"
              icon={<LuKey />}
              required
            />

            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => {
                setTouchedPassword(true);
                setPasswordError(validatePassword(password).isValid ? '' : validatePassword(password).message);
              }}
              error={touchedPassword ? passwordError : ''}
              placeholder="Create a new password"
              icon={<LuLock />}
              required
            />
            
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: '48px', marginTop: '-60px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>

          <button onClick={() => setStep(1)} className={styles.backLink} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <LuArrowLeft size={16} />
            Back to email entry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.forgotPage}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <LuLock size={24} />
        </div>
        <h2 className={styles.title}>Forgot password?</h2>
        <p className={styles.subtitle}>
          No worries! Enter the email address associated with your account and we'll send you a 6-digit code to reset your password.
        </p>

        {formError && (
          <div className={styles.formError} role="alert">
            {formError}
          </div>
        )}

        <form className={styles.form} onSubmit={handleRequestOtp} noValidate>
          <Input
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => {
              setTouchedEmail(true);
              setEmailError(validateEmail(email).isValid ? '' : validateEmail(email).message);
            }}
            error={touchedEmail ? emailError : ''}
            placeholder="you@example.com"
            icon={<LuMail />}
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Send OTP Code
          </Button>
        </form>

        <Link to="/login" className={styles.backLink}>
          <LuArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </main>
  );
}
