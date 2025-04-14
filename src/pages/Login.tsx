
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, Navigate } from 'react-router-dom';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { ArrowRight, LockKeyhole, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Validation schema for signup
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required')
});

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, isLoading, user } = useAuth();
  const location = useLocation();

  // If user is already logged in, redirect to the intended destination or admin
  if (user) {
    const redirectTo = location.state?.from?.pathname || "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: ''
    }
  });

  // Handle signup
  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name
          }
        }
      });

      if (error) throw error;

      // Update profile with full_name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: values.full_name })
        .eq('email', values.email);

      if (profileError) throw profileError;

      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created. Please log in.',
        variant: 'default'
      });

      // Switch back to login
      setIsSignup(false);
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Handle login
  const onLogin = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      // Error is already handled in AuthContext
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex justify-center items-center py-16 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <LockKeyhole className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isSignup ? 'Create Account' : 'Admin Login'}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? 'Create a new account to access the system' 
                : 'Enter your credentials to access the dashboard'}
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(isSignup ? onSignup : onLogin)} 
              className="space-y-4"
            >
              <CardContent className="space-y-4">
                {isSignup && (
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="admin@example.com" 
                          {...field} 
                          autoComplete="username"
                          className="bg-background"
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
                          placeholder="••••••••" 
                          {...field} 
                          autoComplete="current-password"
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isSignup ? 'Creating Account...' : 'Logging in...') 
                    : (isSignup 
                      ? <><UserPlus className="w-4 h-4 mr-2" /> Create Account</> 
                      : <><ArrowRight className="w-4 h-4 mr-2" /> Login</>)
                  }
                </Button>

                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-sm"
                >
                  {isSignup 
                    ? 'Already have an account? Login' 
                    : 'Need an account? Sign Up'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
