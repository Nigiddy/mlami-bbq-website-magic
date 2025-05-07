
import { z } from 'zod';

// Schema for user form validation
export const userFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  fullName: z.string().min(2, { message: 'Full name is required' }).optional().or(z.literal('')),
  role: z.string()
});

export type UserFormValues = z.infer<typeof userFormSchema>;
