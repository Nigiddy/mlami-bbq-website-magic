
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserCog, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

const UserRoles = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [promoting, setPromoting] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('email');

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setPromoting(true);

    try {
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: 'User not found',
            description: 'No user with this email exists in the system',
            variant: 'destructive',
          });
        } else {
          throw userError;
        }
        return;
      }

      if (existingUser?.role === 'admin') {
        toast({
          title: 'Already an admin',
          description: 'This user already has admin privileges',
          variant: 'default',
        });
        return;
      }

      // Call the set_user_as_admin function
      const { error: promotionError } = await supabase.rpc('set_user_as_admin', {
        user_email: email,
      });

      if (promotionError) throw promotionError;

      toast({
        title: 'Success!',
        description: `${email} has been promoted to admin`,
      });

      // Refresh the user list
      fetchUsers();
      // Clear the form
      setEmail('');
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to promote user',
        variant: 'destructive',
      });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="mr-2 h-6 w-6" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Promote users to admin or view existing roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Promote to Admin</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter a user's email to grant them admin privileges
              </p>
              
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Input
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>
                <Button 
                  onClick={promoteToAdmin} 
                  disabled={promoting}
                >
                  {promoting ? 'Promoting...' : 'Make Admin'}
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">User Roles</h3>
              {loading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-bbq-orange"></div>
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users found</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Admin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.full_name || '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 'outline'}
                            >
                              {user.role || 'user'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 flex justify-between text-sm text-gray-500">
          <p>Admin users have full access to the dashboard and can manage all resources</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserRoles;
