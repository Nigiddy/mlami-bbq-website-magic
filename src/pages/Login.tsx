
import React from 'react';
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
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const { signIn, isLoading, user } = useAuth();
  const location = useLocation();

  // If user is already logged in, redirect to the intended destination or admin
  if (user) {
    const redirectTo = location.state?.from?.pathname || "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
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
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
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
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : (
                    <>
                      Login <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
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
