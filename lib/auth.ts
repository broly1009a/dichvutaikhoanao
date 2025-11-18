import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Hash mật khẩu
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Kiểm tra mật khẩu
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (Việt Nam)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(0|84)[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Validate password strength
export function isStrongPassword(password: string): boolean {
  // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

// Sanitize user object (loại bỏ sensitive fields)
export function sanitizeUser(user: any) {
  const { password, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
}
