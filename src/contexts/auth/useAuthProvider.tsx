
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCook, setIsCook] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check user role when user changes
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCook(false);
        setRoleChecked(true); // Mark role as checked even if no user
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
            setIsCook(false);
          } else {
            throw profileError;
          }
        } else {
          const userRole = profileData?.role || 'user';
          console.log("User role check:", user.email, userRole);
          
          // Fix: Set the correct role flags based on the actual role value
          setIsAdmin(userRole === 'admin');
          setIsCook(userRole === 'cook');
          
          console.log("Role flags set:", {isAdmin: userRole === 'admin', isCook: userRole === 'cook'});
          
          // Set role in user metadata for easy access
          if (user && !user.user_metadata.role) {
            await supabase.auth.updateUser({
              data: { role: userRole }
            });
          }
        }
      } catch (error: any) {
        console.error("Error checking user role:", error);
        setIsAdmin(false);
        setIsCook(false);
      } finally {
        setRoleChecked(true); // Mark role check as complete regardless of outcome
      }
    };
    
    // Reset role check when user changes (sign in/out)
    if (user) {
      setRoleChecked(false); // Reset before checking
      checkUserRole();
    } else {
      setIsAdmin(false);
      setIsCook(false);
      setRoleChecked(true); // No user, so role check is "complete"
    }
  }, [user]);

  // Set up initial session and auth state listener
  useEffect(() => {
    // Set up initial session
    const getSession = async () => {
      try {
        setIsLoading(true);
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
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in", session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        // Reset role check state when signing out
        setRoleChecked(false);
        setIsAdmin(false);
        
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

  // Auth methods
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Login successful, user:", data.user?.email);

      // Show success toast
      toast({
        title: 'Login Successful',
        description: 'Welcome to the dashboard',
      });
      
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

  return {
    user,
    session,
    signIn,
    signOut,
    isLoading,
    isAdmin,
    isCook,
    roleChecked
  };
}
