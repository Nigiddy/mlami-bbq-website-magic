
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  fullName: z.string().min(2, { message: 'Full name is required' }).optional().or(z.literal('')),
  role: z.string()
});

interface CreateUserFormProps {
  onUserCreated: () => void;
}

const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'user'
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      // This ensures the role is set even before the trigger runs
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

      // Reset the form
      form.reset();
      
      // Refresh the user list
      onUserCreated();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: 'Error Creating User',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-6 bg-white/40 backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-4">Create New User</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="user@example.com" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Password (min 6 characters)" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cook">Cook</SelectItem>
                    <SelectItem value="user">Regular User</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating User...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateUserForm;
