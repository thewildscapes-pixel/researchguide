export interface UserSession {
  email: string;
  mobile: string;
  name?: string;
  institution?: string;
  loginTime: string;
  isAdmin?: boolean;
}

export const ADMIN_EMAIL = 'thewildscapes@gmail.com';
export const ADMIN_PHONE_DIGITS = '9706375001';

/**
 * Validates whether an email format is valid.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validates whether a mobile phone number contains at least 10 valid digits.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * Strict verification if a given session or credentials correspond to the authorized administrator.
 * Only thewildscapes@gmail.com and mobile no. 9706375001 is the admin.
 */
export function isUserAdmin(session: UserSession | null | undefined): boolean {
  if (!session) return false;
  const email = (session.email || '').trim().toLowerCase();
  const digits = (session.mobile || '').replace(/\D/g, '');
  return email === ADMIN_EMAIL && digits.includes(ADMIN_PHONE_DIGITS);
}
