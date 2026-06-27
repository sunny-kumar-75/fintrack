
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: '' };
}

/**
 * Validate a password and return its strength.
 * @param {string} password
 * @returns {{ isValid: boolean, message: string, strength: 'weak'|'medium'|'strong' }}
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'weak' };
  }

  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const messages = [];

  if (!checks.minLength) messages.push('at least 8 characters');
  if (!checks.hasUppercase) messages.push('an uppercase letter');
  if (!checks.hasLowercase) messages.push('a lowercase letter');
  if (!checks.hasNumber) messages.push('a number');

  const passedCount = Object.values(checks).filter(Boolean).length;

  let strength = 'weak';
  if (passedCount === 4) {
    strength = 'strong';
  } else if (passedCount >= 3) {
    strength = 'medium';
  }

  if (messages.length > 0) {
    return {
      isValid: false,
      message: `Password must contain ${messages.join(', ')}`,
      strength,
    };
  }

  if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength = 'strong';
  }

  return { isValid: true, message: '', strength };
}

/**
 * Validate a username.
 * @param {string} username
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateUsername(username) {
  if (!username || !username.trim()) {
    return { isValid: false, message: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 2) {
    return { isValid: false, message: 'Username must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, message: 'Username must be 50 characters or less' };
  }

  const usernameRegex = /^[a-zA-Z0-9_\s\-']+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      message: 'Full Name can only contain letters, numbers, spaces, hyphens, and apostrophes',
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Validate that a field is not empty.
 * @param {string} value
 * @param {string} fieldName
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true, message: '' };
}

/**
 * Validate that password and confirm password match.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ isValid: boolean, message: string }}
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true, message: '' };
}
