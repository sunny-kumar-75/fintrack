import { useState } from 'react';
import styles from './Input.module.css';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon,
  showPasswordToggle = false,
  name,
  required = false,
  autoComplete,
  id,
  children,
  as,
  onBlur,
  disabled,
  className,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const inputClasses = [
    styles.input,
    icon ? styles.hasIcon : '',
    (isPassword && showPasswordToggle) ? styles.hasToggle : '',
    error ? styles.inputError : '',
    className || '',
  ].filter(Boolean).join(' ');

  const Tag = as === 'select' ? 'select' : 'input';

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}

        <Tag
          id={inputId}
          type={as === 'select' ? undefined : inputType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        >
          {children}
        </Tag>

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <LuEye /> : <LuEyeOff />}
          </button>
        )}
      </div>

      {error && (
        <span className={styles.errorText} id={`${inputId}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
