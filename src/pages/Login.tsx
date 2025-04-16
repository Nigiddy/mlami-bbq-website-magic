
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { LockKeyhole } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Import the refactored components
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

// Import the schemas for TS type inference
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2)
});

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, isLoading, user, isAdmin, roleChecked } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/admin";

  // Effect to handle redirection after authentication is complete
  useEffect(() => {
    if (user && roleChecked) {
      console.log("Login page: User authenticated and role checked. isAdmin:", isAdmin);
      console.log("Redirecting to:", from);
      
      // Only navigate to admin if the user is an admin
      if (isAdmin || from !== "/admin") {
        navigate(from, { replace: true });
      } else {
        // If trying to access admin but not an admin, redirect to home
        console.log("User is not an admin, redirecting to home");
        navigate("/", { replace: true });
      }
    }
  }, [user, roleChecked, isAdmin, navigate, from]);

  // Handle signup
  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name
          }
        }
      });

      if (error) throw error;

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          id: data.user?.id,
          full_name: values.full_name,
          email: values.email,
          role: 'user' // Default role
        });

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
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      await signIn(values.email, values.password);
      // The redirection is handled in the useEffect above
    } catch (error) {
      // Error is already handled in AuthContext
    }
  };

  // Toggle between login and signup forms
  const toggleForm = () => setIsSignup(!isSignup);
  
  // Don't immediately redirect - wait for roleChecked to be true
  if (user && roleChecked) {
    console.log("Login rendering redirect to:", from);
    return <Navigate to={from} replace />;
  }

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
          
          <CardContent>
            {isSignup ? (
              <SignupForm 
                onSignup={handleSignup} 
                isLoading={isLoading} 
                onToggleForm={toggleForm}
              />
            ) : (
              <LoginForm 
                onLogin={handleLogin} 
                isLoading={isLoading} 
                onToggleForm={toggleForm}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
