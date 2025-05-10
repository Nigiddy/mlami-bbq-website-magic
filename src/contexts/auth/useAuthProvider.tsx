
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
        
        // Query the profiles table first as it's the most reliable source of role information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error getting profile:", profileError);
          // Fall back to user metadata if profile query fails
          const userRole = user.user_metadata?.role || 'user';
          setIsAdmin(userRole === 'admin');
          setIsCook(userRole === 'cook');
        } else {
          const userRole = profileData?.role || 'user';
          console.log("User role check:", user.email, userRole);
          
          // Set the correct role flags
          setIsAdmin(userRole === 'admin');
          setIsCook(userRole === 'cook');
          
          console.log("Role flags set:", {isAdmin: userRole === 'admin', isCook: userRole === 'cook'});
          
          // Update user metadata if it doesn't match the profile role
          if (user && (!user.user_metadata.role || user.user_metadata.role !== userRole)) {
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
        setIsCook(false);
        
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
