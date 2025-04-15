
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
  isAdmin: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has admin role
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        console.log("Checking role for user:", user.email);
        
        // First check if the user exists in the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          // If no profile found, create one with default role
          if (profileError.code === 'PGRST116') {
            console.log("Creating profile for user:", user.email);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: 'user', // Default role
                full_name: user.user_metadata?.full_name || ''
              });
            
            if (insertError) throw insertError;
            setIsAdmin(false);
          } else {
            throw profileError;
          }
        } else {
          const isUserAdmin = profileData?.role === 'admin';
          console.log("User role check:", user.email, isUserAdmin ? "admin" : profileData?.role);
          setIsAdmin(isUserAdmin);
        }
      } catch (error: any) {
        console.error("Error checking user role:", error);
        setIsAdmin(false);
      }
    };
    
    checkUserRole();
  }, [user]);

  useEffect(() => {
    // Set up initial session
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    // Set up listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect logic for authentication events
      if (event === 'SIGNED_IN') {
        // For sign-ins, we'll redirect in the signIn function for better control
        console.log("User signed in", session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out',
        });
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Login successful, user:", data.user?.email);

      // Redirect with state handling
      const from = location.state?.from?.pathname || "/admin";
      console.log("Redirecting after login to:", from);
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard',
      });
      
      // We don't navigate here - let the Login component handle redirection
      // This prevents race conditions with hooks
      
      return;
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Toast notification is handled in the onAuthStateChange listener
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
