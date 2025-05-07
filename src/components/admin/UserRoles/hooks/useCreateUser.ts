
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserFormValues } from '../validation/userFormSchema';

export const useCreateUser = (onUserCreated: () => void) => {
  const [loading, setLoading] = useState(false);

  const createUser = async (values: UserFormValues) => {
    setLoading(true);
    try {
      console.log("Creating user with role:", values.role);
      
      // Step 1: Create the user in auth
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName || null,
            role: values.role, // Add role to user metadata
          },
        }
      });

      if (signUpError) throw signUpError;
      
      if (!userData.user) {
        throw new Error('Failed to create user');
      }

      // Step 2: Directly insert/update the profile with the correct role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          email: values.email,
          full_name: values.fullName || null,
          role: values.role
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      toast({
        title: 'User Created Successfully',
        description: `${values.email} has been created with role: ${values.role}`,
      });
      
      // Refresh the user list
      onUserCreated();
      return true;
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: 'Error Creating User',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading };
};
