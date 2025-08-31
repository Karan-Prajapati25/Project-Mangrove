// Admin Configuration
// Add admin email addresses here to grant administrative access
// 
// IMPORTANT: After creating a new admin user through the dashboard,
// add their email to this list so they can login to the admin system.
//
// QUICK FIX: Copy the email from the success message and add it below

export const ADMIN_EMAILS = [
  'admin@mangrove.com',
  'administrator@mangrove.com',
  'superadmin@mangrove.com',
  'baraiyaurvish611@gmail.com',
  'urvishbaraiya@gmail.com',
  'karanprajapati2005@gmail.com' // User's email for testing
];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};

// Function to add new admin email (for future use)
export const addAdminEmail = (email: string): void => {
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    ADMIN_EMAILS.push(email.toLowerCase());
    console.log(`✅ Added ${email} to admin list`);
  }
};

// Complete workflow for adding new admins
export const ADMIN_SETUP_INSTRUCTIONS = `
1. Create new admin user through the dashboard
2. Check email for confirmation link (Supabase sends this automatically)
3. Click the confirmation link in the email
4. Copy their email address from the success message
5. Add the email to this file: src/config/admin.ts
6. Save the file
7. The new admin can now login with their credentials

NOTE: Email confirmation is required by Supabase for security reasons.
If you get "email not confirmed" error, check your email and click the confirmation link first.
`;

// Troubleshooting guide
export const ADMIN_TROUBLESHOOTING = `
Common Issues & Solutions:

1. "Email not confirmed" error:
   - Check your email for confirmation link
   - Click the link to confirm your account
   - Try logging in again

2. "Access denied" error:
   - Make sure email is added to ADMIN_EMAILS list
   - Check spelling and case sensitivity
   - Restart the application after updating config

3. "Failed to create admin" error:
   - Check if email already exists
   - Ensure password meets requirements (min 6 characters)
   - Check browser console for detailed errors
`;

