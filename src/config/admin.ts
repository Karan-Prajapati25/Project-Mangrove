// Admin Configuration
// Add admin email addresses here to grant administrative access

export const ADMIN_EMAILS = [
  'admin@mangrove.com',
  'administrator@mangrove.com',
  'superadmin@mangrove.com'
];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};

