import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuMail, LuLock } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validateRequired } from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
    setFormError('');

    // Real-time validation on already-touched fields
    if (name === 'email' && value) {
      const result = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: result.isValid ? '' : result.message }));
    } else if (name === 'password' && value) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === 'email') {
      const result = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: result.isValid ? '' : result.message }));
    } else if (name === 'password') {
      const result = validateRequired(value, 'Password');
      setErrors((prev) => ({ ...prev, password: result.isValid ? '' : result.message }));
    }
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) newErrors.email = emailResult.message;

    const passwordResult = validateRequired(formData.password, 'Password');
    if (!passwordResult.isValid) newErrors.password = passwordResult.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validate, login, navigate]);

  return (
    <main className={styles.contentWrapper}>
      {/* ── Brand Side (Left) ──────────────────────────────────── */}
      <div className={styles.brandSide}>
        <div className={styles.brandContent}>
          <h1 className={styles.brandLogo}>FinTrack</h1>
          <p className={styles.brandTagline}>
            Take control of your finances with smart tracking and data-driven insights.
          </p>

          {/* ── Abstract 3D Fintech Art ──────────────────────────────── */}
          <div className={styles.artContainer}>
            <div className={styles.artWrapper}>
              <div className={`${styles.ring} ${styles.ring1}`}></div>
              <div className={`${styles.ring} ${styles.ring2}`}></div>
              <div className={`${styles.ring} ${styles.ring3}`}></div>
              <div className={styles.core}></div>
            </div>
            <div className={styles.artShadow}></div>
          </div>
        </div>
      </div>

      {/* ── Form Side (Right) ──────────────────────────────────────── */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Welcome back</h2>
          <p className={styles.formSubtitle}>Please enter your details</p>

          {formError && (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ''}
              placeholder="you@example.com"
              icon={<LuMail />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              placeholder="Enter your password"
              icon={<LuLock />}
              autoComplete="current-password"
              showPasswordToggle
              required
            />

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                />
                <span>Remember for 30 days</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              fullWidth
            >
              Sign in
            </Button>
          </form>

          <p className={styles.bottomText}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.bottomLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
