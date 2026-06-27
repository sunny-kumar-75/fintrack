import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuUser, LuMail, LuLock, LuChevronLeft, LuChevronRight, LuCheck } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRequired,
  validatePasswordMatch,
} from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import IconMapper from '../../components/common/IconMapper';
import styles from './Signup.module.css';

const DEFAULT_CATEGORIES = [
  { id: 'food', icon: 'LuUtensils', name: 'Food & Dining', type: 'expense' },
  { id: 'transport', icon: 'LuCar', name: 'Transport', type: 'expense' },
  { id: 'rent', icon: 'LuHome', name: 'Rent & Housing', type: 'expense' },
  { id: 'subscriptions', icon: 'LuCreditCard', name: 'Subscriptions', type: 'expense' },
  { id: 'shopping', icon: 'LuShoppingCart', name: 'Shopping', type: 'expense' },
  { id: 'health', icon: 'LuHeart', name: 'Health', type: 'expense' },
  { id: 'travel', icon: 'LuPlane', name: 'Travel', type: 'expense' },
  { id: 'entertainment', icon: 'LuGamepad2', name: 'Entertainment', type: 'expense' },
  { id: 'education', icon: 'LuBook', name: 'Education', type: 'expense' },
  { id: 'salary', icon: 'LuDollarSign', name: 'Salary', type: 'income' },
  { id: 'freelance', icon: 'LuBriefcase', name: 'Freelance', type: 'income' },
  { id: 'gifts', icon: 'LuGift', name: 'Gifts', type: 'income' },
  { id: 'other', icon: 'LuMoreHorizontal', name: 'Other', type: 'both' },
];

const CURRENCIES = [
  { value: 'INR', label: '🇮🇳 INR — Indian Rupee' },
  { value: 'USD', label: '🇺🇸 USD — US Dollar' },
  { value: 'EUR', label: '🇪🇺 EUR — Euro' },
  { value: 'GBP', label: '🇬🇧 GBP — British Pound' },
  { value: 'JPY', label: '🇯🇵 JPY — Japanese Yen' },
];

const WEEK_DAYS = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
];

const guessIcon = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('income') || lowerName.includes('salary') || lowerName.includes('money')) return 'LuDollarSign';
  if (lowerName.includes('food') || lowerName.includes('eat') || lowerName.includes('restaurant')) return 'LuUtensils';
  if (lowerName.includes('travel') || lowerName.includes('flight')) return 'LuPlane';
  if (lowerName.includes('shop') || lowerName.includes('buy')) return 'LuShoppingCart';
  if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('doctor')) return 'LuHeart';
  if (lowerName.includes('game') || lowerName.includes('entertainment')) return 'LuGamepad2';
  if (lowerName.includes('car') || lowerName.includes('gas') || lowerName.includes('transport')) return 'LuCar';
  if (lowerName.includes('home') || lowerName.includes('rent')) return 'LuHome';
  if (lowerName.includes('bill') || lowerName.includes('invoice') || lowerName.includes('utility')) return 'LuFileText';
  if (lowerName.includes('sport') || lowerName.includes('gym') || lowerName.includes('fitness')) return 'LuDumbbell';
  if (lowerName.includes('cloth') || lowerName.includes('apparel')) return 'LuShirt';
  return 'LuStar';
};

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstDayOfWeek: 'monday',
  });

  const [selectedCategories, setSelectedCategories] = useState(
    DEFAULT_CATEGORIES.map((c) => c.id)
  );
  
  const [customCategories, setCustomCategories] = useState([]);

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('weak');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');

    // Real-time validation for touched fields
    if (name === 'email' && value) {
      const result = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: result.isValid ? '' : result.message }));
    }
    if (name === 'password') {
      const result = validatePassword(value);
      setPasswordStrength(result.strength);
      setErrors((prev) => ({ ...prev, password: result.isValid ? '' : result.message }));
    }
    if (name === 'confirmPassword') {
      setFormData((prev) => {
        const match = validatePasswordMatch(prev.password, value);
        setErrors((e) => ({ ...e, confirmPassword: match.isValid ? '' : match.message }));
        return { ...prev, confirmPassword: value };
      });
      return; // Already handled via setFormData
    }
    if (name === 'username') {
      const result = validateUsername(value);
      setErrors((prev) => ({ ...prev, username: result.isValid ? '' : result.message }));
    }
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const validateStep1 = useCallback(() => {
    const newErrors = {};

    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.isValid) newErrors.username = usernameResult.message;

    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) newErrors.email = emailResult.message;

    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) newErrors.password = passwordResult.message;

    const matchResult = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!matchResult.isValid) newErrors.confirmPassword = matchResult.message;


    setErrors(newErrors);
    
    setTouched({
      username: true,
      nickname: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const goToStep2 = useCallback(() => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  }, [validateStep1]);

  const goToStep1 = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (selectedCategories.length === 0) {
      setFormError('Please select at least one category');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        username: formData.username,
        nickname: formData.nickname || formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstDayOfWeek: formData.firstDayOfWeek,
        selectedCategories,
      });
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Signup failed. Please try again.';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedCategories, signup, navigate]);

  const renderStrengthBar = () => {
    if (!formData.password) return null;

    const getSegmentClass = (index) => {
      if (passwordStrength === 'weak' && index === 0) return styles.strengthWeak;
      if (passwordStrength === 'medium' && index <= 1) return styles.strengthMedium;
      if (passwordStrength === 'strong') return styles.strengthStrong;
      return '';
    };

    return (
      <div>
        <div className={styles.strengthBar}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${styles.strengthSegment} ${getSegmentClass(i)}`}
            />
          ))}
        </div>
        <span className={`${styles.strengthText} ${styles[`strengthText${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`]}`}>
          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} password
        </span>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className={styles.stepContent} key="step1">
      <h2 className={styles.formTitle}>Create your account</h2>
      <p className={styles.formSubtitle}>
        Set up your profile and preferences to get started
      </p>

      {formError && currentStep === 1 && (
        <div className={styles.formError} role="alert">{formError}</div>
      )}

      <div className={styles.form}>
        <div className={styles.formRow}>
          <Input
            label="Full Name"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.username ? errors.username : ''}
            placeholder="John Doe"
            icon={<LuUser />}
            autoComplete="name"
            required
          />
          <Input
            label="Nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="John"
            autoComplete="given-name"
          />
        </div>

        <Input
          label="Email"
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

        <div className={styles.formRow}>
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              placeholder="Min. 8 characters"
              icon={<LuLock />}
              showPasswordToggle
              autoComplete="new-password"
              required
            />
            {renderStrengthBar()}
          </div>
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            placeholder="Re-enter password"
            icon={<LuLock />}
            showPasswordToggle
            autoComplete="new-password"
            required
          />
        </div>

        <div className={styles.formRow}>

          <Input
            label="First Day of Week"
            name="firstDayOfWeek"
            value={formData.firstDayOfWeek}
            onChange={handleChange}
            as="select"
          >
            {WEEK_DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </Input>
        </div>

        <div className={styles.navigationButtons}>
          <span /> {/* Spacer */}
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={goToStep2}
          >
            Next <LuChevronRight />
          </Button>
        </div>
      </div>

      <p className={styles.bottomText}>
        Already have an account?{' '}
        <Link to="/login" className={styles.bottomLink}>
          Click here to log in
        </Link>
      </p>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContent} key="step2">
      <h2 className={styles.formTitle}>Transaction Categories</h2>
      <p className={styles.formSubtitle}>
        Select the categories you'd like to track. You can customize these later.
      </p>

      {formError && currentStep === 2 && (
        <div className={styles.formError} role="alert">{formError}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.categoryGrid}>
          {[...DEFAULT_CATEGORIES, ...customCategories].map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <div
                key={category.id}
                className={`${styles.categoryCard} ${isSelected ? styles.categorySelected : ''}`}
                onClick={() => toggleCategory(category.id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCategory(category.id);
                  }
                }}
              >
                {isSelected && (
                  <span className={styles.categoryCheckmark}>
                    <LuCheck size={10} />
                  </span>
                )}
                <span className={styles.categoryIcon}>
                  <IconMapper name={category.icon} size={20} />
                </span>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            );
          })}

          <button
            type="button"
            className={styles.addCategoryBtn}
            onClick={() => {
              const name = window.prompt('Enter new category name:');
              if (name && name.trim()) {
                const newId = `custom-${Date.now()}`;
                const newCategory = {
                  id: newId,
                  icon: guessIcon(name),
                  name: name.trim(),
                  type: 'expense',
                };
                setCustomCategories(prev => [...prev, newCategory]);
                setSelectedCategories(prev => [...prev, newId]);
              }
            }}
          >
            <span className={styles.addCategoryIcon}>+</span>
            Add Custom
          </button>
        </div>

        <div className={styles.navigationButtons}>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={goToStep1}
          >
            <LuChevronLeft /> Previous
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );

  const stepHints = {
    1: {
      title: '📋 Step 1: Your Details',
      text: 'Tell us a bit about yourself so we can personalize your experience.',
    },
    2: {
      title: '🏷️ Step 2: Categories',
      text: 'Pick the categories that match your spending habits. You can always add more later.',
    },
  };

  return (
    <div className={styles.signupPage}>
      {}
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${currentStep === 1 ? styles.stepActive : ''} ${currentStep > 1 ? styles.stepCompleted : ''}`}>
          <span className={styles.stepNumber}>
            {currentStep > 1 ? <LuCheck size={14} /> : '01'}
          </span>
          <span className={styles.stepLabel}>User Information</span>
        </div>

        <div className={styles.stepConnector}>
          <div
            className={styles.stepConnectorFill}
            style={{ width: currentStep > 1 ? '100%' : '0%' }}
          />
        </div>

        <div className={`${styles.step} ${currentStep === 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNumber}>02</span>
          <span className={styles.stepLabel}>Transaction Categories</span>
        </div>
      </div>

      {}
      <main className={styles.contentWrapper}>
        {}
        <div className={styles.brandSide}>
          <div className={styles.brandContent}>
            <h1 className={styles.brandLogo}>FinTrack</h1>
            <p className={styles.brandTagline}>
              Your personal finance companion for smarter spending.
            </p>

            <div className={styles.stepHint}>
              <div className={styles.stepHintTitle}>
                {stepHints[currentStep].title}
              </div>
              <div className={styles.stepHintText}>
                {stepHints[currentStep].text}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </div>
        </div>
      </main>
    </div>
  );
}
